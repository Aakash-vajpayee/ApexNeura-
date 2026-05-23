import os, io, json
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi.responses import StreamingResponse
from pdf_generator import generate_report_pdf

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import ViTForImageClassification, AutoImageProcessor
import torch

from database import users_collection, reports_collection
from models import UserRegister, UserLogin, Token, ReportSave, ChatRequest, ClearRequest
from auth import hash_password, verify_password, create_token, get_current_user
from chat import chat as chat_with_bot, get_history as get_chat_history, clear_session

app = FastAPI(title="ApexNeura API", version="0.5.0")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000",
                   "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])

# ── AlzMind model ────────────────────────────────────────────────
print("Loading AlzMind model...")
ALZ_PATH      = "./models/alzmind_final"
alz_model     = ViTForImageClassification.from_pretrained(ALZ_PATH)
alz_processor = AutoImageProcessor.from_pretrained(ALZ_PATH)
alz_model.eval()
print("AlzMind ready!")

ALZ_LABELS = {0:"MildDemented",1:"ModerateDemented",2:"NonDemented",3:"VeryMildDemented"}
ALZ_RISK   = {"NonDemented":"LOW","VeryMildDemented":"MODERATE","MildDemented":"HIGH","ModerateDemented":"CRITICAL"}
ALZ_CDR    = {"NonDemented":"0","VeryMildDemented":"0.5","MildDemented":"1","ModerateDemented":"2"}

# ── DeepDown model ───────────────────────────────────────────────
DEEP_PATH      = "./models/deepdown_output/deepdown_final"
deep_model     = None
deep_config    = None
deep_available = False
DEEP_TRANSFORM = None

try:
    import timm
    from torchvision import transforms
    if os.path.exists(os.path.join(DEEP_PATH, 'model_weights.pth')):
        print("Loading DeepDown model...")
        with open(os.path.join(DEEP_PATH, 'config.json')) as f:
            deep_config = json.load(f)
        deep_model = timm.create_model('efficientnet_b4', pretrained=False,
                                       num_classes=deep_config['num_classes'])
        deep_model.load_state_dict(torch.load(
            os.path.join(DEEP_PATH, 'model_weights.pth'), map_location='cpu'))
        deep_model.eval()
        deep_available = True
        DEEP_TRANSFORM = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
        ])
        print(f"DeepDown ready! Classes: {deep_config['class_names']}")
    else:
        print("DeepDown model not found — training pending")
except Exception as e:
    print(f"DeepDown load error: {e}")

DEEP_RISK = {"Benign":"LOW","Indeterminate":"MODERATE","Malignant":"HIGH"}
DEEP_ICD  = {"Benign":"L98.9","Malignant":"C43.9","Indeterminate":"D48.5"}

# ─────────────────────────────────────────────────────────────────
# AUTH ENDPOINTS
# ─────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=Token)
async def register(body: UserRegister):
    existing = await users_collection.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "name":      body.name,
        "email":     body.email,
        "password":  hash_password(body.password),
        "createdAt": datetime.utcnow(),
    }
    result  = await users_collection.insert_one(user)
    user_id = str(result.inserted_id)
    token   = create_token({"sub": user_id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user_id, "name": body.name, "email": body.email}
    )


@app.post("/api/auth/login", response_model=Token)
async def login(body: UserLogin):
    user = await users_collection.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token   = create_token({"sub": user_id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user_id, "name": user["name"], "email": user["email"]}
    )


@app.get("/api/auth/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id":    str(current_user["_id"]),
        "name":  current_user["name"],
        "email": current_user["email"],
    }

# ─────────────────────────────────────────────────────────────────
# REPORT ENDPOINTS
# ─────────────────────────────────────────────────────────────────

@app.post("/api/reports/save")
async def save_report(body: ReportSave, current_user=Depends(get_current_user)):
    report = {
        "userId":         current_user["_id"],
        "module":         body.module,
        "classification": body.classification,
        "riskLevel":      body.riskLevel,
        "confidence":     body.confidence,
        "recommendation": body.recommendation,
        "icd10Code":      body.icd10Code,
        "findings":       body.findings,
        "symptoms":       body.symptoms,
        "createdAt":      datetime.utcnow(),
    }
    result = await reports_collection.insert_one(report)
    return {"id": str(result.inserted_id), "message": "Report saved!"}


@app.get("/api/reports/history")
async def reports_history(current_user=Depends(get_current_user)):
    cursor  = reports_collection.find(
        {"userId": current_user["_id"]}
    ).sort("createdAt", -1).limit(20)
    reports = []
    async for r in cursor:
        reports.append({
            "id":             str(r["_id"]),
            "module":         r["module"],
            "classification": r["classification"],
            "riskLevel":      r["riskLevel"],
            "confidence":     r["confidence"],
            "recommendation": r["recommendation"],
            "icd10Code":      r.get("icd10Code"),
            "findings":       r.get("findings", []),
            "symptoms":       r.get("symptoms"),
            "createdAt":      r["createdAt"].isoformat(),
        })
    return {"reports": reports, "total": len(reports)}


@app.delete("/api/reports/{report_id}")
async def delete_report(report_id: str, current_user=Depends(get_current_user)):
    result = await reports_collection.delete_one({
        "_id":    ObjectId(report_id),
        "userId": current_user["_id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted"}


@app.post("/api/reports/pdf")
async def generate_pdf(
    body: ReportSave,
    current_user=Depends(get_current_user)
):
    report_data = {
        "module":         body.module,
        "classification": body.classification,
        "riskLevel":      body.riskLevel,
        "confidence":     body.confidence,
        "recommendation": body.recommendation,
        "icd10Code":      body.icd10Code,
        "findings":       body.findings or [],
        "symptoms":       body.symptoms,
        "modelUsed":      f"ApexNeura {'AlzMind ViT' if body.module == 'alzmind' else 'DeepDown EfficientNet-B4'}",
    }

    pdf_bytes = generate_report_pdf(
        report_data=report_data,
        patient_name=current_user.get("name", "Patient")
    )

    filename = f"apexneura_{body.module}_report_{int(datetime.utcnow().timestamp())}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ─────────────────────────────────────────────────────────────────
# CHAT ENDPOINTS
# ─────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat_endpoint(body: ChatRequest):
    try:
        reply   = chat_with_bot(body.session_id, body.message, body.module)
        history = get_chat_history(body.session_id)
        turn    = len([m for m in history if m["role"] == "user"])
        return {"reply": reply, "history": history, "turn": turn}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/clear")
async def clear_chat(body: ClearRequest):
    clear_session(body.session_id)
    return {"message": "Session cleared"}


@app.get("/api/chat/history/{session_id}")
async def chat_history(session_id: str):
    return {"history": get_chat_history(session_id)}

# ─────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {
        "status":   "ok",
        "version":  "0.5.0",
        "alzmind":  "ready",
        "deepdown": "ready" if deep_available else "training pending",
        "database": "MongoDB Atlas",
        "chat":     "NeuraBot ready",
        "pdf":      "reportlab ready",
    }

# ─────────────────────────────────────────────────────────────────
# AI ANALYSIS ENDPOINTS
# ─────────────────────────────────────────────────────────────────

@app.post("/api/alzmind/analyze")
async def alzmind_analyze(
    file:     UploadFile     = File(...),
    symptoms: Optional[str] = Form(None)
):
    raw  = await file.read()
    img  = Image.open(io.BytesIO(raw)).convert("RGB")
    inp  = alz_processor(images=img, return_tensors="pt")
    with torch.no_grad():
        logits = alz_model(**inp).logits
    probs      = torch.softmax(logits, dim=-1)[0]
    pred_idx   = probs.argmax().item()
    label      = ALZ_LABELS.get(pred_idx, "Unknown")
    confidence = round(probs[pred_idx].item() * 100, 1)

    return {
        "classification":       label,
        "riskLevel":            ALZ_RISK.get(label, "MODERATE"),
        "confidence":           confidence,
        "cdrScore":             ALZ_CDR.get(label, "N/A"),
        "neuroimagingFindings": [
            f"Classification: {label} ({confidence}% confidence)",
            f"Symptoms: {symptoms}" if symptoms else "No symptoms provided",
        ],
        "brainRegionsAffected": ["Hippocampus","Entorhinal Cortex"] if label != "NonDemented" else [],
        "recommendation": (
            "Immediate neurologist consultation required."
            if ALZ_RISK.get(label) in ("HIGH","CRITICAL")
            else "Routine follow-up recommended."
        ),
        "icd10Code":  "G30.1" if label != "NonDemented" else "Z00.0",
        "modelUsed":  "AlzMind ViT — Local",
        "timestamp":  datetime.utcnow().isoformat(),
        "disclaimer": "PROTOTYPE ONLY — Not for clinical use.",
    }


@app.post("/api/deepdown/analyze")
async def deepdown_analyze(
    file:     UploadFile     = File(...),
    symptoms: Optional[str] = Form(None)
):
    if not deep_available:
        return {
            "classification":     "Model Training In Progress",
            "riskLevel":          "LOW",
            "confidence":         0,
            "dermoscopyFindings": ["DeepDown model abhi train ho raha hai"],
            "recommendation":     "Model ready hone ke baad dobara try karein.",
            "icd10Code":          "Z00.0",
            "modelUsed":          "DeepDown — Pending",
            "timestamp":          datetime.utcnow().isoformat(),
            "disclaimer":         "PROTOTYPE ONLY — Not for clinical use.",
        }

    raw    = await file.read()
    img    = Image.open(io.BytesIO(raw)).convert("RGB")
    tensor = DEEP_TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        logits = deep_model(tensor)
    probs      = torch.softmax(logits, dim=-1)[0]
    pred_idx   = probs.argmax().item()
    label      = deep_config['class_names'][pred_idx]
    confidence = round(probs[pred_idx].item() * 100, 1)
    all_probs  = {
        deep_config['class_names'][i]: round(probs[i].item() * 100, 1)
        for i in range(len(deep_config['class_names']))
    }

    return {
        "classification":     label,
        "riskLevel":          DEEP_RISK.get(label, "MODERATE"),
        "confidence":         confidence,
        "allProbabilities":   all_probs,
        "dermoscopyFindings": [
            f"Primary classification: {label} ({confidence}% confidence)",
            f"Benign probability: {all_probs.get('Benign',0)}%",
            f"Malignant probability: {all_probs.get('Malignant',0)}%",
            f"Symptoms: {symptoms}" if symptoms else "No symptoms provided",
        ],
        "recommendation": (
            "URGENT: Consult a certified dermatologist immediately."
            if DEEP_RISK.get(label) == "HIGH"
            else "Schedule a dermatology consultation for evaluation."
        ),
        "icd10Code":  DEEP_ICD.get(label, "L98.9"),
        "modelUsed":  "DeepDown EfficientNet-B4 — Local",
        "timestamp":  datetime.utcnow().isoformat(),
        "disclaimer": "PROTOTYPE ONLY — Not for clinical use.",
    }
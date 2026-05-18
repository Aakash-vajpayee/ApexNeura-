import os, io
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import ViTForImageClassification, AutoImageProcessor
import torch
import json

app = FastAPI(title="ApexNeura API", version="0.3.0")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"], allow_headers=["*"])

# ── AlzMind — Load local ViT model ───────────────────────────────
print("Loading AlzMind model...")
ALZ_PATH      = "./models/alzmind_final"
alz_model     = ViTForImageClassification.from_pretrained(ALZ_PATH)
alz_processor = AutoImageProcessor.from_pretrained(ALZ_PATH)
alz_model.eval()
print("AlzMind ready!")

ALZ_LABELS = {0:"MildDemented", 1:"ModerateDemented", 2:"NonDemented", 3:"VeryMildDemented"}
ALZ_RISK   = {"NonDemented":"LOW","VeryMildDemented":"MODERATE","MildDemented":"HIGH","ModerateDemented":"CRITICAL"}
ALZ_CDR    = {"NonDemented":"0","VeryMildDemented":"0.5","MildDemented":"1","ModerateDemented":"2"}

# ── DeepDown — Load EfficientNet-B4 (jab model aaye tab) ─────────
DEEP_PATH = "./models/deepdown_output/deepdown_final"
deep_model     = None
deep_config    = None
deep_available = False

try:
    import timm
    from torchvision import transforms

    if os.path.exists(os.path.join(DEEP_PATH, 'model_weights.pth')):
        print("Loading DeepDown model...")
        with open(os.path.join(DEEP_PATH, 'config.json')) as f:
            deep_config = json.load(f)

        deep_model = timm.create_model(
            'efficientnet_b4', pretrained=False,
            num_classes=deep_config['num_classes']
        )
        deep_model.load_state_dict(
            torch.load(os.path.join(DEEP_PATH, 'model_weights.pth'),
                      map_location='cpu')
        )
        deep_model.eval()
        deep_available = True
        print(f"DeepDown ready! Classes: {deep_config['class_names']}")
    else:
        print("DeepDown model not found — training pending")
except Exception as e:
    print(f"DeepDown load error: {e}")

# DeepDown image transform
DEEP_TRANSFORM = None
if deep_available:
    from torchvision import transforms
    DEEP_TRANSFORM = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
    ])

DEEP_RISK = {
    "Benign":        "LOW",
    "Indeterminate": "MODERATE",
    "Malignant":     "HIGH"
}
DEEP_ICD = {
    "Benign":        "L98.9",
    "Malignant":     "C43.9",
    "Indeterminate": "D48.5"
}

# ── Health check ─────────────────────────────────────────────────
@app.get("/")
def health():
    return {
        "status":    "ok",
        "alzmind":   "local ViT model",
        "deepdown":  "ready" if deep_available else "training pending"
    }

# ── AlzMind endpoint ─────────────────────────────────────────────
@app.post("/api/alzmind/analyze")
async def alzmind_analyze(
    file: UploadFile = File(...),
    symptoms: Optional[str] = Form(None)
):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")

    inputs = alz_processor(images=img, return_tensors="pt")
    with torch.no_grad():
        logits = alz_model(**inputs).logits

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
            f"Symptoms: {symptoms}" if symptoms else "No symptoms provided"
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
        "disclaimer": "PROTOTYPE ONLY — Not for clinical use."
    }

# ── DeepDown endpoint ────────────────────────────────────────────
@app.post("/api/deepdown/analyze")
async def deepdown_analyze(
    file: UploadFile = File(...),
    symptoms: Optional[str] = Form(None)
):
    # Jab tak model train ho raha hai
    if not deep_available:
        return {
            "classification":     "Model Training In Progress",
            "riskLevel":          "LOW",
            "confidence":         0,
            "dermoscopyFindings": ["DeepDown EfficientNet-B4 model abhi train ho raha hai Colab mein"],
            "recommendation":     "Model ready hone ke baad dobara try karein.",
            "icd10Code":          "Z00.0",
            "modelUsed":          "DeepDown — Training Pending",
            "timestamp":          datetime.utcnow().isoformat(),
            "disclaimer":         "PROTOTYPE ONLY — Not for clinical use."
        }

    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")

    tensor = DEEP_TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        logits = deep_model(tensor)

    probs      = torch.softmax(logits, dim=-1)[0]
    pred_idx   = probs.argmax().item()
    label      = deep_config['class_names'][pred_idx]
    confidence = round(probs[pred_idx].item() * 100, 1)

    # All class probabilities
    all_probs = {
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
            f"Benign probability: {all_probs.get('Benign', 0)}%",
            f"Malignant probability: {all_probs.get('Malignant', 0)}%",
            f"Symptoms: {symptoms}" if symptoms else "No symptoms provided"
        ],
        "recommendation": (
            "URGENT: Consult a certified dermatologist immediately."
            if DEEP_RISK.get(label) == "HIGH"
            else "Schedule a dermatology consultation for evaluation."
        ),
        "icd10Code":  DEEP_ICD.get(label, "L98.9"),
        "modelUsed":  "DeepDown EfficientNet-B4 — Local",
        "timestamp":  datetime.utcnow().isoformat(),
        "disclaimer": "PROTOTYPE ONLY — Not for clinical use."
    }
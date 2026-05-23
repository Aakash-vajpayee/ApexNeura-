from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth Models ───────────────────────────────────────────────────
class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class UserResponse(BaseModel):
    id:    str
    name:  str
    email: str

class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse

# ── Report Models ─────────────────────────────────────────────────
class ReportSave(BaseModel):
    module:         str
    classification: str
    riskLevel:      str
    confidence:     float
    recommendation: str
    icd10Code:      Optional[str]       = None
    findings:       Optional[List[str]] = []
    symptoms:       Optional[str]       = None

class ReportResponse(BaseModel):
    id:             str
    module:         str
    classification: str
    riskLevel:      str
    confidence:     float
    recommendation: str
    icd10Code:      Optional[str] = None
    findings:       List[str]     = []
    symptoms:       Optional[str] = None
    createdAt:      datetime

# ── Chat Models ───────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message:    str
    module:     str = "general"

class ClearRequest(BaseModel):
    session_id: str
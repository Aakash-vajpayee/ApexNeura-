# Neurapex AI

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Neurapex AI Banner" width="100%" />
</p>

<p align="center">
  <b>AI-Powered Healthcare Platform for Skin Disease & Alzheimer MRI Analysis</b>
</p>

<p align="center">
  Built with React, FastAPI, HuggingFace & Medical AI Workflows
</p>

---

# Overview

Neurapex AI is a full-stack AI healthcare platform designed to assist in:

* Skin lesion classification
* Alzheimer MRI analysis
* AI-assisted symptom support
* Medical imaging workflows
* Future RAG-powered healthcare assistance

The platform combines a modern React frontend with a scalable FastAPI backend integrated with HuggingFace AI models.

---

# Features

## DeepDown — Skin Disease Analysis

* AI-powered skin lesion classification
* Risk-level prediction
* ICD-10 mapping
* Medical recommendation generation
* HuggingFace image classification integration

## AlzMind — Alzheimer MRI Analysis

* MRI-based Alzheimer risk prediction
* Cognitive risk classification
* Neuroimaging findings generation
* Structured medical reporting
* Future DICOM/NIfTI support

## AI Healthcare Backend

* FastAPI async architecture
* Image preprocessing pipeline
* AI inference handling
* Structured JSON responses
* Scalable API design

## Future Roadmap

* LangChain RAG integration
* Gemini/Llama medical assistant
* MongoDB report history
* Authentication system
* HIPAA-aware deployment architecture
* 3D MRI processing pipeline

---

# Tech Stack

| Layer            | Technology          |
| ---------------- | ------------------- |
| Frontend         | React + Vite        |
| Backend          | FastAPI             |
| AI Models        | HuggingFace         |
| Language         | Python + JavaScript |
| Image Processing | Pillow + NumPy      |
| Future NLP       | LangChain + Gemini  |
| Database         | MongoDB             |
| Vector DB        | ChromaDB / Pinecone |
| Deployment       | Vercel + Render     |

---

# Project Structure

```bash
Neurapex-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── scripts/
│       ├── train_deepdown.py
│       ├── train_alzmind.py
│       ├── setup_rag.py
│       └── export_final_model.py
│
├── README.md
└── .gitignore
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Neurapex-AI.git
cd Neurapex-AI
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

# Environment Variables

Create a `.env` file inside the backend folder:

```env
HF_API_KEY=your_huggingface_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

# Run Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend API:

```bash
http://localhost:8000
```

Swagger Docs:

```bash
http://localhost:8000/docs
```

---

# API Endpoints

| Endpoint                | Description            |
| ----------------------- | ---------------------- |
| `/api/deepdown/analyze` | Skin lesion analysis   |
| `/api/alzmind/analyze`  | Alzheimer MRI analysis |
| `/api/chat`             | NLP medical assistant  |
| `/api/models`           | Available AI models    |

---

# AI Models

## Skin Disease Model

Current prototype:

```bash
dima806/skin_types_image_detection
```

Future training:

* ISIC Archive dataset
* ResNet-50
* EfficientNet-B4

---

## Alzheimer MRI Model

Current prototype:

```bash
Falah/Alzheimer_MRI
```

Future training:

* ADNI dataset
* Vision Transformer (ViT)
* 3D-CNN architecture

---

# Screenshots

## Dashboard

![alt text](image.png)

## API Docs

*Add FastAPI Swagger screenshot here*

---

# Future Enhancements

* AI medical chatbot
* Multi-model inference
* MRI segmentation pipeline
* Medical report export
* Authentication system
* Cloud deployment
* Research paper RAG assistant
* Clinical workflow integration

---

# Deployment

## Frontend Deployment

Recommended:

* Vercel

## Backend Deployment

Recommended:

* Render
* Railway
* AWS

---

# Important Disclaimer

⚠️ This project is a research and educational prototype.

It is NOT intended for clinical diagnosis or real-world medical decision-making.
Always consult certified healthcare professionals for medical evaluation.

---

# Contributing

Contributions, ideas, and improvements are welcome.

Feel free to fork the repository and submit pull requests.

---

# Author

## Aakash Vajpayee

AI & Full Stack Developer

* React Developer
* FastAPI Backend Developer
* AI/ML Enthusiast
* Healthcare AI Research Projects

---

# License

This project is licensed under the MIT License.

---

# Repository Topics

```bash
react
fastapi
machine-learning
ai
medical-ai
huggingface
python
healthcare
mri-analysis
computer-vision
```

---

# Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

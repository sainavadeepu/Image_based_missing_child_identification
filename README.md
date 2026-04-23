# 🔍 Missing Child Identification System (MCIS)

> An AI-powered full-stack application using facial recognition to help identify and locate missing children.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL+pgvector-336791)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)](https://www.docker.com/)

---

## 📁 Folder Structure

```
Missingchild/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings (pydantic-settings)
│   ├── database.py             # SQLAlchemy async + pgvector
│   ├── models.py               # ORM models (Child, SearchLog)
│   ├── schemas.py              # Pydantic schemas
│   ├── auth.py                 # JWT authentication
│   ├── routers/
│   │   ├── auth_router.py      # POST /auth/login
│   │   ├── register.py         # POST /register/
│   │   ├── search.py           # POST /search/
│   │   └── reports.py          # GET /children, GET /reports
│   ├── services/
│   │   ├── face_detection.py   # YOLOv8 + OpenCV fallback
│   │   ├── face_recognition.py # DeepFace FaceNet512 embeddings
│   │   └── similarity.py       # pgvector cosine similarity search
│   ├── utils/
│   │   └── image_validation.py # Size, extension, format validation
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_main.py        # pytest test suite
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React (Vite) web app
│   ├── src/
│   │   ├── components/Navbar   # Sticky responsive navbar
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Hero + features
│   │   │   ├── Register.jsx    # Child registration form
│   │   │   ├── Search.jsx      # Face search + results
│   │   │   ├── Reports.jsx     # Admin dashboard
│   │   │   └── Login.jsx       # JWT login
│   │   ├── services/api.js     # Axios API layer
│   │   └── theme.css           # Design system
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql              # Tables + pgvector + IVFFlat index
│   └── init_db.py              # Standalone DB init script
├── dataset/
│   ├── prepare_lfw_sample.py   # LFW dataset prep (10 identities)
│   └── evaluate.py             # Accuracy / precision / recall / F1
├── models/
│   └── download_models.py      # Pre-download AI models
├── docker-compose.yml          # PostgreSQL + Backend
└── .gitignore
```

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / open the project
```bash
cd Missingchild
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and change SECRET_KEY, ADMIN_PASSWORD
```

### 3. Start services
```bash
docker-compose up --build -d
```

### 4. Access
| Service | URL |
|---------|-----|
| API docs | http://localhost:8000/docs |
| Backend  | http://localhost:8000 |

---

## 🛠️ Local Development Setup

### Backend

```bash
# Python 3.11+ required
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Copy env
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Start PostgreSQL separately (with pgvector):
docker run -d --name mcis-pg -e POSTGRES_DB=mcis_db -e POSTGRES_USER=mcis_user \
  -e POSTGRES_PASSWORD=mcis_password -p 5432:5432 pgvector/pgvector:pg16

# Init database
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# Download AI models (first run)
python ../models/download_models.py

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Create env file
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# Open http://localhost:5173
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | None | Get JWT token |
| `POST` | `/register/` | JWT | Register missing child with image |
| `POST` | `/search/` | None | Search for child by image |
| `GET` | `/children` | None | List all registered children |
| `GET` | `/reports` | JWT | Stats + search logs |
| `PATCH` | `/register/{id}/status` | JWT | Mark child found/missing |
| `GET` | `/health` | None | Health check |
| `GET` | `/docs` | None | Swagger UI |

### Register a child (example)
```bash
curl -X POST http://localhost:8000/register/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Ravi Kumar" -F "age=8" -F "gender=male" \
  -F "last_seen_location=Delhi, India" \
  -F "contact_number=+91-9876543210" \
  -F "image=@photo.jpg"
```

### Search for a child
```bash
curl -X POST http://localhost:8000/search/ \
  -F "image=@found_child.jpg"
```

---

## 🧠 AI Pipeline

```
Upload Image
     │
     ▼
YOLOv8 Face Detection ──(no face)──► Error 422
     │
     ▼
DeepFace (FaceNet512) Embedding
     │  512-dimensional vector
     ▼
pgvector Cosine Similarity Search
     │  embedding <=> query_embedding
     ▼
Top-N matches below threshold
     │
     ▼
Ranked results with confidence %
```

**Default threshold**: `0.55` cosine distance (configurable in `.env`)

---

## 🧪 Running Tests

```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

---

## 📊 Dataset Evaluation

```bash
cd dataset
pip install scikit-learn matplotlib seaborn pillow
python prepare_lfw_sample.py   # Downloads LFW, creates 10 sample identities
python evaluate.py             # Runs evaluation, prints metrics + confusion matrix
```

---

## 🌐 Deployment

### Backend → Railway / Render

1. Push code to GitHub
2. Create new service on [Railway](https://railway.app/) or [Render](https://render.com/)
3. Add PostgreSQL addon (or use Supabase with pgvector)
4. Set environment variables from `.env.example`
5. Deploy

### Frontend → Vercel

```bash
cd frontend
npm i -g vercel
vercel --prod
# Set VITE_API_URL=https://your-backend-url.railway.app
```

---

## 🔐 Security Features

- **JWT Authentication** — Admin-only endpoints protected
- **Rate Limiting** — 30 requests/minute per IP (configurable)
- **Image Validation** — Size limit (10 MB), extension whitelist, binary validation
- **SQL Injection Safe** — SQLAlchemy ORM + parameterized pgvector queries
- **CORS** — Configurable allowed origins

---

## ⚙️ Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection |
| `SECRET_KEY` | (change this!) | JWT signing key |
| `ADMIN_USERNAME` | `admin` | Admin login username |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |
| `SIMILARITY_THRESHOLD` | `0.55` | Cosine distance cutoff (lower = stricter) |
| `TOP_K_RESULTS` | `5` | Max matches to return |
| `DEEPFACE_MODEL` | `Facenet512` | Embedding model: `Facenet512`, `ArcFace`, `VGG-Face` |
| `MAX_IMAGE_SIZE_MB` | `10` | Maximum upload size |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `pytest tests/ -v`
4. Submit a pull request

---

*Built with FastAPI, React, DeepFace, pgvector, and YOLOv8*

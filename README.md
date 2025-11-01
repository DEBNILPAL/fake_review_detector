# TrustLens: Fake Review Detector

A full-stack app integrating a React frontend with a Node.js/Express backend and a Python deep-learning inference service. It analyzes product reviews, shows analytics, and provides interactive graphs.

## Tech Stack
- Frontend: React (Vite), MUI, Axios, Framer Motion
- Backend: Node.js (Express), PostgreSQL, `child_process` for Python
- ML: Python (Keras, scikit-learn), served via `inference_service.py`

## Monorepo Structure
```
.
├─ frontend/           # React app (Vite)
├─ backend/            # Express API and DB
├─ deep learning/      # Python model & inference_service.py
├─ netlify.toml        # Netlify static deployment for frontend
├─ render.yaml         # Render.com services (frontend+backend)
└─ .gitignore
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running and reachable
- Python 3.10+ with a virtual environment and your trained artifacts

### Backend
1. Copy `backend/.env` and set:
```
DB_USER=postgres
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Fake_Review_Detector
PYTHON_PATH=f:\\hackspire\\deep learning\\.venv\\Scripts\\python.exe
INFERENCE_SCRIPT=e:\\hackspire\\deep learning\\inference_service.py
```
2. Install and run:
```
cd backend
npm install
node server.js
```
- Server: http://localhost:3000
- Ensures DB schema on startup.

### Frontend
```
cd frontend
npm install
npm run dev
```
- App: http://localhost:5173
- Configure `VITE_BACKEND_URL` in `frontend/.env` if needed (defaults to http://localhost:3000).

## Production Deployment

### Netlify (Frontend)
- `netlify.toml` already configured to build from `frontend/` and publish `dist/`.
- SPA redirect is included.
- Set `VITE_BACKEND_URL` as a Netlify environment variable pointed to your backend.

### Render.com
- `render.yaml` defines two services:
  - `hackspire-backend`: Node web service running Express on default port (configure DB and ML env vars).
  - `hackspire-frontend`: Static site served with `serve` from `frontend/dist`.
- Set environment variables in Render dashboard:
  - Backend: `DB_*`, `PYTHON_PATH`, `INFERENCE_SCRIPT`
  - Frontend: `VITE_BACKEND_URL` to the backend’s public URL

## API Summary (Backend)
- POST `/api/signup` { username, email, password }
- POST `/api/login` { email, password }
- GET `/api/analytics` → { total_rows, avg_rating, avg_review_length }
- GET `/api/reviews` → latest DB reviews
- POST `/submit_review` { userId, client_name, rating, reviewText }
- POST `/api/predict` { text, rating, productId, reviewerId } → ML inference
- GET `/api/review-analysis` → global saved analyses
- GET `/api/review-analysis?email=...` → user-specific analyses

## Notes
- Ensure your Python environment paths and model files match the `.env`.
- If DB schema errors occur, restart backend to run auto-migration.
- For production, secure credentials and never commit `.env` files.

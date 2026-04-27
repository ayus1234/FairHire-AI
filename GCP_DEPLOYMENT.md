# Google Cloud Deployment Guide

Follow these steps to deploy **FairHire AI** to Google Cloud Platform.

## ☁️ Backend: Google Cloud Run

Google Cloud Run is the perfect choice for a scalable, serverless backend.

### 1. Build and Push Docker Image
Run these commands from the `backend/` directory:
```bash
gcloud auth configure-docker
docker build -t gcr.io/YOUR_PROJECT_ID/fairhire-backend .
docker push gcr.io/YOUR_PROJECT_ID/fairhire-backend
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy fairhire-backend \
  --image gcr.io/YOUR_PROJECT_ID/fairhire-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
*Note the URL provided after deployment (e.g., `https://fairhire-backend-xyz.a.run.app`). You will need this for the frontend.*

---

## 🧱 Frontend: Google Cloud Storage (Static Hosting)

### 1. Configure the API URL
Update the `VITE_API_URL` in your frontend configuration to point to your **Cloud Run URL**:
Create or update `frontend/.env`:
```text
VITE_API_URL=https://your-cloud-run-url.a.run.app
```

### 2. Build the Frontend
```bash
cd frontend
npm install
npm run build
```

### 3. Deploy to GCS Bucket
Run these commands to host the static site:
```bash
# Create the bucket
gcloud storage buckets create gs://fairhire-frontend-yourname

# Make it public
gsutil iam ch allUsers:objectViewer gs://fairhire-frontend-yourname

# Upload the build files (from the dist/ folder)
cd dist
gsutil -m cp -r * gs://fairhire-frontend-yourname

# Enable static hosting
gsutil web set -m index.html -e index.html gs://fairhire-frontend-yourname
```

### 🌍 Access Your App
Open your browser at:
`https://storage.googleapis.com/fairhire-frontend-yourname/index.html`

---

## 🏆 Deployment Checklist
- [ ] Backend URL updated in frontend `.env`
- [ ] Gemini API Key set in Cloud Run environment variables
- [ ] Static hosting enabled on GCS bucket
- [ ] CORS allowed (Default is "*" in this project, ensuring compatibility)

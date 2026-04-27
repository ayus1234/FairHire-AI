# ⚖️ FairHire AI
**AI Bias Detector for Ethical Hiring Decisions**

[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge_2026-blue.svg)](https://developers.google.com/community/gdsc-solution-challenge)
[![Built with Gemini](https://img.shields.io/badge/Built_with-Gemini_2.5_Flash-green.svg)](https://ai.google.dev/)
[![GCP Hosted](https://img.shields.io/badge/Hosted_on-Google_Cloud-4285F4.svg)](https://cloud.google.com/)

Organizations increasingly use automated hiring systems to screen and shortlist candidates. However, if these systems are trained on biased historical data, they unintentionally discriminate based on gender, demographic categories, or hidden proxy variables.

**FairHire AI** is an intelligent auditing platform that evaluates hiring datasets and recruitment decisions for bias. We do not replace hiring tools—we verify whether they are fair, transparent, and legally accountable.

---

## 🌟 Key Features
* **Global Dataset Audit**: Instantly calculate mathematically rigorous fairness metrics (Disparate Impact & Statistical Parity) across thousands of dataset records.
* **Explainable AI (XAI)**: Leverage **Google Gemini 2.5 Flash** to generate interactive, human-readable "Audit Traces" explaining the precise risks behind an individual algorithm's decision.
* **Decision Driver Analysis**: Built-in `scikit-learn` Random Forest algorithms automatically identify the most influential proxy variables driving selection rates.
* **Corporate Reporting**: Instant PDF generation and exporting for both Global Trends and Individual AI Traces.
* **Solution Challenge Optimized**: Designed with Web Accessibility (ARIA tags), comprehensive Test-Driven Development (TDD), and enterprise monitoring logs.

---

## 📸 MVP Snapshots

1. **Global Fairness Analytics**
![Global Audit Metric Dashboard](screenshots/global_audit.png?v=3)

2. **Gemini Explicit AI Audit Trace**
![XAI Individual Report](screenshots/xai_report.png?v=4)

3. **Dataset Comparison Analysis**
![Dataset Comparison View](screenshots/comparison_view.png?v=3)

---

## 🏗️ Architecture Stack
Our platform is fully built for **Google Cloud Deployment**, establishing an enterprise-ready microservice architecture.

* **Frontend**: React.js / Vite (Tailwind CSS, Framer Motion) → *Google Cloud Storage*
* **Backend API**: FastAPI (Python) → *Google Cloud Run*
* **Dynamic Database**: Database-Agnostic SQLAlchemy setup. Uses local `SQLite` for rapid testing, instantly scaling to `PostgreSQL` (*Google Cloud SQL*) via environment variables.
* **Auditing Engine**: Google Gemini API (`models/gemini-2.5-flash`)

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ayus1234/FairHire-AI.git
cd FairHire-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
```
**Environment Variables**: Create a `.env` file in the `/backend` folder.
```env
GEMINI_API_KEY=your_google_gemini_api_key
# DATABASE_URL=postgresql://user:password@localhost/dbname (Optional: For Production Cloud SQL)
```
**Run the Server**:
```bash
python main.py
```
*(Runs locally on `http://127.0.0.1:8001` with real-time audit logging enabled)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Runs locally on `http://localhost:5173`)*

---

## 🧪 Automated Testing
The architectural logic is validated via automated testing (TDD) to prove statistical accuracy.
```bash
cd backend
python -m pytest tests/test_bias_logic.py
```

---

## ☁️ Google Cloud Deployment
For complete step-by-step instructions on deploying the React Frontend to **Google Cloud Storage** and the FastAPI Backend to **Google Cloud Run**, please refer to the `GCP_DEPLOYMENT.md` guide.

---
*Built with ❤️ for the Google Solution Challenge by Team Latent Legends.*

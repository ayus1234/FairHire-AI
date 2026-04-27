# ⚖️ FairHire AI
**AI Bias Detector for Ethical Hiring Decisions**

[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge_2026-blue.svg)](https://developers.google.com/community/gdsc-solution-challenge)
[![Built with Gemini](https://img.shields.io/badge/Built_with-Gemini_2.5_Flash-green.svg)](https://ai.google.dev/)
[![GCP Hosted](https://img.shields.io/badge/Hosted_on-Google_Cloud-4285F4.svg)](https://cloud.google.com/)

Organizations increasingly use automated hiring systems to screen and shortlist candidates. However, if these systems are trained on biased historical data, they unintentionally discriminate based on gender, demographic categories, or hidden proxy variables.

**FairHire AI** is an intelligent auditing platform that evaluates hiring datasets and recruitment decisions for bias. We do not replace hiring tools—we verify whether they are fair, transparent, and legally accountable.

---

## 🌟 Key Features
* **Global Dataset Audit**: Instantly calculate Disparate Impact and Statistical Parity across thousands of hiring records.
* **Explainable AI (XAI)**: Leverage Google **Gemini 2.5 Flash** to generate human-readable "Audit Traces" that explain *why* specific hiring decisions may be biased.
* **ML Decision Drivers**: Built-in `Scikit-Learn` Random Forest analysis to mathematically prove which demographic or skill features drove the hiring algorithm's choices.
* **Compliance Ready**: Generate and export branded PDF Fairness Audit Reports for corporate compliance archiving.

---

## 🏗️ Architecture Stack
Our platform is fully optimized for **Google Cloud Deployment**.

* **Frontend**: React.js / Vite (Tailwind CSS, Recharts) → *Google Cloud Storage*
* **Backend**: FastAPI (Python) → *Google Cloud Run*
* **Database**: SQLite (Local MVP) / PostgreSQL → *Google Cloud SQL*
* **AI Engine**: Google Gemini API (`models/gemini-2.5-flash`)

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
```
**Run the Server**:
```bash
python main.py
```
*(Runs locally on `http://127.0.0.1:8001`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Runs locally on `http://localhost:5173`)*

---

## 🧪 Testing
The architecture follows Test-Driven Development (TDD). To verify the algorithmic fairness math logic:
```bash
cd backend
python -m pytest tests/test_bias_logic.py
```

---

## ☁️ Google Cloud Deployment
For instructions on deploying the React Frontend to **Google Cloud Storage** and the FastAPI Backend to **Google Cloud Run**, please refer to the `GCP_DEPLOYMENT.md` guide.

---
*Built with ❤️ for the Google Solution Challenge by Team Latent Legends.*

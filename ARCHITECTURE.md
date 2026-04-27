# FairHire AI: System Architecture

The following diagram illustrates the enterprise-grade architecture of the **FairHire AI Bias Auditor**, optimized for Google Cloud deployment.

```mermaid
graph TD
    User((User/HR Auditor)) -->|Uploads CSV| Frontend[Frontend: React + Vite]
    Frontend -->|POST /analyze| Backend[Backend API: FastAPI / Python]
    
    subgraph "Google Cloud Platform"
        subgraph "Frontend Layer (Static)"
            GCS[Google Cloud Storage]
            Frontend -.->|Hosted on| GCS
        end
        
        subgraph "Backend Layer (Serverless)"
            GCR[Google Cloud Run]
            Backend -.->|Runs on| GCR
        end
        
        subgraph "Intelligence & Persistence"
            Gemini[Google Gemini 2.5 Flash API]
            SQLite[(Local Audit Database)]
            Pandas[Data Analysis: Pandas/SKLearn]
            
            Backend --> Gemini
            Backend --> SQLite
            Backend --> Pandas
        end
    end
    
    Backend -->|Returns Metrics + AI Report| Frontend
    Frontend -->|Generates| PDF[Exportable PDF Compliance Report]
```

## Component Breakdown

1.  **Frontend (React/Vite)**: A high-end glassmorphic dashboard built with Framer Motion and Recharts for visual impact.
2.  **Backend (FastAPI)**: A robust Python API specialized in demographic fairness auditing.
3.  **Bias Analysis (Pandas/SKLearn)**: Uses Disparate Impact and Statistical Parity metrics to quantify bias levels.
4.  **Generative AI (Gemini)**: Provides human-readable ethical explanations and actionable remediation steps.
5.  **Deployment**: Hybrid cloud architecture using serverless components (Cloud Run) and globally scalable static hosting (Cloud Storage).

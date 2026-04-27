import warnings
# Global suppression for persistent SDK warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*google.generativeai.*")

import os
import pandas as pd
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import io
import json
import datetime
import logging
from sqlalchemy import create_engine, Column, Integer, Float, String, JSON, DateTime, Text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

# SUPPRESS DEPRECATION WARNINGS
logging.getLogger("google.generativeai").setLevel(logging.ERROR)

# Database Configuration (Dynamic for Local SQLite or Cloud PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./audits.db")

# Use 'check_same_thread' only for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base is defined below via DeclarativeBase for modern SQLAlchemy 2.0 compatibility

# --- AI CONFIGURATION ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)
# Use the specified high-performance model available in your environment
model = genai.GenerativeModel('models/gemini-2.5-flash')

# Permissive Safety Settings for Ethical Auditing
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

class Base(DeclarativeBase):
    pass

class AuditRecord(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    privileged_group = Column(String)
    privileged_selection_rate = Column(Float)
    metrics = Column(JSON)
    overall_bias = Column(Float)
    ai_explanation = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class ComparisonRecord(Base):
    __tablename__ = "comparisons"
    id = Column(Integer, primary_key=True)
    filename_a = Column(String)
    filename_b = Column(String)
    score_a = Column(Float)
    score_b = Column(Float)
    ai_comparison = Column(Text)
    raw_data_a = Column(JSON)
    raw_data_b = Column(JSON)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

Base.metadata.create_all(bind=engine)

import logging
import time

# Analytics and Audit Logging
def audit_log(message):
    print(f"INFO:     [AUDIT] {message}")

app = FastAPI(title="FairHire AI - Ethical Audit Engine")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResult(BaseModel):
    bias_score: float
    disparate_impact: float
    statistical_parity: float
    report: str
    visual_data: dict

def detect_bias(df: pd.DataFrame, target_col: str, protected_col: str):
    # Assume 1 is 'Hired' or 'Selected', 0 is not
    groups = df.groupby(protected_col)[target_col].agg(['count', 'sum'])
    groups['selection_rate'] = groups['sum'] / groups['count']
    
    # Simple selection: find the group with the highest selection rate as privileged
    privileged_group = groups['selection_rate'].idxmax()
    privileged_sr = groups.loc[privileged_group, 'selection_rate']
    
    results = {}
    for group, row in groups.iterrows():
        if group == privileged_group:
            continue
        
        protected_sr = row['selection_rate']
        
        # Disparate Impact Ratio
        di_ratio = protected_sr / privileged_sr if privileged_sr > 0 else 1.0
        
        # Statistical Parity Difference
        sp_diff = protected_sr - privileged_sr
        
        results[group] = {
            "di_ratio": round(di_ratio, 3),
            "sp_diff": round(sp_diff, 3),
            "selection_rate": round(protected_sr, 3)
        }
    
    overall_bias = min([v["di_ratio"] for v in results.values()]) if results else 1.0
    return results, privileged_group, privileged_sr, overall_bias

@app.get("/")
def read_root():
    return {"message": "FairHire AI Backend is running!"}

@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
  try:
    print(f"INFO:     [AUDIT] New audit request for file: {file.filename}", flush=True)
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Identify dynamic columns (heuristic or user input)
    # For MVP, we assume columns 'selected' and 'gender' exist, or we guess
    target_col = None
    protected_col = None
    
    possible_targets = ['selected', 'hired', 'status', 'outcome', 'selection']
    possible_protected = ['gender', 'sex', 'category', 'race', 'ethnicity', 'caste']
    
    for col in df.columns:
        if col.lower() in possible_targets:
            target_col = col
        if col.lower() in possible_protected:
            protected_col = col
            
    if not target_col or not protected_col:
        return {
            "error": "Could not automatically identify 'selected' or 'protected' columns. Please ensure your CSV has columns like 'gender' and 'selected'."
        }

    # Ensure target_col is numeric
    if df[target_col].dtype == 'object':
        df[target_col] = df[target_col].map({'Selected': 1, 'Hired': 1, 'Not Selected': 0, 'Rejected': 0, '1': 1, '0': 0}).fillna(0)

    # ML Correlation Analysis using Scikit-Learn
    from sklearn.preprocessing import LabelEncoder
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.impute import SimpleImputer
    
    correlation_data = {}
    try:
        analysis_df = df.copy()
        # 1. Identify valid columns (more than 1 unique value)
        valid_cols = [col for col in analysis_df.columns if analysis_df[col].nunique() > 1]
        analysis_df = analysis_df[valid_cols]
        
        # 2. Encode categorical columns
        for col in analysis_df.columns:
            if analysis_df[col].dtype == 'object':
                analysis_df[col] = LabelEncoder().fit_transform(analysis_df[col].astype(str))
        
        # 3. Handle missing values
        imputer = SimpleImputer(strategy='mean')
        imputed_data = imputer.fit_transform(analysis_df)
        analysis_df = pd.DataFrame(imputed_data, columns=analysis_df.columns)

        if target_col in analysis_df.columns:
            X = analysis_df.drop(columns=[target_col])
            y = analysis_df[target_col]
            
            if not X.empty:
                model_rf = RandomForestClassifier(n_estimators=50, random_state=42)
                model_rf.fit(X, y)
                importances = model_rf.feature_importances_
                correlation_data = {col: round(float(imp), 3) for col, imp in zip(X.columns, importances) if imp > 0.01}
    except Exception as e:
        print(f"ML Analysis Error: {e}")

    bias_results, privileged, privileged_sr, overall_bias = detect_bias(df, target_col, protected_col)
    
    # Enhanced AI Explanation with Legal Tips
    explanation = "Gemini API key not configured or model error."
    if model:
        try:
            SYSTEM_PROMPT = """
    You are a Senior Ethical AI Auditor & Legal Compliance Consultant. 
    Analyze the provided hiring bias metrics (Disparate Impact, Statistical Parity).
    
    CRITICAL: 
    - Do NOT use Markdown Tables (no '|' characters or dashes like '|---|'). 
    - Use clear headings (###), bold text (**), and lists (* or 1.) only.
    - Reference specific legal standards: EEOC 80% Rule and GDPR Article 22.
    - Be professional, objective, and provide clear remedial actions.
    """
            prompt = f"""
            {SYSTEM_PROMPT}
            Dataset Context: {target_col} selection across {protected_col} groups.
            Privileged Group: {privileged} (Rate: {privileged_sr})
            Bias Metrics (Disparate Impact & Statistical Parity): {json.dumps(bias_results)}
            Overall Bias Score (DIR): {overall_bias}
            
            Provide a deep-dive audit report including:
            1. **Executive Summary**: A human-readable explanation of the bias severity.
            2. **Compliance Status**: 
               - Does it violate the EEOC '80% Rule'? 
               - Potential risks under GDPR Article 22 (Automated Decision Making).
            3. **Root Cause Analysis**: Where in the funnel might this bias be occurring?
            4. **Actionable Remediation**: Specific steps to fix this bias.
            5. **Legal Tips**: Recommendations for maintaining an 'Audit Trail' and 'Human-in-the-loop' systems.
            
            Keep it professional, structured, and authoritative.
            """
            response = model.generate_content(prompt, safety_settings=SAFETY_SETTINGS)
            if response.candidates and response.candidates[0].content.parts:
                explanation = response.text
            else:
                explanation = "The AI Auditor was unable to generate a response due to content safety sensitivity. Please review the raw metrics above manually."
        except Exception as e:
            explanation = f"AI Analysis Error: {str(e)}"

    result_data = {
        "overall_bias": overall_bias,
        "metrics": bias_results,
        "privileged_group": privileged,
        "privileged_selection_rate": privileged_sr,
        "ai_explanation": explanation,
        "correlations": correlation_data,
        "columns": {
            "target": target_col,
            "protected": protected_col
        },
        "filename": file.filename
    }

    # Save to Database
    db = SessionLocal()
    try:
        new_audit = AuditRecord(
            filename=file.filename,
            overall_bias=overall_bias,
            privileged_group=privileged,
            privileged_selection_rate=privileged_sr,
            metrics=bias_results,
            ai_explanation=explanation
        )
        db.add(new_audit)
        db.commit()
    finally:
        db.close()

    return result_data
  except HTTPException:
    raise
  except Exception as e:
    print(f"ERROR:    [AUDIT] Unhandled error in /analyze: {str(e)}", flush=True)
    return {"error": f"Server processing error: {str(e)}"}

class IndividualAuditRequest(BaseModel):
    candidate_data: dict
    global_metrics: dict
    filename: str

@app.post("/audit-individual")
async def audit_individual(req: IndividualAuditRequest):
    # Ensure model is initialized
    local_model = model
    if not local_model:
        return {"error": "AI Audit Engine (Gemini) is not ready. Please check your API key."}
    
    try:
        prompt = f"""
        You are an AI Fairness Auditor (XAI). 
        Analyze a specific hiring decision for a candidate in the context of global dataset bias.
        
        Candidate Profile: {json.dumps(req.candidate_data)}
        Global Audit Metrics: {json.dumps(req.global_metrics)}
        
        Provide:
        1. **Probability of Bias**: Based on the trends in '{req.filename}', how likely is it that this candidate's outcome was influenced by protected demographic factors?
        2. **Explainability**: Why might the AI/Process have reached this decision?
        3. **Fairness Check**: Does this decision align with the '80% Equal Opportunity' rule?
        
        Structure as a professional audit log.
        """
        response = model.generate_content(prompt, safety_settings=SAFETY_SETTINGS)
        if response.candidates and response.candidates[0].content.parts:
            return {"explanation": response.text}
        else:
            return {"error": "AI response was restricted by safety filters. Try rephrasing the candidate details or checking the global metrics."}
    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    db = SessionLocal()
    try:
        history = db.query(AuditRecord).order_by(AuditRecord.timestamp.desc()).all()
        return history
    finally:
        db.close()

@app.post("/compare")
async def compare_datasets(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    print(f"New audit request for file: {file1.filename} and {file2.filename}")
    start_time = time.time()
    try:
        # Helper to process a single file for comparison
        async def process_file(file):
            contents = await file.read()
            df = pd.read_csv(io.BytesIO(contents))
            
            target_col = None
            protected_col = None
            possible_targets = ['selected', 'hired', 'status', 'outcome', 'selection']
            possible_protected = ['gender', 'sex', 'category', 'race', 'ethnicity', 'caste']
            
            for col in df.columns:
                if col.lower() in possible_targets: target_col = col
                if col.lower() in possible_protected: protected_col = col
                    
            if not target_col or not protected_col:
                return None

            if df[target_col].dtype == 'object':
                df[target_col] = df[target_col].map({'Selected': 1, 'Hired': 1, 'Not Selected': 0, 'Rejected': 0, '1': 1, '0': 0}).fillna(0)
                
            bias_results, privileged, privileged_sr, overall_bias = detect_bias(df, target_col, protected_col)
            return {
                "overall_bias": overall_bias,
                "filename": file.filename,
                "metrics": bias_results
            }

        result1 = await process_file(file1)
        result2 = await process_file(file2)
        filename1 = file1.filename
        filename2 = file2.filename

        if not result1 or not result2:
            return {"error": "Could not identify columns in one or both files."}

        # AI comparison
        response = None
        if model:
            try:
                prompt = f"""
                Compare these two hiring audits:
                Audit A ({filename1}): Score {result1['overall_bias']}
                Audit B ({filename2}): Score {result2['overall_bias']}
                
                Audit A Metrics: {json.dumps(result1['metrics'])}
                Audit B Metrics: {json.dumps(result2['metrics'])}
                
                Explain:
                1. Is bias improving or worsening?
                2. Which group saw the biggest change?
                3. Key takeaway for the diversity strategy.
                """
                response = model.generate_content(prompt, safety_settings=SAFETY_SETTINGS)
            except: pass

        ai_comparison = response.text if response else "Comparison AI logic error."
        
        # SAVE TO DATABASE
        db = SessionLocal()
        comp_record = ComparisonRecord(
            filename_a=filename1,
            filename_b=filename2,
            score_a=result1['overall_bias'],
            score_b=result2['overall_bias'],
            ai_comparison=ai_comparison,
            raw_data_a=result1,
            raw_data_b=result2
        )
        db.add(comp_record)
        db.commit()
        db.close()

        return {
            "audit_a": result1,
            "audit_b": result2,
            "ai_comparison": ai_comparison
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/history/comparisons")
async def get_comparison_history():
    db = SessionLocal()
    history = db.query(ComparisonRecord).order_by(ComparisonRecord.timestamp.desc()).all()
    db.close()
    return [{
        "id": h.id,
        "filename_a": h.filename_a,
        "filename_b": h.filename_b,
        "score_a": h.score_a,
        "score_b": h.score_b,
        "ai_comparison": h.ai_comparison,
        "raw_data_a": h.raw_data_a,
        "raw_data_b": h.raw_data_b,
        "timestamp": h.timestamp.isoformat()
    } for h in history]

if __name__ == "__main__":
    import uvicorn
    import os
    # Cloud Run provides the port via environment variable
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

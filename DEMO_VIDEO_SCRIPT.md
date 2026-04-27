# 🎬 FairHire AI: 3-Minute Demo Video Script

**Objective:** The video must be under 3 minutes. Keep it fast, clear, and focused on demonstrating the Google AI and GCP integration. Use Loom, Zoom, or OBS to record your screen alongside your voice/camera.

---

### [0:00 - 0:30] Introduction & Problem
* **Visual:** Start on the Home Dashboard of FairHire AI (Audit view).
* **Audio script:** "Hello judges, we are team Latent Legends, and this is FairHire AI. Modern hiring tools prioritize automation but often scale human biases hidden in historical data. Rather than building another hiring tool, we built an independent **Auditing Engine** that evaluates hiring decisions for fairness, transparency, and accountability."

### [0:30 - 1:15] Global Audit & ML Analysis
* **Visual:** Click "Upload CSV" and select a dataset (like `Tech_Hiring.csv`). Scroll down to show the Bias charts and the **Decision Driver Analysis (ML)** chart.
* **Audio script:** "When an HR team uploads a dataset, our FastAPI backend—hosted on Google Cloud Run—instantly calculates Disparate Impact and Statistical Parity. But we go further. Using Scikit-Learn logic, our Machine Learning engine identifies exactly which demographic features actually drove the final hiring decisions, mathematically proving if proxy discrimination exists."

### [1:15 - 2:00] Individual XAI Audit (The "Wow" Factor)
* **Visual:** Click the **Search/Magnifying Glass** icon to enter the **Individual Decision Explainer** mode. Type in a candidate profile (e.g., Gender: Female, Outcome: Rejected). Click **Explain Decision**.
* **Audio script:** "Telling an organization they are biased isn't enough. We need explainability. By switching to our Individual Audit mode, we can input a specific candidate's profile. We leverage **Google Gemini 2.5 Flash** as an ethical auditor. Gemini takes the candidate profile and the raw global dataset metrics to generate a human-readable, legal-style 'AI Audit Trace'. It explains exactly how demographic trends likely influenced this specific rejection."

### [2:00 - 2:30] PDF Exports & Archiving
* **Visual:** Click **Export Individual Audit**, show the PDF downloading, then quickly click the **History/Timer** icon to show the past logs.
* **Audio script:** "For enterprise compliance, all audits and Gemini traces can be instantly exported as branded PDF reports. Our architecture also natively supports PostgreSQL on Google Cloud SQL, ensuring every audit is permanently logged for corporate transparency."

### [2:30 - 3:00] Conclusion
* **Visual:** Switch back to the Global Audit view, or show a slide with the Architecture diagram.
* **Audio script:** "FairHire AI proves that using Google Cloud and Gemini, we can enforce Responsible AI practices. We don't just automate hiring; we ensure it's fair, explainable, and ethical. Thank you."

# 🖥️ FairHire AI: Official Prototype Deck (PPT) Content

*Copy and paste this text directly into your downloaded PowerPoint Template (`[EXT] Solution Challenge 2026 - Prototype PPT Template`). The content is now strictly aligned with the requested slide structure.*

---

### Slide 1: Guidelines / Title Cover
*(Add your project logo or cover image here)*
* **Project Name:** FairHire AI - Auditing Hiring Systems for Fairness.
* **Tagline:** Fairness, Transparency, and Accountability using Google AI.

### Slide 2: Team Details
* **Team name:** Latent Legends
* **Team leader name:** Ayush Nathani
* **Problem Statement:** Organizations increasingly use AI and datasets to screen candidates. However, if systems train on flawed historical data, they unintentionally discriminate based on gender, demographic categories, or hidden proxy variables. There is a lack of transparency to detect and explain these hidden biases before they impact real people.

### Slide 3: Brief about your solution
* **Overview:** FairHire AI is an intelligent auditing platform that evaluates hiring datasets and recruitment algorithms for bias.
* **Core Concept:** We do not replace hiring tools; we *verify* them. Our system analyzes datasets for systemic bias using statistical math, calculates which variables influenced decisions the most, and leverages Google Gemini AI to generate human-readable, ethical "Audit Traces" to ensure organizations make fair and compliant hiring decisions.

### Slide 4: Opportunities
* **How different is it from any of the other existing ideas?** Traditional hiring AIs focus entirely on automation and screening speed, often ignoring algorithmic bias. FairHire AI is independent—acting as the "Auditing Layer" that bridges the critical gap between technological speed and human accountability.
* **How will it be able to solve the problem?** It calculates globally recognized fairness metrics (Disparate Impact & Statistical Parity) mathematically proving if proxy discrimination exists. 
* **USP of the proposed solution:** Real-time integration of statistical ML (Decision Drivers) with Google Gemini to provide a legally-structured "Explainable AI (XAI)" trace for any individual candidate.

### Slide 5: List of features offered by the solution
* **Global Dataset Audit:** Identifies systemic bias across thousands of historical records instantly.
* **Individual XAI Explainer:** Audits a single candidate decision, explaining if their rejection/selection carries fairness concerns.
* **Bias Metrics Engine:** Calculates Disparate Impact Ratio, Statistical Parity, and group Selection Rates.
* **Decision Driver Analysis (ML):** Identifies exactly which features (e.g., gender, experience level) most heavily influenced the ultimate algorithm.
* **PDF Export:** Downloadable, branded fairness audit reports for compliance teams.

### Slide 6: Process flow diagram or Use-case diagram
*(You will add a diagram here, but use this text as labels or bullet points)*
* **Upload:** HR provides the Hiring Dataset (CSV).
* **Preprocess:** System identifies sensitive attributes (gender/category).
* **ML Analysis:** Model calculates feature correlations.
* **AI Explainer:** Google Gemini 2.5 Flash handles natural language processing to explain the bias risk.
* **Review:** User views the Dashboard charts or exports the PDF Audit trace.

### Slide 7: Wireframes/Mock diagrams of the proposed solution (optional)
*(Add a high-level UI sketch or skip this slide entirely depending on your preference. Since you already have a working MVP, you can just state "Refer to Slide 11 for active MVP Snapshots".)*

### Slide 8: Architecture diagram of the proposed solution
*(Create a diagram based on this flow)*
* **Frontend:** React.js Dashboard → Deployed on **Google Cloud Storage**
* **Backend API:** FastAPI (Python) → Deployed on **Google Cloud Run**
* **Database:** SQLite / PostgreSQL Ready
* **Data Processing:** Pandas & Scikit-learn Engine
* **AI Integration:** **Google Gemini 2.5 Flash API** for Explainability and Ethical Processing.

### Slide 9: Technologies to be used in the solution
* **Frontend:** React.js, Tailwind CSS, Recharts (for data visualization).
* **Backend:** FastAPI, Python.
* **Data & ML Engine:** Pandas, NumPy, Scikit-learn (RandomForestClassifier).
* **Cloud Deployment:** Google Cloud Storage (Frontend), Google Cloud Run (Backend).
* **Google Services Integration:** Google Gemini API (models/gemini-2.5-flash).

### Slide 10: Estimated implementation cost (optional)
* **Estimated Cost:** Minimal / Low Cost for Prototyping.
* **Details:** The system utilizes open-source frameworks (React/Python) and operates efficiently within the **Google Cloud Free Tier** for Cloud Run and Cloud Storage. The Gemini API usage remains cost-effective for text-based analysis, making this highly scalable for enterprise adaptation without heavy initial overhead.

### Slide 11: Snapshots of the MVP
*(Add screenshots of your actual React Dashboard here)*
* **Snapshot 1:** The Global Dashboard showing the Data Visualizations (Bar Charts) and Disparate Impact scores.
* **Snapshot 2:** The "Decision Driver Analysis (ML)" panel showing which stats impacted hiring most.
* **Snapshot 3:** The Individual Decision Explainer showing the Gemini 'AI Audit Trace'.

### Slide 12: Additional Details/Future Development (if any)
* Real-time hiring API integrations (plugging directly into existing ATS tools like Workday or BambooHR).
* Advanced bias detection using deep neural networks for complex unstructured text data (resumes).
* Enterprise compliance dashboards tracking fairness progress over multiple quarters.
* Expansion of the auditing engine into Finance (loan approvals) and Healthcare AI systems.

### Slide 13: Provide links to your:
* **GitHub Public Repository:** *(Insert your GitHub link here)*
* **Demo Video Link (3 Minutes):** *(Insert YouTube/Drive Link here)*
* **MVP Link:** *(Insert your Google Cloud Storage Link here)*
* **Working Prototype Link:** *(Same as MVP Link, or backend API base link)*

### Slide 14 & 15: Thank You!
* **Message:** FairHire AI - Ethical AI Adoption in Automated Decision-Making.
* **Team:** Latent Legends

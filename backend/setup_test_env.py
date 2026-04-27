import pandas as pd
import os
import random
import sqlite3

# 1. Clear Database
db_path = 'audits.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print("Database cleared successfully.")

# 2. Create Test Datasets Folder
folder = 'test_datasets'
if not os.path.exists(folder):
    os.makedirs(folder)

# 3. Generate 15 Varied CSVs
scenarios = [
    ("Tech_Hiring_2023_Fair", 0.9),
    ("Tech_Hiring_2024_Biased", 0.5),
    ("Retail_Spring_Q1", 0.85),
    ("Retail_Summer_Q2", 0.7),
    ("Finance_Grad_Program", 0.95),
    ("Executive_Leadership", 0.4),
    ("Customer_Support_Global", 0.8),
    ("Engineering_Interns", 0.6),
    ("Sales_Department_East", 0.88),
    ("Sales_Department_West", 0.75),
    ("Product_Design_Hiring", 0.92),
    ("Legal_Department_Audit", 0.8),
    ("Marketing_Creatives", 0.85),
    ("Operations_Team_Beta", 0.65),
    ("Healthcare_Staffing", 0.9)
]

demographics = ['Male', 'Female', 'Non-Binary', 'Underrepresented Group']

for name, bias_factor in scenarios:
    data = []
    # Privileged Group (usually index 0)
    applied_p = random.randint(300, 500)
    selected_p = int(applied_p * 0.4) # 40% selection rate for privileged
    data.append({'Gender': 'Male', 'Applied': applied_p, 'Selected': selected_p})
    
    # Other groups with varying bias
    for group in demographics[1:]:
        applied = random.randint(200, 400)
        # Apply the bias factor to the selection rate
        selected = int(applied * (0.4 * bias_factor * random.uniform(0.9, 1.1)))
        data.append({'Gender': group, 'Applied': applied, 'Selected': min(selected, applied)})
        
    df = pd.DataFrame(data)
    df.to_csv(f"{folder}/{name}.csv", index=False)
    print(f"Generated: {name}.csv")

print(f"\nDone! 15 test files are ready in the '{folder}' directory.")

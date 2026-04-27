import sqlite3
import json
from datetime import datetime

def view_audits():
    try:
        conn = sqlite3.connect('audits.db')
        cursor = conn.cursor()
        
        # Fetch the most recent 10 audits
        cursor.execute("SELECT id, filename, overall_bias, timestamp FROM audits ORDER BY timestamp DESC LIMIT 10")
        rows = cursor.fetchall()
        
        print("\n" + "="*80)
        print(f"{'ID':<4} | {'FILENAME':<25} | {'BIAS SCORE':<12} | {'TIMESTAMP':<20}")
        print("-" * 80)
        
        if not rows:
            print("No audits found in the database yet.")
        else:
            for row in rows:
                # Format: ID | Filename | Bias % | Time
                bias_pct = f"{row[2]*100:.1f}%"
                # Parse timestamp if it's a string from SQLite
                time_str = row[3][:19] if row[3] else "N/A"
                print(f"{row[0]:<4} | {row[1]:<25} | {bias_pct:<12} | {time_str:<20}")
        
        print("="*80 + "\n")
        
        conn.close()
    except Exception as e:
        print(f"Error accessing database: {e}")

if __name__ == "__main__":
    view_audits()

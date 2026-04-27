import sqlite3
import json
from datetime import datetime

def explore_db():
    try:
        conn = sqlite3.connect('audits.db')
        cursor = conn.cursor()

        print("\n" + "="*60)
        print(" 🔍 FAIRHIRE DATABASE EXPLORER ")
        print("="*60)

        # 1. EXPLORE SINGLE AUDITS
        print("\n--- [ SINGLE AUDIT HISTORY ] ---")
        cursor.execute("SELECT id, filename, overall_bias, timestamp FROM audits ORDER BY timestamp DESC")
        audits = cursor.fetchall()
        
        if not audits:
            print("No single audits found.")
        for a in audits:
            dt = a[3][:19] if a[3] else "N/A"
            print(f"ID: {a[0]} | Score: {int(a[2]*100)}% | File: {a[1][:30]}... | Date: {dt}")

        # 2. EXPLORE COMPARISONS
        print("\n--- [ TREND COMPARISON HISTORY ] ---")
        cursor.execute("SELECT id, filename_a, filename_b, timestamp FROM comparisons ORDER BY timestamp DESC")
        comps = cursor.fetchall()

        if not comps:
            print("No comparisons found.")
        for c in comps:
            dt = c[3][:19] if c[3] else "N/A"
            print(f"ID: {c[0]} | Compare: {c[1][:25]} VS {c[2][:25]} | Date: {dt}")

        print("\n" + "="*60)
        conn.close()
    except Exception as e:
        print(f"❌ Error accessing database: {e}")
        print("Make sure you have run at least one audit first!")

if __name__ == "__main__":
    explore_db()

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

with open("models_list.txt", "w", encoding="utf-8") as f:
    f.write("Available Models:\n")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")

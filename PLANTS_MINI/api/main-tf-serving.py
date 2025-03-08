from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import requests
import json
import os
from pathlib import Path

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

endpoint = "http://localhost:8502/v1/models/my_model:predict"

CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_healthy"
]

# Path to the language files directory
LANG_DIR = Path("languages")

# Create the directory if it doesn't exist
os.makedirs(LANG_DIR, exist_ok=True)

# Function to load language data
def load_language_data(lang="en"):
    """
    Load disease information in the specified language from language files.
    Falls back to English if the requested language isn't available.
    """
    try:
        # Try to load the requested language file
        lang_file = LANG_DIR / f"{lang}.json"
        if not lang_file.exists() and lang != "en":
            # Fall back to English if requested language isn't available
            print(f"Language file for '{lang}' not found. Falling back to English.")
            lang_file = LANG_DIR / "en.json"
            
        with open(lang_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading language file: {e}")
        # Return empty dict if both requested language and English fail
        return {}

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    lang: str = "en"  # Default language is English
):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    json_data = {
        "instances": img_batch.tolist()
    }

    response = requests.post(endpoint, json=json_data)
    prediction = np.array(response.json()["predictions"][0])

    predicted_class = CLASS_NAMES[np.argmax(prediction)]
    confidence = np.max(prediction)

    # Load language data
    disease_info = load_language_data(lang)
    
    # Get disease information in the requested language or fall back to default
    disease_info_lang = disease_info.get(predicted_class, {})

    return {
        "class": predicted_class,
        "confidence": float(confidence),
        "cause": disease_info_lang.get("cause", []),  
        "precaution": disease_info_lang.get("precaution", []), 
        "cure": disease_info_lang.get("cure", []),   
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
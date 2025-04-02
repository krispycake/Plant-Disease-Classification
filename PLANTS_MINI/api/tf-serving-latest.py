from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import requests

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

endpoint = "http://localhost:8504/v1/models/new_plants:predict"          




CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_healthy"
    "Unknown",
]

DISEASE_INFO = {
    "Pepper__bell___Bacterial_spot": {
        "cause": [
            "Xanthomonas bacteria",
            "Warm, humid climate (25-30°C)",
            "Infected seeds or soil"
        ],
        "precaution": [
            "Use resistant varieties like Antebellum, Green Machine",
            "Proper spacing, drip irrigation",
            "Sanitation, crop rotation"
        ],
        "cure": [
            "Copper-based bactericides",
            "Copper + mancozeb, streptocycline alone or with Blitox 50",
            "Destroy infected plants"
        ]
    },
    "Potato___Early_blight": {
        "cause": [
            "Alternaria solani fungus",
            "Warm, alternating wet/dry (up to 30°C)",
            "Infected debris or soil"
        ],
        "precaution": [
            "Use Kufri Pukhraj resistant variety",
            "Crop rotation, balanced nutrition",
            "Proper spacing, drip irrigation"
        ],
        "cure": [
            "Fenamidone 10% + mancozeb 50% WDG",
            "Metiram 55% + pyraclostrobin 5% WDG",
            "Destroy infected material"
        ]
    },
    "Tomato_Bacterial_spot": {
        "cause": [
            "Xanthomonas species",
            "Warm, humid climate (24-30°C)",
            "Infected seeds, tools"
        ],
        "precaution": [
            "Disease-free seeds, resistant varieties",
            "Crop rotation, spacing",
            "Avoid overhead irrigation and handling wet plants. Can use hot water treatment of seeds at 50°C for 25 minutes"
        ],
        "cure": [
            "Copper-based bactericides",
            "Vermicompost seed treatment",
            "Copper + mancozeb, acibenzolar-S-methyl (ASM)"
        ]
    },
    "Tomato_Early_blight": {
        "cause": [
            "Alternaria solani fungus",
            "Warm, wet/dry cycle",
            "Infected debris, soil"
        ],
        "precaution": [
            "Use Indus 1030, Bangalore Red resistant varieties",
            "Crop rotation, spacing",
            "Maintain nitrogen levels"
        ],
        "cure": [
            "Chlorothalonil, mancozeb",
            "Systemic + contact fungicides",
            "Destroy infected plants"
        ]
    }
}


@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
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
    
    disease_info = DISEASE_INFO.get(predicted_class, {})

    return {
        "class": predicted_class,
        "confidence": float(confidence),
        "cause": disease_info.get("cause", []),
        "precaution": disease_info.get("precaution", []),
        "cure": disease_info.get("cure", [])
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)




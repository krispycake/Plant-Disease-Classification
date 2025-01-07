from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from tensorflow import keras

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

# Add CORS middleware to allow requests from specified origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the TensorFlow model
def custom_loss_function(y_true, y_pred):
    return keras.losses.sparse_categorical_crossentropy(y_true, y_pred)

MODEL = keras.models.load_model(
    "D:/MOCK-2 DUMMY/PLANTS_MINI/saved_models/1/model.h5",
    custom_objects={'SparseCategoricalCrossentropy': custom_loss_function}
)

CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_healthy"
]

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    try:
        image = Image.open(BytesIO(data)).convert("RGB")  # Ensure image is RGB
        return np.array(image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())

    # Resize image to the expected input size for the model
    image = tf.image.resize(image, (256, 256))
    img_batch = np.expand_dims(image, axis=0)  # Create a batch of one image

    # Make predictions
    predictions = MODEL.predict(img_batch)

    # Get the predicted class and confidence
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])

    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)

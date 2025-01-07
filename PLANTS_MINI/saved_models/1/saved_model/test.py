import tensorflow as tf
from tensorflow.keras.losses import SparseCategoricalCrossentropy

# Define the custom loss function
def custom_loss_function(y_true, y_pred):
    return SparseCategoricalCrossentropy()(y_true, y_pred)

# Load your Keras model with the custom loss function
model = tf.keras.models.load_model(
    "D:/MOCK-2 DUMMY/PLANTS_MINI/saved_models/1/model.h5",
    custom_objects={'SparseCategoricalCrossentropy': custom_loss_function}
)

# Save the model in the SavedModel format
model.export("D:/MOCK-2 DUMMY/PLANTS_MINI/saved_models/1//1")
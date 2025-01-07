# Plant-Disease-Classification
Classification Model to classify various diseases in potato, tomato, and bell pepper crops using a Convolutional Neural Network (CNN).


## Models Included
Custom Model: Custom model trained from scratch.

ResNet18: Pre-trained and fine-tuned for plant disease detection.

VGG16: Another CNN model trained for the same task.


## Setup for Python:
Ensure you have Python and necessary libraries installed. Recommended to use a virtual environment:

1. Install Python ([Setup instructions](https://wiki.python.org/moin/BeginnersGuide))

2. Install Python packages

```
python -m venv venv
pip3 install -r api/requirements.txt
```

3. Install Tensorflow Serving ([Setup instructions](https://www.tensorflow.org/tfx/serving/setup))

## Setup for ReactJS

1. Install Nodejs ([Setup instructions](https://nodejs.org/en/download/package-manager/))
2. Install NPM ([Setup instructions](https://www.npmjs.com/get-npm))
3. Install dependencies

```bash
cd frontend
npm install --from-lock-json
npm audit fix
```

## Running the API

### Using FastAPI & TF Serve

1. Get inside `api` folder

```bash
cd api
```

2. Copy the `models.config.example` as `models.config` and update the paths in file.
3. Run the TF Serve (Update config file path below)

```bash
docker run -t --rm -p 8501:8501 -v C:/Code/potato-disease-classification:/potato-disease-classification tensorflow/serving --rest_api_port=8501 --model_config_file=/potato-disease-classification/models.config
```

4. Run the FastAPI Server using uvicorn
   For this you can directly run it from your main.py or main-tf-serving.py using pycharm run option (as shown in the video tutorial)
   OR you can run it from command prompt as shown below,

```bash
uvicorn main-tf-serving:app --reload --host 0.0.0.0
```

5. Your API is now running at `0.0.0.0:8000`

## Running the Frontend
Unzip frontend.zip

The frontend.zip file was uploaded using Git LFS due to its size. Standard users can clone the repository and unzip it manually without needing Git LFS.



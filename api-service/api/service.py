from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
from fastapi import File
from tempfile import TemporaryDirectory
from api import model
# from api.deeplab.model import Deeplabv3

# Setup FastAPI app
app = FastAPI(
    title="API Server",
    description="API Server",
    version="v1"
)

# Enable CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
async def get_index():
    return {
        "message": "Welcome to the Data Pets API Service"
    }

@app.post("/predict")
async def predict(
        file: bytes = File(...)
):
    print("predict file:", len(file), type(file))

    # download packages
    model.download_datasets_packages()
    
    # Save the image
    with TemporaryDirectory() as image_dir:
        image_path = os.path.join(image_dir, "test.png")
        with open(image_path, "wb") as output:
            output.write(file)

        # Make prediction
        prediction_results = model.make_predict(image_path)

    return prediction_results

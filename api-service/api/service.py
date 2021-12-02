from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
import pandas as pd
from glob import glob
from fastapi import File
from tempfile import TemporaryDirectory
from api import model

dataset_path = "https://storage.googleapis.com"
dogs_path = os.path.join(dataset_path, "dogs_meta", "dogs.csv")

# set up global variable
dogs = None

def load_dogs():
    global dogs

    if dogs is None:
        print("Loading dogs data...")
        # Load data into pandas dataframe
        dogs = pd.read_csv(dogs_path)

        # some preprocessing of the dataframe
        dogs = dogs.rename(columns={"AnimalInternal-ID": "AnimalInternalID"})
        dogs = dogs.drop(columns=["AnimalPattern"])

        # compute age of dog
        dogs['DOB'] = pd.to_datetime(dogs['AnimalDOB'], format='%Y%m%d')
        dogs["Year"] = pd.DatetimeIndex(dogs['DOB']).year
        dogs["Age"] = (pd.to_datetime('now') - dogs['DOB']).astype('<m8[Y]')

    return dogs

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

@app.post("/getDogMeta")
async def getDogMeta(img: dict):
    dogs = load_dogs()
    dogs_id = img['img'].split("/")[-2]

    selected_dogs = dogs[dogs["AnimalInternalID"]==int(dogs_id)]
    
    return {"name":selected_dogs["AnimalName"].values[0],
            "sex":selected_dogs["AnimalSex"].values[0],
            #"AnimalInternalID":selected_dogs["AnimalInternalID"].values[0],
            "age":selected_dogs["Age"].values[0],
            "breed":selected_dogs["AnimalBreed"].values[0]}


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

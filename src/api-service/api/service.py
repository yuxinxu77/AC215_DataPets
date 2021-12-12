from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
import pandas as pd
from glob import glob
from fastapi import File
from tempfile import TemporaryDirectory
from api import model

# set up global variable
dogs = None

def load_dogs():
    global dogs
    # load dogs data
    if dogs is None:
        dogs = model.load_dogs()
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
    # download datasets and models
    model.download_datasets_packages()
    model.download_language_model()

    return {
        "message": "Welcome to the Data Pets API Service"
    }

@app.get("/getdogs")
async def getDogs():
    dogs = load_dogs()
    display_dogs = model.get_all_dogs(dogs).sample(n=200, replace=False)
    return display_dogs.to_dict(orient='records')

@app.post("/findfilterdogs")
async def findFilterDogs(filter: dict):
    print(filter)
    dogs = load_dogs()
    all_dogs = model.get_all_dogs(dogs)
    # apply filter
    filter_dogs = all_dogs.loc[(all_dogs['AnimalBreed']==filter['breed'])]
    filter_dogs = filter_dogs[(filter_dogs['Age'].astype(int)>int(filter['agegt'])) & (filter_dogs['Age'].astype(int)<int(filter['agelt']))]
    filter_dogs = filter_dogs[filter_dogs['AnimalSex']==filter['gender']]

    return filter_dogs.to_dict(orient='records')

@app.get("/getbreeds")
async def getBreeds():
    dogs = load_dogs()
    # get the unique values
    breed_counts = dogs["AnimalBreed"].value_counts()
    breeds = breed_counts.head(50).index.tolist()

    return breeds

@app.post("/getdogmeta")
async def getDogMeta(img: dict):
    dogs = load_dogs()
    dogs_meta = model.get_dogs_meta(img, dogs)
    return dogs_meta

@app.post("/predict")
async def predict(
        file: bytes = File(...)
):
    print("predict file:", len(file), type(file))

    # download packages
    # model.download_datasets_packages()
    
    # Save the image
    with TemporaryDirectory() as image_dir:
        image_path = os.path.join(image_dir, "test.png")
        with open(image_path, "wb") as output:
            output.write(file)

        # Make prediction
        prediction_results = model.make_predict(image_path)

    return prediction_results

@app.post("/chatwithdog")
async def chatwithdog(messages: dict):
    # download language model
    # model.download_language_model()
    # get the result
    results = model.chat_with_dog(messages['message'], messages['personality'], messages['history'])
    
    return results


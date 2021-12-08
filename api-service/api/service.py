from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
import pandas as pd
from glob import glob
from fastapi import File
from tempfile import TemporaryDirectory
from api import model
import random

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
    # select the clicked dog
    selected_dogs = dogs[dogs["AnimalInternalID"]==int(dogs_id)].to_dict('records')[0]
    # add if training or not
    house_trained = random.randint(0,3)
    if house_trained == 0:
        selected_dogs["trained"] = False
    else:
        selected_dogs["trained"] = True

    # create personality component
    personality = ['I am {}'.format(selected_dogs["AnimalName"]),
        'I am a {}'.format(selected_dogs["AnimalType"]),
        'My gender is {}'.format(selected_dogs["AnimalSex"]),
        'My weight is {}'.format(selected_dogs["AnimalCurrentWeightPounds"]),
        'I was born on {}'.format(selected_dogs["Year"]),
        'I am {} years old'.format(selected_dogs["Age"]),
        'My breed is {}'.format(selected_dogs["AnimalBreed"]),
        'My color is {}'.format(selected_dogs["AnimalColor"])]
    if selected_dogs["trained"]:
        personality.append("I am house trained")
    else:
        personality.append("I am not house trained")
    personality.append("I like to play with toys")

    # create history component
    history = ["Hi", "woof woof"]

    return {"name":selected_dogs["AnimalName"],
            "sex":selected_dogs["AnimalSex"],
            "age":selected_dogs["Age"],
            "breed":selected_dogs["AnimalBreed"],
            "persona": personality,
            "history": history}

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

@app.post("/chatwithdog")
async def chatwithdog(messages: dict):
    # download language model
    model.download_language_model()
    # get the result
    results = model.chat_with_dog(messages['message'], messages['personality'], messages['history'])
    
    return results


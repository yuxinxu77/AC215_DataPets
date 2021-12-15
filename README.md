# **AC215 Data Pets - Austin Pets Alive**

------

## Background

Austin Pets Alive (APA) is an association of pet owners for pet owners with a database of available pet photos.
 The goal will be to build a reusable application, design, and framework that can be used in any animal welfare
 nonprofits to connect future pet owners with pets. The outcome of the project will be to build a full featured
 application for the APA.

## Problem Definition & Project Scope

For this Pets project, our group’s focus will be to create a user friendly tool to match potential dog loving a
dopters/owners to dogs available for adoption. As stated above, the end goal is developing a nice web applicati
on that can harness the data and be used with features/deliverables that will be helpful for the matching proce
ss.

The core problem we are trying to solve is to help future dog owners find a dog who is a good fit for their lif
estyle and family environment. First we help the user search for dogs based on certain features such as size, c
olor, and breed. Secondly we will connect the dog with the user by allowing the user to chat with a persona of
the dog. The user can ask this virtual dog any question about it-- its breed characteristics, or any general qu
estions about puppies and dogs.

## Project Organization
------------
      .
      ├── LICENSE
      ├── src/
      │             ├── __init__.py
      │             └── build_features.py
      ├── src/api-service/
      │             ├── api/                               <- Where we currently have the Deeplab model
      │             ├── Dockerfile                               
      │             ├── Pipfile
      │             ├── Pipfile.lock
      │             ├── docker-entrypoint.sh
      │             └── docker-shell.sh
      ├── src/deployment/
      │             ├── Dockerfile
      │             ├── ansible.cfg
      │             ├── deploy-create-instance.yml
      │             ├── deploy-docker-images.yml
      │             ├── deploy-k8s-cluster.yml
      │             ├── deploy-provision-instance.yml
      │             ├── deploy-setup-containers.yml
      │             ├── deploy-setup-webserver.yml
      │             ├── docker-entrypoint.sh
      │             ├── docker-shell.sh
      │             └── inventory.yml
      ├── src/frontend-html/ (simple frontend)                  <- HTML version of frontend simple
      │             ├── Dockerfile
      │             ├── docker-shell.sh
      │             ├── index.html
      │             ├── predict.html
      ├── src/frontend-react/
      │             ├── src/
      │             │            ├── app/                                 
      │             │            ├── common/                <- common folder for React app   
      │             │            ├── components/            <- components folder for React app
      │             │            ├── services/
      │             │            ├── index.css
      │             │            └── index.js 
      │             ├── Dockerfile
      │             ├── Dockerfile.dev
      │             ├── docker-shell.sh
      │             ├── package.json
      │             └── yarn.lock
      ├── README.md
      ├── secrets/                                          <- stores the *.jsons(bucket, deployment, gcp-service)
      ├── submissions
      │             ├── milestone1_DataPets
      │             ├── milestone2_DataPets
      │             └── milestone3_DataPets                 <- refer here for milestone and latest updates
      └── test_project.py

--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/
">cookiecutter data science project template</a>.

## Proposed solution

In order to achieve this goal, we proposed the following solutions:

- Help the user search based on the dog's characteristics, such as age, size, color, breed.
- Find similar dogs by uploading a picture of a dog the user is interested in.
- Connect the dog with the user by allowing the user to chat with a persona of the dog. For example, the user can ask this virtual dog any question about it, its breed characteristics, or any general questions about puppies and dogs.
- As an adoption center, when new images are available for dogs a function will be available to upload images of the dog:
    * Remove noisy background from the picture.
    * Add a preset background
    * Enhance the image if the resolution of the uploaded picture is not good.


## Our Data

APA makes available a repository for its animals that is roughly ~17k dog records and close to 40k for total animals. For the ~40k pets there looks to be ~140k photos. Here is a list of publicly accessible URLs such as this [example](https://www.shelterluv.com/sites/default/files/animal_pics/464/2018/07/11/21/20180711213702.png), so a part of the project would be some data wrangling to go grab and persist the photos somewhere.
Our dataset consists of three csv files [Dataset Link](https://drive.google.com/drive/folders/1LCYLVkwZSHfkKvJUXs3EtHWRjUSUWZGy?usp=sharing). The most important of the csv's holds the metadata information listing the following features:

| Field | Description |
|---|---|
AnimalID | public facing unique id
AnimalInternal-ID | internal unique id - USE THIS to link to the other tables (dogs_photos.csv and dogs_website
_memos.csv)
AnimalName | Name of dog
AnimalType | Dog
AnimalSex | Male, Female or Unknown
AnimalCurrentWeightPounds | decimal weight in pounds. NOTE: data quality of this field is mediocre at best. Sta
ff are good about recording at least one weight around the time of intake but not as diligent about recording a
 weight prior to outcome.
AnimalDOB | DOB formatted as YYYYMMDD
AnimalBreed | concatenation of primary and secondary breed fields delimited by " /".
AnimalColor | concatenation of primary and secondary colors fields delimited by " /".
AnimalPattern | animal pattern NOTE: not often populated for dogs. More often used for cats

The dog images accessible to us are stored and readily available to us in our AC215 Data Pets [Google Cloud Pla
torm](https://console.cloud.google.com/storage/browser?project=ac215-data-pets&prefix=&forceOnObjectsSortingFiltering=false&pageState=(%22GcsBucketList%22:(%22f%22:%22%255B%255D%22))) 


## __Pipeline and Workflow__

**Computer Vision Models**:

We have used specifically the [DeepLabv3 Plus model](https://github.com/AvivSham/DeepLabv3) for our segmentation of dog images as well as for removing background of user uploaded dog images for better feature extractions.

To return our matched images from database, we first created embeddings using [EfficientNet B0](https://arxiv.org/pdf/1905.11946.pdf) for all dog images and saved them in GCP. We then used [Facebook AI Similarity Search (FAISS)](https://github.com/facebookresearch/faiss), developed by Facebook for efficient similarity search to yield our best matched dogs' photos (5 photos according to uploaded image).


**Language Models**:

The next task was creating a persona of the dog that the user has searched and allow users to ask more information regarding the dog by directly chatting with the persona. To implement a baseline model, we used the BERT question and answering model, which was trained on the Stanford Question Answering Dataset (SQuAD). We will provide sample questions and reference text to the model and let the model predict the start and end token of a “span” of text which acts as the output answer. We followed the main steps from Shivas’ notebook in 2021 ComputeFest and the tutorial by Chris McCormmick. We then decided to try generative-based language models, GPT2 for question and answering tasks. We fine-tuned the GPT2 model with specific context on which the dogs were based. The resulting Q&A outputs are quite good, and we displayed some of the examples. For further details, refer to [Milestone3_DataPets](https://github.com/yuxinxu77/AC215_DataPets/tree/main/submissions/milestone3_DataPets).


**Containerized Development**:

Our App requires our deployment of the following containers

`API container` - where we currently have all CV related models for segmentation, creating embeddings and returning embeddings search. We also plan to include our GPT2 language model into this section soon.

`Deployment` - where the Data Pets app is deployed using ansible in GCP instance.

`Frontend-React` - where the frontend appearance of the app will be ran including the model's output of similar dogs interface. We will also include the chatbox interface in the React frontend after connecting our NLP model.

**Medium Post**:
A detailed description about the project could be found at Medium at https://medium.com/@guanhuas/an-end-to-end-approach-leveraging-computer-vision-nlp-to-enable-better-pet-adoption-matching-41327437dec5

**Reference**:
1. EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks, Mingxing Tan et al.
2. FAISS, Facebook AI Similarity Search.
3. DeepLab: Semantic Image Segmentation with Deep Convolutional Nets, Atrous Convolution, and Fully Connected CRFs, Liang-Chieh Chen et al. 
4. SQuAD, Stanford Question Answering Dataset.
5. 2021 Harvard IACS ComputeFest Computer Vision Task Notebook.
6. Question Answering with a Fine-Tuned BERT, Chris McCormick.
7. 2021 Harvard IACS ComputeFest GitHub Repository.
8. Personalizing Dialogue Agents: I have a dog, do you have pets too?, Saizheng Zhang et al.

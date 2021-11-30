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
      ├── Makefile
      ├── README.md
      ├── models
      ├── notebooks
      ├── references
      ├── requirements.txt
      ├── setup.py
      ├── src
      │   ├── __init__.py
      │   └── build_features.py
      ├── submissions
      │   ├── milestone1_groupname
      │   ├── milestone2_groupname
      │   ├── milestone3_groupname
      │   └── milestone4_groupname
      └── test_project.py

--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/
">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>

## Proposed solution

In order to achieve this goal, we proposed the following solutions:

- Help the user search based on the dog's characteristics, such as age, size, color, breed.
- Find similar dogs by uploading a picture of a dog the user is interested in.
- Connect the dog with the user by allowing the user to chat with a persona of the dog. For example, the user c
an ask this virtual dog any question about it, its breed characteristics, or any general questions about puppie
s and dogs.
- As an adoption center, when new images are available for dogs a function will be available to upload images o
f the dog:
    * Remove noisy background from the picture.
    * Add a preset background
    * Enhance the image if the resolution of the uploaded picture is not good.



- Help the user search based on the dog's characteristics, such as age, size, color, breed.
- Find similar dogs by uploading a picture of a dog the user is interested in.
- Connect the dog with the user by allowing the user to chat with a persona of the dog. For example, the user c
an ask this virtual dog any question about it, its breed characteristics, or any general questions about puppie
s and dogs.
- As an adoption center, when new images are available for dogs a function will be available to upload images o
f the dog:
    * Remove noisy background from the picture.
    * Add a preset background
    * Enhance the image if the resolution of the uploaded picture is not good.


## Our Data

APA makes available a repository for its animals that is roughly ~17k dog records and close to 40k for total animals. For the ~40k pets there looks to be ~140k photos. Here is a list of publicly accessible URLs such as t
his [example](https://www.shelterluv.com/sites/default/files/animal_pics/464/2018/07/11/21/20180711213702.png),
so a part of the project would be some data wrangling to go grab and persist the photos somewhere.

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

Build Vision Models:

We have used specifically the [DeepLabv3 Plus model](https://github.com/AvivSham/DeepLabv3) for our segmentation of dog images as well as for removing background of user uploaded dog images for better feature extractions.

To return our matched images from database, we first created embeddings using [EfficientNet B0](https://arxiv.org/pdf/1905.11946.pdf) for all dog images and saved them in GCP. We then used [Facebook AI Similarity Search (FAISS)](https://github.com/facebookresearch/faiss), developed by Facebook for efficient similarity search to yield our best matched dogs' photos (5 photos according to uploaded image).



Build Language Models:
Workshop will be an in-depth tutorial on transfer learning for natural language. Will cover state of the art mo
dels and how to perform transfer learning in general with practical examples. Topics that will be covered:

Concepts:

Seq2Seq
Attention & Self-attention
Transformers
Transfer learning
SOTA models - some flavor of BERT

Language models
Question answering models
Dialog models
Notebook to App:
Workshop will be an in-depth tutorial on bringing code from notebooks to self contained environments. Will cove
r different options for python environments with a primary focus on containerized development. Topics that will
 be covered:

Our App requires our deployment of the following containers

API container
Frontend


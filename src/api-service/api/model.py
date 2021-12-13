import os
import requests
import zipfile
import tarfile
import shutil
import math
import json
import time
import sys
import random
import re
import glob
import subprocess
import hashlib
import numpy as np
import pandas as pd
from glob import glob
import collections
import unicodedata
from PIL import Image
import matplotlib.pyplot as plt
from itertools import chain

# CV related 
import cv2
from api.deeplab.model import Deeplabv3

from urllib.parse import urlparse
from efficientnet.tfkeras import EfficientNetB0

import pyarrow.parquet as pq
import pyarrow as pa
import faiss

# Tensorflow
import tensorflow as tf

# NLP related
import torch
from torch.cuda import amp
import torch.nn.functional as F
from transformers import GPT2Config, GPT2LMHeadModel, GPT2DoubleHeadsModel, GPT2Tokenizer

# define all pathways here
model_local_path = "/persistent/models"
dataset_local_path = "/persistent/dataset"
gcp_path = "https://storage.googleapis.com"

dogs_path = os.path.join(gcp_path, "dogs_meta", "dogs.csv")
gcp_image_folder = os.path.join(gcp_path, "dogs_img", "dogs_resized")

# CV related parameters
IMG_SIZE = (224, 224)
num_channels = 3

# NLP related parameters
SPECIAL_TOKENS = ["<bos>", "<eos>", "<speaker1>", "<speaker2>", "<pad>"]
cuda_available = torch.cuda.is_available()
device = torch.device("cuda:0" if cuda_available else "cpu")

# main functions
def download_file(packet_url, base_path="", file_path='', extract=False, headers=None):
    if base_path != "":
        if not os.path.exists(base_path):
            os.mkdir(base_path)
    packet_file = os.path.basename(packet_url)
    with requests.get(packet_url, stream=True, headers=headers) as r:
        r.raise_for_status()
        with open(os.path.join(base_path,packet_file), 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    
    if extract:
        if packet_file.endswith(".zip"):
            with zipfile.ZipFile(os.path.join(base_path,packet_file)) as zfile:
                if not os.path.exists(base_path + '/' + file_path):
                    os.mkdir(base_path + '/' + file_path)
                zfile.extractall(base_path + '/' + file_path)
        else:
            packet_name = packet_file.split('.')[0]
            with tarfile.open(os.path.join(base_path,packet_file)) as tfile:
                tfile.extractall(base_path)

def get_all_dogs(dogs):
    # read in embeddings and photo csv
    emb = pq.read_table(os.path.join(dataset_local_path, 'embeddings')).to_pandas()    
    dogs_photos = pd.read_csv(os.path.join(dataset_local_path, 'dogs_photos.csv'))
    dogs_photos['filename'] = dogs_photos.PhotoUrl.apply(lambda url: os.path.basename(urlparse(url).path))
    # dogs memo
    dogs_memo = pd.read_csv(os.path.join(dataset_local_path, "dogs_memos_processed_IS.csv"))
    dogs_memo = dogs_memo.rename(columns={"AnimalInternal-ID": "AnimalInternalID"})
    # merge embeddigns and dogs photo
    emb['new_image_name'] = emb.image_name.apply(lambda x: x.decode("utf-8") + ".png" ) #convert byte literal to string
    merged_emb = emb.merge(dogs_photos,left_on='new_image_name',right_on='filename')
    merged_emb['img'] = gcp_image_folder + '/' + merged_emb['AnimalInternal-ID'].astype(str)  + '/'   + merged_emb['new_image_name'].astype(str)
    merged_emb = merged_emb.rename(columns={"AnimalInternal-ID": "AnimalInternalID"})
    merged_emb = merged_emb[["AnimalInternalID", "img"]]
    # merge emb and dogs meta and dogs memos
    merged_dogs = merged_emb.merge(dogs, on="AnimalInternalID", how="left")
    merged_dogs = merged_dogs.merge(dogs_memo, on="AnimalInternalID", how="left")
    # fill na values in memo columns
    merged_dogs = merged_dogs.fillna(value="Info not available yet, coming up soon ...")

    return merged_dogs

def load_dogs():
    # download embeddings and dogs meta
    download_datasets_packages()
    download_language_model()
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

def get_dogs_meta(img, dogs):
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
            "history": history,
            "img": img['img']}

def download_datasets_packages():
    if not os.path.exists(dataset_local_path):
        os.mkdir(dataset_local_path)
        download_file("https://storage.googleapis.com/dogs_meta/dogs_photos.csv", base_path=dataset_local_path)
        download_file("https://storage.googleapis.com/dogs_text/dogs_memos_processed_IS.csv", base_path=dataset_local_path, extract=False)
        download_file("https://storage.googleapis.com/dogs_img/embeddings.zip", base_path=dataset_local_path, file_path='embeddings', extract=True)
    
    # deeply troubleshoot, could not make it work. 
    # if not os.path.exists(deeplab_local_path + '/deeplab'):
    #     download_file("https://storage.googleapis.com/models_weights/deeplab.zip", base_path=deeplab_local_path, file_path='deeplab', extract=True)

    # # import deeplab
    # deeplab_path = os.path.join('/persistent', 'models', 'deeplab')
    # print(deeplab_path)
    # sys.path.append(deeplab_path)

    # from deeplab.model import Deeplabv3

def deeplab_segment(image_path):
    # read in image
    trained_image_width=512 
    mean_subtraction_value=127.5
    image = tf.io.read_file(image_path)
    image = tf.image.decode_jpeg(image, channels=num_channels).numpy()

    # resize to max dimension of images from training dataset
    w, h, _ = image.shape
    ratio = float(trained_image_width) / np.max([w, h])
    resized_image = np.array(Image.fromarray(image.astype('uint8')).resize((int(ratio * h), int(ratio * w))))

    # apply normalization for trained dataset images
    resized_image = (resized_image / mean_subtraction_value) - 1.

    # pad array to square image to match training images
    pad_x = int(trained_image_width - resized_image.shape[0])
    pad_y = int(trained_image_width - resized_image.shape[1])
    resized_image = np.pad(resized_image, ((0, pad_x), (0, pad_y), (0, 0)), mode='constant')

    # make prediction
    deeplab_model = Deeplabv3()
    res = deeplab_model.predict(np.expand_dims(resized_image, 0))
    labels = np.argmax(res.squeeze(), -1)

    # remove padding and resize back to original image
    if pad_x > 0:
        labels = labels[:-pad_x]
    if pad_y > 0:
        labels = labels[:, :-pad_y]
    labels = np.array(Image.fromarray(labels.astype('uint8')).resize((h, w)))

    # turn background pixel to 1
    labels[labels>0] = 1
    img_nobcgd = np.multiply(np.dstack((labels, labels, labels)),image)

    return img_nobcgd

def get_newimage_embedd(image_nobcgd):
    model = EfficientNetB0(weights='imagenet', include_top=False, pooling="avg")
    cur_img = image_nobcgd
    input_image = cv2.cvtColor(cv2.resize(cur_img, IMG_SIZE, interpolation = cv2.INTER_AREA),cv2.COLOR_BGRA2RGB)
    is_success, im_buf_arr = cv2.imencode(".jpg", input_image)
    input_image = im_buf_arr.tobytes()

    resized = tf.image.decode_jpeg(input_image, channels=3)
    resized = tf.image.convert_image_dtype(resized, tf.float32).numpy()
    pred = model.predict(resized.reshape(1,IMG_SIZE[0],IMG_SIZE[1],3))[0]

    return pred 

def load_preprocess_image(image_path):
    print("Image is loaded and being processed...")
    img_nobcgd = deeplab_segment(image_path)
    img_embedd = get_newimage_embedd(img_nobcgd)

    return img_embedd

def search(search_emb, k=8):
    # read in embeddings and photo csv
    emb = pq.read_table(os.path.join(dataset_local_path, 'embeddings')).to_pandas()    
    dogs_photos = pd.read_csv(os.path.join(dataset_local_path, 'dogs_photos.csv'))
    dogs_photos['filename'] = dogs_photos.PhotoUrl.apply(lambda url: os.path.basename(urlparse(url).path))
    # merge embeddigns and dogs photo
    emb['new_image_name'] = emb.image_name.apply(lambda x: x.decode("utf-8") + ".png" ) #convert byte literal to string
    merged_emb = emb.merge(dogs_photos,left_on='new_image_name',right_on='filename')
    merged_emb['folder'] = merged_emb['AnimalInternal-ID'].astype(str)  + '/'   + merged_emb['new_image_name'].astype(str)

    # similar image search
    # Create dictionary to easily translate id to name or vice-a-versa
    id_to_name = {k:v for k,v in enumerate(list(merged_emb["folder"]))}
    name_to_id = {v:k for k,v in id_to_name.items()}
    # Embeddings from dataframe/series to numpy array
    all_embeddings = np.stack(emb["embedding"].to_numpy())

    # Initalize "faiss Index" with embedding dimension and embeddings
    d = all_embeddings.shape[1]
    xb = all_embeddings
    index = faiss.IndexFlatIP(d)
    index.add(xb)
    
    D, I = index.search(np.expand_dims(search_emb, 0), k)     # actual search
    return list(zip(D[0], [id_to_name[x] for x in I[0]]))


def make_predict(image_path):
    img_embedd = load_preprocess_image(image_path)
    pred_image = search(img_embedd)
    # output json file
    pred_list = []
    for i, filename in enumerate(list(zip(*pred_image))[1]):
        pred_list.append(gcp_image_folder + '/' + filename)
    
    return pred_list

def download_language_model():
    if not os.path.exists(model_local_path):
        os.mkdir(model_local_path)
        download_file("https://storage.googleapis.com/dogs_text/finetuned_model_epochs_1_IS.zip",
                      base_path=model_local_path, extract=True)

def build_input_from_segments(persona, history, reply, tokenizer, lm_labels=False, with_eos=True):
    """ Build a sequence of input from 3 segments: persona, history and last reply. """
    bos, eos, speaker1, speaker2 = tokenizer.convert_tokens_to_ids(SPECIAL_TOKENS[:-1])
    sequence = [[bos] + list(chain(*persona))] + history + [reply + ([eos] if with_eos else [])]
    sequence = [sequence[0]] + [
        [speaker2 if (len(sequence) - i) % 2 else speaker1] + s for i, s in enumerate(sequence[1:])
    ]
    instance = {}
    instance["input_ids"] = list(chain(*sequence))
    instance["token_type_ids"] = [speaker2 if i % 2 else speaker1 for i, s in enumerate(sequence) for _ in s]
    instance["mc_token_ids"] = len(instance["input_ids"]) - 1
    instance["lm_labels"] = [-100] * len(instance["input_ids"])
    if lm_labels:
        instance["lm_labels"] = ([-100] * sum(len(s) for s in sequence[:-1])) + [-100] + sequence[-1][1:]
    return instance


def generate_sequence(personality, history, tokenizer, model, current_output=None):
    with torch.no_grad():
        with amp.autocast():
            special_tokens_ids = tokenizer.convert_tokens_to_ids(SPECIAL_TOKENS)
            if current_output is None:
                current_output = []

            # Args
            max_length = 20
            temperature = 0.7
            top_k = 0
            top_p = 0.9
            do_sample = True
            min_length = 1

            for i in range(max_length):
                instance = build_input_from_segments(
                    personality, history, current_output, tokenizer, with_eos=False
                )

                input_ids = torch.tensor(instance["input_ids"], device=device).unsqueeze(0)
                token_type_ids = torch.tensor(instance["token_type_ids"], device=device).unsqueeze(0)

                logits = model(input_ids, token_type_ids=token_type_ids)
                logits = logits[0]

                logits = logits[0, -1, :] / temperature
                logits = top_filtering(logits, top_k=top_k, top_p=top_p)
                probs = F.softmax(logits, dim=-1)

                prev = torch.topk(probs, 1)[1] if not do_sample else torch.multinomial(probs, 1)
                if i < min_length and prev.item() in special_tokens_ids:
                    while prev.item() in special_tokens_ids:
                        if probs.max().item() == 1:
                            break  # avoid infinite loop
                        prev = torch.multinomial(probs, num_samples=1)

                if prev.item() in special_tokens_ids:
                    break
                current_output.append(prev.item())
    return current_output

def top_filtering(logits, top_k=0.0, top_p=0.9, threshold=-float("Inf"), filter_value=-float("Inf")):
    top_k = min(top_k, logits.size(-1))
    if top_k > 0:
        # Remove all tokens with a probability less than the last token in the top-k tokens
        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
        logits[indices_to_remove] = filter_value

    if top_p > 0.0:
        # Compute cumulative probabilities of sorted tokens
        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
        cumulative_probabilities = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)

        # Remove tokens with cumulative probability above the threshold
        sorted_indices_to_remove = cumulative_probabilities > top_p
        # Shift the indices to the right to keep also the first token above the threshold
        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
        sorted_indices_to_remove[..., 0] = 0

        # Back to unsorted indices and set them to -infinity
        indices_to_remove = sorted_indices[sorted_indices_to_remove]
        logits[indices_to_remove] = filter_value

    indices_to_remove = logits < threshold
    logits[indices_to_remove] = filter_value

    return logits

def chat_with_dog(test_message, test_personality, test_history):
    # Load trained model
    model = GPT2DoubleHeadsModel.from_pretrained(os.path.join(model_local_path, 'trained_model_IS'))
    # Convert model parameter tensors to CUDA tensors
    model.to(device)
    # Load trained Tokenizer
    tokenizer = GPT2Tokenizer.from_pretrained(os.path.join(model_local_path, 'trained_model_IS'))

    # Tokenize test inputs
    personality = [tokenizer.encode(s.lower()) for s in test_personality]
    history = [tokenizer.encode(s) for s in test_history]
    history.append(tokenizer.encode(test_message))
    test_history.append(test_message)
    # Generate output
    output = generate_sequence(personality, history, tokenizer, model)
    output_text = tokenizer.decode(output, skip_special_tokens=True)
    test_history.append(output_text)

    return {"message": test_message,
            "answer": output_text}
    
# this is for debugging 
# if __name__ == "__main__":
    # test CV
    # print(os.path.join(dataset_local_path, 'docker_test.jpg'))
    # make_predict(os.path.join(dataset_local_path, 'docker_test.jpg'))

    # test NLP
    # download_language_model()
    # test_message = "can you tell me your name ?"
    # test_personality = ['I am Emma',
    #                     'I am a Dog',
    #                     'My gender is Female',
    #                     'My weight is 53.0',
    #                     'I was born on 2009',
    #                     'I am 11 years old',
    #                     'My breed is Retriever, Yellow Labrador',
    #                     'My color is White/Yellow',
    #                     'I am house trained',
    #                     'i like to play with toys']
    # test_history = ["Hi",
    #                 "woof woof"]

    # chat_with_dog(test_message, test_personality, test_history)



import os
import requests
import zipfile
import tarfile
import shutil
import math
import json
import time
import sys
import cv2
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

from api.deeplab.model import Deeplabv3

from urllib.parse import urlparse
from efficientnet.tfkeras import EfficientNetB0

import pyarrow.parquet as pq
import pyarrow as pa
import faiss

# Tensorflow
import tensorflow as tf

deeplab_local_path = "/persistent/models"
dataset_local_path = "/persistent/dataset"
IMG_SIZE = (224, 224)
num_channels = 3

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


def download_datasets_packages():
    if not os.path.exists(dataset_local_path):
        os.mkdir(dataset_local_path)
        download_file("https://storage.googleapis.com/dogs_meta/dogs_photos.csv", base_path=dataset_local_path)
        #download_file("https://storage.googleapis.com/dogs_img/dogs_resized.zip", base_path=dataset_local_path, extract=True)
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

def search(search_emb, k=5):
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
    pred_json = {}
    for i, filename in enumerate(list(zip(*pred_image))[1]):
        pred_json['image_' + str(i+1)] = filename
    
    return pred_json

# if __name__ == "__main__":
#     print(os.path.join(dataset_local_path, 'docker_test.jpg'))
#     make_predict(os.path.join(dataset_local_path, 'docker_test.jpg'))


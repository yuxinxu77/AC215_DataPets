import { BASE_API_URL } from "./Common";

const axios = require('axios');

const DataService = {
    Init: function () {
        // Any application initialization logic comes here
    },
    
    Predict: async function (formData) {
        return await axios.post(BASE_API_URL + "/predict", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    GetDogMeta: async function (obj) {
        return await axios.post(BASE_API_URL + "/getDogMeta", obj)
    },

    ChatWithDog: async function(obj) {
        return await axios.post(BASE_API_URL + "/chatwithdog", obj)
    }
}

export default DataService;
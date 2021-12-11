/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import DataService from "../../services/DataService";
import styles from './styles';
import 'react-chat-widget/lib/styles.css';

import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';

import Icon from "@material-ui/core/Icon";
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import { Widget,toggleWidget,dropMessages,addResponseMessage } from 'react-chat-widget';

const Browse = (props) => {
    const { classes } = props;

    console.log("================================== Home ======================================");

    const inputFile = useRef(null);

    // Component States
    const [filterBreed, setFilterBreed] = useState('');
    const [filterAgeGT, setAgeGT] = useState('');
    const [filterAgeLT, setAgeLT] = useState('');
    const [filterGender, setFilterGender] = useState('');

    const [dogs, setDogs] = useState(null);
    const [numImages, setNumImages] = useState(12);
    const [chatDog, setChatDog] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);

    // Store the list of breeds
    const [breeds, setBreeds] = useState([]);
    const loadBreeds = () => {
        DataService.GetBreeds()
            .then(function (response) {
                console.log(response.data);
                setBreeds(response.data);
            })
    }

    // // Chat 
    // const handleDogChat = (dog) => {
    //     dropMessages();
    //     console.log(dog);
    //     //setChatDog(dog);
    //     if (isChatWidgetOpen()){
    //         //toggleWidget();
    //     }
    //     addResponseMessage("Woof Woof! I'm " + dog.name + ".")
    //     addResponseMessage("Ask me anything.")
    // }

    // const displayChatWindow = () =>{
    //     if(!chatDog){
    //         return false;
    //     }else{
    //         return true;
    //     }
    // }

    // const closeChatWindow = () =>{
    //     dropMessages();
    //     if (!isChatWidgetOpen()){
    //         toggleWidget();
    //     }
    //     setChatDog(null);
    // }

    // const isChatWidgetOpen = () => {
    //     if(!chatDog){
    //         return false;
    //     }else{
    //         return true;
    //     }
    // }

    // const isDogHighlited = (dog) => {
    //     let style = {};
    //     let selectedStyle = {
    //         //border:"7px solid #31a354"
    //         border: "7px dashed #000000",
    //         opacity: 1
    //     }
    //     if(chatDog && (dog.AnimalInternalID == chatDog.AnimalInternalID)){
    //         style = selectedStyle
    //     }
    //     return style;
    // }

    // const handleChatWithDog = (message) => {
    //     var history = [...chatHistory];
    //     console.log(message);
    //     let chat = {
    //         "personality":chatDog.persona,
    //         "history": chatDog.history,
    //         "message":message
    //     }
    //     // Chat with backend API
    //     DataService.ChatWithDog(chat)
    //         .then(function (response) {
    //             console.log(response.data);
    //             let chat_response = response.data;
    //             addResponseMessage(chat_response["answer"]);
    //             console.log(chat_response)
    //             history.push(chat_response["question"]);
    //             history.push(chat_response["response_message"]);

    //             // control the length of history
    //             history = history.slice(Math.max(history.length - 5, 0))

    //             setChatHistory(history);
    //             console.log(history)
    //         })
    // }

    // Setup Component
    useEffect(() => {
        getDogs();
        //closeChatWindow();
        loadBreeds();
    }, []);


    // Event handlers
    // const handleImageUploadClick = () => {
    //     inputFile.current.click();
    // }

    // const handleImageUpload = (files) => {
    //     console.log(files);
    //     var formData = new FormData();
    //     formData.append("file", files[0]);
    //     formData.append("filename", files[0]["name"]);

    //     DataService.Predict(formData)
    //         .then(function (response) {
    //             console.log(response.data);
    //             setPrediction(response.data);
    //         })
    // };


    // const handleOnChange = (event) => {
    //     setPrediction(null);
    //     console.log(event.target.files);
    //     setImage(URL.createObjectURL(event.target.files[0]));

    //     var formData = new FormData();
    //     formData.append("file", event.target.files[0]);
    //     DataService.Predict(formData)
    //         .then(function (response) {
    //             console.log(response.data);
    //             setPrediction(response.data);
    //         })
    // }
    // const ImageClicked = (img) => {
    //     //dropMessages();
    //     setSelectedImage(img);
    //     console.log(img);
    //     DataService.GetDogMeta({"img": img})
    //             .then(function (response) {
    //                 console.log(response.data);
    //                 setChatDog(response.data);
    //                 handleDogChat(response.data)}
    //             );
    // }
    const handleBreedChange = (event) => {
        setFilterBreed(event.target.value);
        //console.log(event.target.value);
        //console.log(filterBreed);
    };
    const handleAgeGTChange = (event) => {
        setAgeGT(event.target.value);
    };
    const handleAgeLTChange = (event) => {
        setAgeLT(event.target.value);
    };
    const handleGenderChange = (event) => {
        setFilterGender(event.target.value);
    };

    const findFilterDogs = () => {
        DataService.FindFilterDogs({"breed":filterBreed, "agegt":filterAgeGT, "agelt":filterAgeLT, 'gender':filterGender})
            .then(function (response) {
                setDogs(shuffle(response.data));
                console.log(shuffle(response.data));
            })
    }

    // Methods
    const shuffle = (data) => {
        return data
            .map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => (a.value))
            .slice(0, numImages)
    }
    const isThumnailHighlited = (image, row) => {
        var style = {};

        var selectedStyle = {
            border: "7px dashed #000000",
            opacity: 1
        }

        if (image && (row == image)) {
            style = selectedStyle
        }

        return style;
    }

    const getDogs = () => {
        DataService.GetDogs()
            .then(function (response) {
                console.log(shuffle(response.data));
                setDogs(shuffle(response.data));
            })
    }

    return (
        <div className={classes.root}>
            <main className={classes.main}>

                <Container fixed style={{paddingLeft:75,paddingRight:75,paddingTop:50}}>
                        <Grid container spacing={3}>
                            <Paper className={classes.paper}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel>Breed:</InputLabel>
                                    <Select value={filterBreed} onChange={handleBreedChange}>
                                        <MenuItem key={-1} value=''>-Select-</MenuItem>
                                        {breeds.map((breed,i) => (
                                            <MenuItem key={i} value={breed}>{breed}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl className={classes.formControl}>
                                    <InputLabel>Gender:</InputLabel>
                                    <Select value={filterGender} onChange={handleGenderChange}>
                                        <MenuItem key={-1} value=''>-Select-</MenuItem>
                                        <MenuItem key={0} value='Female'>Female</MenuItem>
                                        <MenuItem key={1} value='Male'>Male</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        label="Age &#62; (years)"
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        variant="outlined"
                                        //style = {{width: 100}}
                                        value={filterAgeGT}
                                        onChange={handleAgeGTChange}
                                    />
                                </FormControl>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        label="Age &#60; (years)"
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        variant="outlined"
                                        value={filterAgeLT}
                                        onChange={handleAgeLTChange}
                                    />
                                </FormControl>
                                <FormControl >
                                    <Button className={classes.greenButton} variant="contained" size="large" style={{paddingTop:15, paddingBottom:15}}
                                            onClick={findFilterDogs}>
                                        Fetch Dogs
                                    </Button>
                                </FormControl>
                          
                            </Paper>
                        </Grid>
                </Container>

                {dogs &&
                    <Container fixed style={{paddingLeft:60,paddingRight:60, paddingTop:20, paddingBottom:20}}>
                        <Grid container spacing={0}>
                            {dogs.map((dog) => (
                                <Grid key={dog.AnimalID} item xs={4}>
                                    <Card className={classes.card} style={isThumnailHighlited(dog)}>
                                        <CardMedia
                                            className={classes.media}
                                            image={dog.img}
                                            title={dog.AnimalName}
                                        />
                                        <CardHeader
                                            title={dog.AnimalName}
                                            subheader={dog.AnimalBreed+', '+dog.Age+' year(s)'}
                                        />
                                        {/* <CardActions disableSpacing>
                                            <Checkbox
                                                color="primary"
                                                value={dog.ImageID}
                                                onChange={handleSelectDog}
                                            />
                                        </CardActions> */}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                }
            </main>
        </div>
    );
};

export default withStyles(styles)(Browse);
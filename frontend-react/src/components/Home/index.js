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
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';

import Icon from "@material-ui/core/Icon";
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import { Widget,toggleWidget,dropMessages,addResponseMessage } from 'react-chat-widget';

const Home = (props) => {
    const { classes } = props;

    console.log("================================== Home ======================================");

    const inputFile = useRef(null);

    // Component States
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [numImages, setNumImages] = useState(12);
    const [selectedImage, setSelectedImage] = useState(null);
    const [chatDog, setChatDog] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);

    // Chat 
    const handleDogChat = (dog) => {
        dropMessages();
        console.log(dog);
        setChatDog(dog);
        if (isChatWidgetOpen()){
            toggleWidget();
        }
        addResponseMessage("Woof Woof! I'm " + dog.name + ".")
        addResponseMessage("Ask me anything.")
    }

    const displayChatWindow = () =>{
        if(!chatDog){
            return false;
        }else{
            return true;
        }
    }

    const closeChatWindow = () =>{
        dropMessages();
        if (!isChatWidgetOpen()){
            toggleWidget();
        }
        setChatDog(null);
    }

    const isChatWidgetOpen = () => {
        if(!chatDog){
            return false;
        }else{
            return true;
        }
    }

    const isDogHighlited = (dog) => {
        let style = {};
        let selectedStyle = {
            //border:"7px solid #31a354"
            border: "7px dashed #000000",
            opacity: 1
        }
        if(chatDog && (dog.AnimalInternalID == chatDog.AnimalInternalID)){
            style = selectedStyle
        }
        return style;
    }

    const handleChatWithDog = (message) => {
        var history = [...chatHistory];
        console.log(message);
        let chat = {
            "dog":chatDog,
            "history": history,
            "input_message":message
        }
        // Chat with backend API
        DataService.ChatWithDog(chat)
            .then(function (response) {
                console.log(response.data);
                let chat_response = response.data;
                addResponseMessage(chat_response["response_message"]);
                history.push(message);
                history.push(chat_response["response_message"]);

                // if(history.length > 5){
                //
                // }
                history = history.slice(Math.max(history.length - 5, 0))

                setChatHistory(history);
                console.log(history)
            })
    }

    // Setup Component
    useEffect(() => {
        closeChatWindow();
    }, []);


    // Handlers
    const handleImageUploadClick = () => {
        inputFile.current.click();
    }
    const handleOnChange = (event) => {
        setPrediction(null);
        console.log(event.target.files);
        setImage(URL.createObjectURL(event.target.files[0]));

        var formData = new FormData();
        formData.append("file", event.target.files[0]);
        DataService.Predict(formData)
            .then(function (response) {
                console.log(response.data);
                setPrediction(response.data);
            })
    }
    const ImageClicked = (img) => {
        setSelectedImage(img);
        console.log(img);
        DataService.GetDogMeta({"img": img})
                .then(function (response) {
                    console.log(response.data);
                    setChatDog(response.data);
                    handleDogChat(response.data)}
                );
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

    return (
        <div className={classes.root}>
            <main className={classes.main}>
                <Container maxWidth="md" className={classes.container}>

                    <div className={classes.dropzone} onClick={() => handleImageUploadClick()}>
                        <input
                            type="file"
                            accept="image/*"
                            capture="camera"
                            on
                            autocomplete="off"
                            tabindex="-1"
                            className={classes.fileInput}
                            ref={inputFile}
                            onChange={(event) => handleOnChange(event)}
                        />
                        <div><img className={classes.preview} src={image} /></div>
                        <div className={classes.help}>Click to take a picture or upload...</div>
                    </div>
                    
                    {prediction &&
                        <Typography variant="h5" gutterBottom align='center'>Dogs Found from Database
                            <Grid container spacing={3}>
                                {/* <Grid item xs={4}></Grid> */}
                                <Grid item xs={4}>
                                    <GridList cellHeight={200} className={classes.gridList} cols={4} spacing={2}>
                                        {prediction.map(img => (
                                            <GridListTile key={img}
                                                onClick={(e) => ImageClicked(img)}
                                                className={classes.thumbnailImage}
                                                style={isThumnailHighlited(selectedImage, img)}>
                                                <img src={img} />
                                            </GridListTile>
                                        ))}
                                    </GridList>
                                </Grid>
                                {/* <Grid item xs={4}></Grid> */}
                            </Grid>
                            {displayChatWindow() && (
                                <div>
                                    <Widget
                                        title={'Chat with '+ chatDog.name + ' 🐶 '}
                                        subtitle={chatDog.breed}
                                        handleNewUserMessage={handleChatWithDog}
                                    />
                                </div>
                            )}
                        </Typography>
                    }
                </Container>
            </main>
        </div>
    );
};

export default withStyles(styles)(Home);
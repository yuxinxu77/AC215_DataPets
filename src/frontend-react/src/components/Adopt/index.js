/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import DataService from "../../services/DataService";
import 'react-chat-widget/lib/styles.css';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { Widget,toggleWidget,dropMessages,addResponseMessage } from 'react-chat-widget';
import styles from './styles';

const Adopt = (props) => {
    const { classes } = props;

    console.log("================================== Adopt ======================================");

    const inputFile = useRef(null);

    // Component States
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [chatDog, setChatDog] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);

    // Chat 
    const handleDogChat = (dog) => {
        dropMessages();
        console.log(dog);
        //setChatDog(dog);
        if (isChatWidgetOpen()){
            //toggleWidget();
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

    const handleChatWithDog = (message) => {
        var history = [...chatHistory];
        console.log(message);
        let chat = {
            "personality":chatDog.persona,
            "history": chatDog.history,
            "message":message
        }
        // Chat with backend API
        DataService.ChatWithDog(chat)
            .then(function (response) {
                console.log(response.data);
                let chat_response = response.data;
                addResponseMessage(chat_response["answer"]);
                console.log(chat_response)
                history.push(chat_response["question"]);
                history.push(chat_response["response_message"]);

                // control the length of history
                history = history.slice(Math.max(history.length - 5, 0))

                setChatHistory(history);
                console.log(history)
            })
    }

    // Setup Component
    useEffect(() => {
        closeChatWindow();
    }, []);


    // Event handlers
    const handleImageUploadClick = () => {
        inputFile.current.click();
    }

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
        //dropMessages();
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

export default withStyles(styles)(Adopt);
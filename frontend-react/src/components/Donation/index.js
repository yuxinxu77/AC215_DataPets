/* eslint-disable */ 
import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';


import DataService from "../../services/DataService";
import styles from './styles';


const Donation = (props) => {
    const { classes } = props;

    console.log("================================== Donation ======================================");

    // Component States
    const [numImages, setNumImages] = useState(12);
    const [contentImages, setContentImages] = useState([]);
    const [styleImages, setStyleImages] = useState([]);
    const [selectedContentImage, setSelectedContentImage] = useState(null);
    const [selectedStyleImage, setSelectedStyleImage] = useState(null);
    const [prediction, setPrediction] = useState(null);

    const loadContentImages = () => {
        DataService.StyleTransferGetContentImages()
            .then(function (response) {
                console.log(response.data);
                setContentImages(shuffle(response.data));
            })
    }
    const loadStyleImages = () => {
        DataService.StyleTransferGetStyleImages()
            .then(function (response) {
                console.log(response.data);
                setStyleImages(shuffle(response.data));
            })
    }
    const applyStyleTransfer = () => {

        setPrediction(null);

        if (selectedStyleImage && selectedContentImage) {
            DataService.StyleTransferApplyStyleTransfer(selectedStyleImage, selectedContentImage)
                .then(function (response) {
                    try {
                        console.log(response.data);
                        setPrediction(response.data);

                    } catch (e) {
                        console.log(e)
                    }
                })
        }

    }


    // Setup Component
    useEffect(() => {

    }, []);

    // Handlers



    return (
        <div className={classes.root}>
            <main className={classes.main}>
                <Container maxWidth={false} className={classes.container}>
                    <Typography>This is a blank page...</Typography>
                </Container>
            </main>
        </div>
    );
};

export default withStyles(styles)(Donation);
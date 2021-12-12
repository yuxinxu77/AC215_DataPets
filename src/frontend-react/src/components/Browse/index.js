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

    // Store the list of breeds
    const [breeds, setBreeds] = useState([]);
    const loadBreeds = () => {
        DataService.GetBreeds()
            .then(function (response) {
                console.log(response.data);
                setBreeds(response.data);
            })
    }
    // Set card state when hovering
    const [state, setState] = useState({
        raised: [...new Array(numImages)].map((item, idx) => false),
        shadow: [...new Array(numImages)].map((item, idx) => 1),
      })

    // Setup Component
    useEffect(() => {
        getDogs();
        loadBreeds();
    }, []);


    // Event handlers
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
                                        Fetch My Dogs!
                                    </Button>
                                </FormControl>
                          
                            </Paper>
                        </Grid>
                </Container>
                {!dogs &&
                    <CircularProgress className={classes.progressBar} disableShrink />
                }
                {dogs &&
                    <Container fixed style={{paddingLeft:60,paddingRight:60, paddingTop:20, paddingBottom:20}}>
                        <Grid container spacing={0}>
                            {dogs.map((dog,i) => (
                                <Grid key={dog.AnimalID} item xs={4}>
                                    <Card className={classes.card} style={isThumnailHighlited(dog.img)}
                                          classes={{root: state.raised[i] ? classes.cardHovered : ""}}
                                          onMouseOver={()=>setState({ raised:[...new Array(numImages)].map((item, idx) => 
                                                                              idx === i ? true : false), 
                                                                      shadow:[...new Array(numImages)].map((item, idx) => 
                                                                              idx === i ? 3 : 1)})}  
                                          onMouseOut={()=>setState({ raised:[...new Array(numImages)].map((item, idx) => false),
                                                                     shadow:[...new Array(numImages)].map((item, idx) => 1)})}  
                                                                             
                                          raised={state.raised[i]} zdepth={state.shadow[i]}>
                                        <CardMedia
                                            className={classes.media}
                                            image={dog.img}
                                            title={dog.AnimalName}
                                        />
                                        {state.raised[i] &&
                                            <div className={classes.overlay}>
                                                About Me:
                                                <br />
                                                {dog.MemoText}
                                            </div>
                                        }
                                        <CardHeader
                                            title={dog.AnimalName}
                                            subheader={dog.AnimalBreed+', '+dog.Age+' year(s)'}
                                        />
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
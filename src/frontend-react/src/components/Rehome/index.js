/* eslint-disable */ 
import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Button from "@material-ui/core/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from '@material-ui/core/InputLabel';
//import FlashMessage from "react-native-flash-message";


import DataService from "../../services/DataService";
import styles from './styles';


const Rehome = (props) => {
    const { classes } = props;

    console.log("================================== Rehome ======================================");

    const inputFile = useRef(null);

    // Component States
    const [image, setImage] = useState(null);
    const defaultValues = {
        name: "",
        sex: "",
        dob: "",
        weight: 0,
        color: "",
        breed: "",
        pattern: "",
      };
    const [formValues, setFormValues] = useState(defaultValues)
    const [formSubmit, setFormSubmit] = useState(false)

    // Setup Component
    useEffect(() => {
        setFormSubmit(false)
    }, []);

    // Handlers
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
          ...formValues,
          [name]: value,
        });
      };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!formSubmit) {
            //document.querySelector(".confirmationContainer").style.display = "none"
            setFormSubmit(true)
          } else {
            //document.querySelector(".confirmationContainer").style.display = "flex"
            setFormSubmit(false)
        }
    };

    const handleConfirmationBox = (event) => {
        event.preventDefault();
        setFormValues(defaultValues)
        setFormSubmit(false)
    }

    return (
        <div className={classes.root}>
            <main className={classes.main}>
                <Container maxWidth={"md"} className={classes.container}>
                                        
                    <Typography variant="h5" gutterBottom align='center'>Fill in the Information to Rehome Your Pet!</Typography>
                    <form onSubmit={handleConfirmationBox} className={classes.formContainer}>
                        <Grid container alignItems="center" justify="center" direction="column">
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="name-input"
                                    name="name"
                                    label="Name"
                                    type="text"
                                    value={formValues.name}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Grid item>
                                <FormControl className={classes.dropdown}>
                                    <InputLabel>Sex</InputLabel>
                                    <Select
                                        name="sex"
                                        value={formValues.sex}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem key="male" value="male">
                                            Male
                                        </MenuItem>
                                        <MenuItem key="female" value="female">
                                            Female
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid><br></br>
                            <Grid item>
                                {formSubmit &&
                                    <div className="confirmationContainer" style={{ display: "flex",
                                                                                    flex: 1,
                                                                                    flexDirection: "column",
                                                                                    position: "relative",
                                                                                    alignItems: "center",
                                                                                    backgroundColor: "#a19d9d",
                                                                                    //backgroundColor: "#524e4e",
                                                                                    borderRadius: "25px",
                                                                                    textAlign: "center",
                                                                                    padding: "20px",
                                                                                    backgroundPosition: "center",
                                                                                    width: "300px"}}>
                                        <Typography>
                                            You successfully added information for rehome!
                                        </Typography>
                                        <Button 
                                            variant="contained" color="primary" type="submit"
                                            onClick={(evnet) => handleConfirmationBox(event)}>
                                            OK
                                        </Button>
                                    </div>
                                }  
                            </Grid>
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="dob-input"
                                    name="dob"
                                    label="DOB"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formValues.dob}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="weight-input"
                                    name="weight"
                                    label="Weight"
                                    type="number"
                                    min='0'
                                    value={formValues.weight}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="color-input"
                                    name="color"
                                    label="Color"
                                    type="text"
                                    value={formValues.color}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="breed-input"
                                    name="breed"
                                    label="Breed"
                                    type="text"
                                    value={formValues.breed}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Grid item>
                                <TextField
                                    className={classes.textfield}
                                    id="pattern-input"
                                    name="pattern"
                                    label="Pattern"
                                    type="text"
                                    value={formValues.pattern}
                                    onChange={(event) => handleInputChange(event)}
                                />
                            </Grid><br></br>
                            <Button variant="contained" color="primary" type="submit"
                                    onClick={(event) => handleFormSubmit(event)}>
                                Submit
                            </Button>
                        </Grid>
                    </form> 
                    <br></br>
                    {/* <FlashMessage duration={2000} style={{ backgroundColor: "#41d42a"}}>
                        <strong>I will disapper in 5 seconds!</strong>
                    </FlashMessage> */}
                </Container>
            </main>
        </div>
    );
};

export default withStyles(styles)(Rehome);
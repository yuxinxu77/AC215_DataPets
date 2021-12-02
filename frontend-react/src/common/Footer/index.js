/* eslint-disable */ 
import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import styles from './styles';

const Footer = (props) => {
    const { classes } = props;
    const { history } = props;

    console.log("================================== Footer ======================================");

    // Component States

    // Setup Component
    useEffect(() => {

    }, []);

    return (
        <div className={classes.root}>
            <Typography align='left' variant="caption">
                Copyright © 2021 Harvard AC215 DataPets. All rights reserved.
            </Typography>

        </div>
    );
};

export default withStyles(styles)(Footer);
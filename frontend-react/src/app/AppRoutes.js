/* eslint-disable */ 
import React from "react";
import { Route, Switch, Redirect } from 'react-router-dom';
import Browse from "../components/Browse";
import Error404 from '../components/Error/404';
import Adopt from '../components/Adopt';
import Rehome from '../components/Rehome';

const AppRouter = (props) => {

  console.log("================================== AppRouter ======================================");

  return (
    <React.Fragment>
      <Switch>
        <Route path="/" exact component={Browse} />
        <Route path="/adopt" exact component={Adopt} />
        <Route path="/rehome" exact component={Rehome} />
        <Route component={Error404} />
      </Switch>
    </React.Fragment>
  );
}

export default AppRouter;
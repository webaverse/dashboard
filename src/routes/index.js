import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Browse from './Browse';
import BrowseInfo from './BrowseInfo';
import Mint from './Mint';
import Creators from './Creators';
import Accounts from './Accounts';
import Settings from './Settings';
import Login from './Login';
import Home from './Home';
import NotFound from './NotFound';

export default () => 
  <Switch>
    <Route exact path="/discord" component={() => {
      window.location.href = "https://discord.gg/R5wqYhvv53";
      return null;
    }}/>
    <Route exact path="/discordlogin" component={() => {
      window.location.href = "https://discord.com/api/oauth2/authorize?client_id=684141574808272937&redirect_uri=https%3A%2F%2Fwebaverse.com%2Flogin&response_type=code&scope=identify";
      return null;
    }}/>
    <Route path='/accounts/:id' component={() => <Accounts />} />
    <Route path='/creators' component={() => <Creators />} />
    <Route path='/browse' component={() => <Browse />} />
    <Route path='/mint' component={() => <Mint />} />
    <Route path='/login' component={() => <Login />} />
    <Route path='/settings' component={() => <Settings />} />
    <Route path='/' exact component={() => <Home />} />
    <Route path='/*' component={() => <NotFound />} />
  </Switch>

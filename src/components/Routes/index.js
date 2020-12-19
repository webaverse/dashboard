import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import Browse from '../Browse';
import BrowseInfo from '../BrowseInfo';
import Mint from '../Mint';
import Creators from '../Creators';
import Accounts from '../Accounts';
import Settings from '../Settings';
import Home from '../Home';
import NotFound from '../NotFound';

export default () => 
  <>
    <Switch>
      <Route path='/accounts/:id' component={() => <Accounts />} />
      <Route path='/creators' component={() => <Creators />} />
      <Route path='/browse/:id' component={() => <BrowseInfo />} />
      <Route path='/browse' component={() => <Browse />} />
      <Route path='/mint' component={() => <Mint />} />
      <Route path='/settings' component={() => <Settings />} />
      <Route path='/' exact component={() => <Home />} />
      <Route path='/*' component={() => <NotFound />} />
    </Switch>
  </>

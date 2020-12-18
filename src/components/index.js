import React, { Suspense, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { AppContext } from "../libs/contextLib";
import NavBar from './NavBar';
import '../assets/css/custom.css';

const Loader = () =>  <BounceLoader css={"display: inline-block"} size={50} color={"#a00"} />
const history = createHistory()

const SignIn = React.lazy(() => import('./SignIn'));
const Browse = React.lazy(() => import('./Browse'));
const Mint = React.lazy(() => import('./Mint'));
const Accounts = React.lazy(() => import('./Accounts'));
const Account = React.lazy(() => import('./Account'));
const Settings = React.lazy(() => import('./Settings'));
const Home = React.lazy(() => import('./Home'));
const NotFound = React.lazy(() => import('./NotFound'));


const App = () => {
  const [globalState, setGlobalState] = useState({
    useWebXR: false,
    loginToken: null,
    name: null,
    mainnetAddress: null,
    mainnetFtBalance: null,
    mainnetInventory: null,
    showUserDropdown: false,
    address: null,
    avatarUrl: null,
    avatarFileName: null,
    avatarPreview: null,
    homespaceUrl: null,
    homespaceFileName: null,
    homespacePreview: null,
    ftu: true,
    inventory: null,
    creatorProfiles: {},
    creatorInventories: {},
    creatorBooths: {},
    creators: {},
    booths: {},
    lastFileHash: null,
    lastFileId: null
  });

  return (
    <>
      <NavBar />
      <Router history={history}>
        <AppContext.Provider value={{ globalState, setGlobalState }}>
          <Switch>
            <Route path='/accounts/:id' component={() => <Suspense fallback={Loader}><Accounts /></Suspense>} />
            <Route path='/account' component={() => <Suspense fallback={Loader}><Account /></Suspense>} />
            <Route path='/browse' component={() => <Suspense fallback={Loader}><Browse /></Suspense>} />
            <Route path='/mint' component={() => <Suspense fallback={Loader}><Mint /></Suspense>} />
            <Route path='/settings' component={() => <Suspense fallback={Loader}><Settings /></Suspense>} />
            <Route path='/sign-in' component={() => <Suspense fallback={Loader}><SignIn /></Suspense>} />
            <Route path='/' exact component={() => <Suspense fallback={Loader}><Home /></Suspense>} />
            <Route path='/*' component={() => <Suspense fallback={Loader}><NotFound /></Suspense>} />
          </Switch>
        </AppContext.Provider>
      </Router>
    </>
  )
}

export default App

import React, { Suspense, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { AppContext } from "../libs/contextLib";
import MoonLoader from "react-spinners/MoonLoader";
import NavBar from './NavBar';
import '../assets/css/custom.css';
import '../assets/css/content.css';

const Loader = () =>  <MoonLoader css={"display: inline-block"} size={50} color={"#c4005d"} />
const history = createHistory()

const Browse = React.lazy(() => import('./Browse'));
const BrowseInfo = React.lazy(() => import('./BrowseInfo'));
const Mint = React.lazy(() => import('./Mint'));
const Creators = React.lazy(() => import('./Creators'));
const Accounts = React.lazy(() => import('./Accounts'));
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
            <Route path='/creators' component={() => <Suspense fallback={Loader}><Creators /></Suspense>} />
            <Route path='/browse/:id' component={() => <Suspense fallback={Loader}><BrowseInfo /></Suspense>} />
            <Route path='/browse' component={() => <Suspense fallback={Loader}><Browse /></Suspense>} />
            <Route path='/mint' component={() => <Suspense fallback={Loader}><Mint /></Suspense>} />
            <Route path='/settings' component={() => <Suspense fallback={Loader}><Settings /></Suspense>} />
            <Route path='/' exact component={() => <Suspense fallback={Loader}><Home /></Suspense>} />
            <Route path='/*' component={() => <Suspense fallback={Loader}><NotFound /></Suspense>} />
          </Switch>
        </AppContext.Provider>
      </Router>
    </>
  )
}

export default App

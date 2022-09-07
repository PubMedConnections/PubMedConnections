import React, {useEffect, useState} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import {
  ConnectionsWrapper,
  Explore,
  Snapshots,
} from './containers/connections';
import PrivateRoutes from './utils/PrivateRoutes';
import { createTheme, ThemeProvider } from '@mui/material';
import { useSelector } from 'react-redux/es/exports';
import Register from "./containers/Register";
import {useDispatch} from "react-redux";
import {GET} from "./utils/APIRequests";
import {setAuth} from "./store/slices/userSlice";
import LinearProgress from "@mui/material/LinearProgress";

const MUITheme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#776fed',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

function App() {
  const userLoggedIn = useSelector((store) => store.user.success);
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(!userLoggedIn)

  useEffect(() => {
    if (!userLoggedIn) {  // E.g. on reload, or coming back to the website later on
      GET('auth/check_authentication')
          .then((resp) => {
            if (resp.data.success) {
              dispatch(setAuth({success: true, username: resp.data.current_user}))
              setLoading(false);
            }
          })
          .catch(err => {
            setLoading(false);
          });
    }
  }, [userLoggedIn, dispatch])

  return (
    <ThemeProvider theme={MUITheme}>
      {loading ? <LinearProgress /> :
          (
      <Routes>
        <Route path='/' element={<Home />} exact></Route>
        <Route
          path='/login'
          element={userLoggedIn ? <Navigate to='/connections' /> : <Login />}
        />
        <Route
            path='/register'
            element={userLoggedIn ? <Navigate to='/connections' /> : <Register />}
        />
        <Route element={<PrivateRoutes />}>
          <Route path='/connections' element={<ConnectionsWrapper />}>
            <Route index element={<Navigate to='explore' />} />
            <Route path='snapshots' element={<Snapshots />} />
            <Route path='explore' element={<Explore />} />
          </Route>
        </Route>
      </Routes>)}
    </ThemeProvider>
  );
}

export default App;

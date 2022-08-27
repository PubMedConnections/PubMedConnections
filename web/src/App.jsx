import React from 'react';
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
  const isLoggedIn = useSelector((store) => store.user.success);
  return (
    <ThemeProvider theme={MUITheme}>
      <Routes>
        <Route path='/' element={<Home />} exact></Route>
        <Route
          path='/login'
          element={isLoggedIn ? <Navigate to='/connections' /> : <Login />}
        ></Route>
        <Route element={<PrivateRoutes />}>
          <Route path='/connections' element={<ConnectionsWrapper />}>
            <Route index element={<Navigate to='explore' />} />
            <Route path='snapshots' element={<Snapshots />} />
            <Route path='explore' element={<Explore />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;

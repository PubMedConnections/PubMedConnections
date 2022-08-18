import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Graph } from './components/graph';
import Home from './containers/Home';
import Login from './containers/Login';
import Connections from './containers/Connections';
import PrivateRoutes from './utils/PrivateRoutes';
import { createTheme, ThemeProvider } from '@mui/material';

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
  return (
    <ThemeProvider theme={MUITheme}>
      <Routes>
        <Route path='/' element={<Home />} exact></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route element={<PrivateRoutes />}>
          <Route path='/connections' element={<Connections />}>
            <Route index element={<Navigate to='explore' />} />
            <Route path='snapshots' element={<Graph />} />
            <Route path='explore' element={<Graph />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;

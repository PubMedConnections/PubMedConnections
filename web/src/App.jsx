import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './containers/Home';
import Login from './containers/Login';
import Connections from './containers/Connections';
import PrivateRoutes from './utils/PrivateRoutes';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} exact></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route element={<PrivateRoutes />}>
          <Route path='/connections' element={<Connections />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;

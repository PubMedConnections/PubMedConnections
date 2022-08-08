import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './containers/Home';
import Login from './containers/Login';
import Connections from './containers/Connections';

const Main = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/connections' element={<Connections />}></Route>
        </Routes>
    );
}

export default Main;
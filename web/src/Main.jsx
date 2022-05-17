import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Connections from './pages/Connections';

const Main = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate replace to="/home" />} />
            <Route path='/home' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/connections' element={<Connections />}></Route>
        </Routes>
    );
}

export default Main;
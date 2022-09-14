import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import React, {} from 'react';

const PrivateRoutes = () => {
  const userLoggedIn = true
  return userLoggedIn ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes;

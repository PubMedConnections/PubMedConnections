import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import React, {} from 'react';

const PrivateRoutes = () => {
  const userLoggedIn = useSelector((store) => store.user.success);
  return userLoggedIn ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes;

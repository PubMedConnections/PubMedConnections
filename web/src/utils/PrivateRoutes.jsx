import { useSelector, useDispatch } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import LinearProgress from "@mui/material/LinearProgress";
import {GET} from "./APIRequests";
import {setAuth} from '../store/slices/userSlice'

const PrivateRoutes = () => {
  const userLoggedIn = useSelector((store) => store.user.success);
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(!userLoggedIn)

  useEffect(() => {
      if (!userLoggedIn) {  // E.g. on reload, or coming back to the website later on
          GET('auth/check_authentication')
              .then((resp) => {
                  dispatch(setAuth({success: true}))
                  setLoading(false);
              })
              .catch(err => {
                  setLoading(false);
              });
      }
  }, [])

  return loading ? <LinearProgress /> : (userLoggedIn ? <Outlet /> : <Navigate to='/login' />);
};

export default PrivateRoutes;

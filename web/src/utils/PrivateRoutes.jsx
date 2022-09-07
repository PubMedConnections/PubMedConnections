import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import LinearProgress from "@mui/material/LinearProgress";
import {GET} from "./APIRequests";

const PrivateRoutes = () => {
  const userLoggedIn = useSelector((store) => store.user.success);

  const [loading, setLoading] = useState(!userLoggedIn)
  const [loggedIn, setloggedIn] = useState(userLoggedIn)

  useEffect(() => {
      if (!loggedIn) {  // E.g. on reload, or coming back to the website later on
          GET('auth/check_authentication')
              .then((resp) => {
                  setloggedIn(resp.data.success);
                  setLoading(false);
              })
              .catch(err => {
                  setLoading(false);
              });
      }
  }, [])

  return loading ? <LinearProgress /> : (loggedIn ? <Outlet /> : <Navigate to='/login' />);
};

export default PrivateRoutes;

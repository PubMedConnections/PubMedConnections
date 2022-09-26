import React, { useState, useEffect } from 'react';
import { AppBar } from '@mui/material';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Link, useNavigate } from 'react-router-dom';
import { CONNECTIONS_NAVBAR_HEIGHT } from '../../constants';
import {useLocation} from 'react-router-dom';
import {useSelector, useDispatch} from "react-redux";
import Button from "@mui/material/Button";
import {POST} from "../../utils/APIRequests";
import {clearAuth} from "../../store/slices/userSlice";
import {Logout} from "@mui/icons-material";

const ConnectionsNavigation = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.pathname === '/connections/explore' ? 0 : 1);
  const user = useSelector((state) => state.user.username);
  const dispatch = useDispatch()

  useEffect(() => {
      setSelectedTab(location.pathname === '/connections/explore' ? 0 : 1);
  }, [location.pathname])

    function logout()  {
        POST('auth/logout')
            .then((resp) => {
                if (resp.data.success) {
                    dispatch(clearAuth());
                }
            });
    }

  return (
    <AppBar
      position='fixed'
      color='secondary'
      sx={{ height: CONNECTIONS_NAVBAR_HEIGHT, zIndex: 1299 }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100vw !important',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <Link to={'/'}>
          <Box
            sx={{
              width: 150,
              paddingY: 1,
            }}
            component='img'
            src='/img/logo-with-text.png'
          />
        </Link>

        <div style={{ alignSelf: 'flex-end' }} id="tabs-and-logout">
            <Tabs value={selectedTab} id="tabs">
                <Tab
                    sx={{ fontSize: '1.1em !important' }}
                    label='Explore'
                    onClick={() => {
                        setSelectedTab(0);
                        navigate('/connections/explore');
                    }}
                />
                <Tab
                    sx={{ fontSize: '1.1em !important' }}
                    label='Snapshots'
                    onClick={() => {
                        setSelectedTab(1);
                        navigate('/connections/snapshots');
                    }}
                />
            </Tabs>

            <div id="tab-user-divider"></div>

            <div id="header-user-details">
                <p>Signed in as: &nbsp;
                    <strong>{user}</strong>
                    &nbsp;&nbsp;
                    <Button component={Link} to="/"
                            variant="contained"
                            onClick={logout}
                            id="logout-button"
                            color="primary"
                            endIcon={<Logout />}
                    >
                        Log out
                    </Button>
                </p>
            </div>
        </div>

      </div>
    </AppBar>
  );
};

export default ConnectionsNavigation;

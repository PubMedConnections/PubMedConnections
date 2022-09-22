import React, { useState, useEffect } from 'react';
import { AppBar } from '@mui/material';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Link, useNavigate } from 'react-router-dom';
import { CONNECTIONS_NAVBAR_HEIGHT } from '../../constants';
import {useLocation} from 'react-router-dom';

const ConnectionsNavigation = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.pathname === '/connections/explore' ? 0 : 1);

  useEffect(() => {
      setSelectedTab(location.pathname === '/connections/explore' ? 0 : 1);
  }, [location.pathname])

  return (
    <AppBar
      position='fixed'
      color='secondary'
      sx={{ height: CONNECTIONS_NAVBAR_HEIGHT, zIndex: 1299 }}
    >
      <Container
        maxWidth='xl'
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
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

        <Tabs value={selectedTab} sx={{ alignSelf: 'flex-end' }}>
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
      </Container>
    </AppBar>
  );
};

export default ConnectionsNavigation;

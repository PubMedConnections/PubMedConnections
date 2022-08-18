import React, { useState } from 'react';
import { AppBar } from '@mui/material';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useNavigate } from 'react-router-dom';

const ConnectionsNavigation = (props) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <AppBar position='static' color='secondary'>
      <Container
        maxWidth='xl'
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            width: 150,
            paddingY: 1,
          }}
          component='img'
          src='img/logo-with-text.png'
        />
        <Tabs value={selectedTab} sx={{ alignSelf: 'flex-end' }}>
          <Tab
            sx={{ fontSize: '1.5rem' }}
            label='Explore'
            onClick={() => {
              setSelectedTab(0);
              navigate('/connections/explore');
            }}
          />
          <Tab
            sx={{ fontSize: '1.5rem' }}
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

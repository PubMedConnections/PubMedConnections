import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { CONNECTIONS_NAVBAR_HEIGHT } from '../../constants';
import Filters from "./Filters";

const drawerWidth = 450;

// TODO: Update with real data
const snapshots = [
  {
    id: 1,
    title: 'Medical Entries',
  },
  {
    id: 2,
    title: 'Dr Marc Tennant',
  },
  {
    id: 3,
    title: 'Aliston and Co',
  },
  {
    id: 4,
    title: 'Dr Mike Tennant',
  },
];

// TODO: Update with real data
const currentFilter = [
  { field: 'Author Name', value: 'Tennant' },
  { field: 'Date Range', value: '02/04/2022 - 15/04/2022' },
];

function SnapshotSidebar() {
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant='permanent'
      anchor='left'
    >
      <Toolbar sx={{ height: CONNECTIONS_NAVBAR_HEIGHT }} />
      <List>
        {snapshots.map((snapshot, index) => (
          <ListItem key={snapshot.id} disablePadding>
            <ListItemButton
              sx={{
                background: selectedSnapshot === index ? '#c9c5f8' : '#fffff',
              }}
              onClick={() => setSelectedSnapshot(index)}
            >
              <ListItemText
                primaryTypographyProps={{
                  fontSize: 15,

                  color: '#333333',
                  letterSpacing: 0,
                }}
                primary={snapshot.title}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider
        variant='fullWidth'
        sx={{ background: '#c4c4c4', width: '100%', height: '1px' }}
      />
      <Filters />
    </Drawer>
  );
}

export default SnapshotSidebar;

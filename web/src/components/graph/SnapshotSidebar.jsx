import React, {useEffect, useState} from 'react';
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
import {POST} from "../../utils/APIRequests";
import {useDispatch, useSelector} from 'react-redux'
import {clearAuth} from "../../store/slices/userSlice";

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


function SnapshotSidebar() {
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);
  const user = useSelector((state) => state.user.username);
  const dispatch = useDispatch();

  function logout()  {
    POST('auth/logout')
        .then((resp) => {
          if (resp.data.success) {
            dispatch(clearAuth());
          }
    });
  }

  useEffect(() => {
    document.getElementById('sidebar-contents').style.marginBottom =
        document.getElementById('sidebar-user-details').clientHeight;
  }, [])


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
      <div id="sidebar-contents">
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
      </div>

      <div id="sidebar-user-details">
        <Divider
            variant='fullWidth'
            sx={{ background: '#c4c4c4', width: '100%', height: '1px' }}
        />
        <div id="user-details">
          <p>Signed in as</p>
          <h4>{user}</h4>
          <Button variant="contained" onClick={logout} id="logout-button">Log out</Button>
        </div>
      </div>
    </Drawer>
  );
}

export default SnapshotSidebar;

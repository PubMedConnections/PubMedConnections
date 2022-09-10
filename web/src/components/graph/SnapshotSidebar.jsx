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
import {GET, POST, PUT} from "../../utils/APIRequests";
import {useDispatch, useSelector} from 'react-redux'
import {clearAuth} from "../../store/slices/userSlice";
import {setFilters} from '../../store/slices/filterSlice'
import {Save} from "@mui/icons-material";

const drawerWidth = 450;

function SnapshotSidebar() {
  const [selectedSnapshot, setSelectedSnapshot] = useState(-1);
  const user = useSelector((state) => state.user.username);
  const filters = useSelector((state) => state.filters);
  const dispatch = useDispatch();

  const [snapshots, setSnapshots] = useState([]);

  function logout()  {
    POST('auth/logout')
        .then((resp) => {
          if (resp.data.success) {
            dispatch(clearAuth());
          }
    });
  }

  function updateSnapshots() {
    GET('snapshot/list/')
        .then((resp) => {
          let retrievedSnapshots = resp.data;
          retrievedSnapshots.sort((a,b) => (a.id - b.id))
          console.log(retrievedSnapshots.map(s => s.id));
          setSnapshots(retrievedSnapshots)
        })
  }

  useEffect(() => {
    document.getElementById('sidebar-contents').style.marginBottom =
        document.getElementById('sidebar-user-details').clientHeight;

    updateSnapshots();
  }, [])

  function saveSnapshot() {
    PUT('snapshot/create/', filters.filters)
        .then((resp) => {
          if (resp.data.success) {
            updateSnapshots();
            window.alert("Snapshot saved.");
          } else {
            window.alert("Could not save snapshot.");
          }
        })
        .catch((err) => {
          window.alert("Could not save snapshot.", err);
        })
  }

  return (
      <div>
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
                        onClick={() => {
                          setSelectedSnapshot(index);
                          let new_filters = {}
                          Object.keys(snapshot).forEach(f => {
                            if (f in filters.filters) {
                              new_filters[f] = snapshot[f]
                            }
                          });

                          ["published_before", "published_after"].forEach(f => {
                            if (f in new_filters) {
                              new_filters[f] = new_filters[f].substring(0,10);
                            }
                          })

                          dispatch(setFilters(new_filters));
                        }
                        }
                    >
                      <ListItemText
                          primaryTypographyProps={{
                            fontSize: 15,

                            color: '#333333',
                            letterSpacing: 0,
                          }}
                          primary={"Snapshot " + snapshot.id}
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
        <Button variant={"contained"}
                endIcon={<Save />}
                id="save-snapshot-button"
                size="large"
                onClick={saveSnapshot}
        >
          Save as snapshot
        </Button>
      </div>
  );
}

export default SnapshotSidebar;

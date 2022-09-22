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
import {GET, POST, PUT, DELETE} from "../../utils/APIRequests";
import {useDispatch, useSelector} from 'react-redux'
import {clearAuth} from "../../store/slices/userSlice";
import {setFilters, resetAllFilters, setLoadResults} from '../../store/slices/filterSlice'
import {Delete, Save} from "@mui/icons-material";
import {IconButton, Popover, TextField} from "@mui/material";
import {availableFilters} from './filterInfo'

const drawerWidth = 500;

function SnapshotSidebar() {
  const [selectedSnapshot, setSelectedSnapshot] = useState(-1);
  const user = useSelector((state) => state.user.username);
  const filters = useSelector((state) => state.filters);
  const resultsReturned = useSelector((state) => state.filters.resultsReturned);

  const dispatch = useDispatch();

  const [snapshots, setSnapshots] = useState([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [namingAnchor, setNamingAnchor] = useState(null);

  function logout()  {
    POST('auth/logout')
        .then((resp) => {
          if (resp.data.success) {
            dispatch(clearAuth());
          }
    });
  }

  function updateSnapshots(id) {
    GET('snapshot/list/')
        .then((resp) => {
          let retrievedSnapshots = resp.data;
          retrievedSnapshots.sort((a,b) => {
              return Date.parse(a.creation_time) - Date.parse(b.creation_time)
          });
          setSnapshots(retrievedSnapshots);

          if (id) {
              setSelectedSnapshot(id);
          }
        })
  }

  useEffect(() => {
    document.getElementById('sidebar-contents').style.marginBottom =
        document.getElementById('sidebar-user-details').clientHeight + "px";

    updateSnapshots();
  }, [])

  function saveSnapshot() {
    if (snapshotName.length === 0) {
        window.alert("Please enter a snapshot name");
        return;
    }
    const submit_filters = {...filters.filters, "snapshot_name": snapshotName};
    PUT('snapshot/create/', submit_filters)
        .then((resp) => {
          if (resp.data.success) {
            updateSnapshots(resp.data.id);
            setSnapshotName("");
            handleNamingClose();
            window.alert("Snapshot saved.");
          } else {
            window.alert("Could not save snapshot.");
          }
        })
        .catch((err) => {
          window.alert("Could not save snapshot.", err);
        })
  }

  function toggleSnapshotNaming(event) {
      setNamingAnchor(event.target)
  }

  function handleNamingClose() {
      setNamingAnchor(null);
  }

  function deleteSnapshot(id) {
      DELETE('snapshot/delete/' + id)
          .then((resp) => {
              if (resp.data.success) {
                  updateSnapshots();

                  if (id === selectedSnapshot) {
                    dispatch(resetAllFilters());
                  }
                  window.alert("Snapshot deleted.");
              } else {
                  window.alert("Could not delete snapshot.");
              }
          })
          .catch((err) => {
              window.alert("Could not delete snapshot.", err);
          })
  }

  const namingOpen = Boolean(namingAnchor);

  useEffect(() => {
      if (selectedSnapshot > -1) {
          const snapshot = snapshots.find(s => s.id === selectedSnapshot);

          if (!snapshot) {
              return;
          }

          let allSame = true;

          for (let index = 0; index < availableFilters.length; ++index) {
              const filterKey = availableFilters[index].key;
              if (filters.filters[filterKey] !== snapshot[filterKey]) {
                  allSame = false; // Our filters have changed
              }
          }

          if (!allSame) {
            setSelectedSnapshot(-1); // So deselect our selected snapshot
          }
      }
  }, [filters, selectedSnapshot, snapshots])

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
                          background: selectedSnapshot === snapshot.id ? '#c9c5f8' : '#fffff',
                        }}
                        onClick={() => {
                          setSelectedSnapshot(snapshot.id);
                          let new_filters = {}
                          Object.keys(snapshot).forEach(f => {
                            if (f !== "id" && f !== "creation_time") {
                              new_filters[f] = snapshot[f]
                            }
                          });

                          ["published_before", "published_after"].forEach(f => {
                            if (f in new_filters) {
                              new_filters[f] = new_filters[f].substring(0,10);
                            }
                          })

                          dispatch(setFilters(new_filters));
                          dispatch(setLoadResults(true)); // Load our selected snapshot
                        }
                        }
                    >
                      <ListItemText
                          primaryTypographyProps={{
                            fontSize: 15,

                            color: '#333333',
                            letterSpacing: 0,
                          }}
                          className="snapshot-item-container"
                      >
                          <div className="snapshot-description">
                              <p><strong>{snapshot.snapshot_name || "(Unnamed)"}</strong></p>
                              <p className="snapshot-date"><i>{snapshot.creation_time}</i></p>
                          </div>
                          <div className="snapshot-delete">
                              <IconButton
                                  aria-label="delete"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSnapshot(snapshot.id);
                                  }}>
                                  <Delete />
                              </IconButton>
                          </div>
                      </ListItemText>
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
                endIcon={namingOpen ? null : <Save />}
                id="save-snapshot-button"
                size="large"
                onClick={toggleSnapshotNaming}
                disabled={!resultsReturned}>
            {namingOpen ? "Cancel" : "Save as snapshot..."}
        </Button>
          <Popover
              open={namingOpen}
              anchorEl={namingAnchor}
              onClose={handleNamingClose}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
              }}>
              <div id={"snapshot-naming-popover"}>
                  <div id={"snapshot-name-entry"}>
                      <TextField
                          placeholder={"Set snapshot name..."}
                          value={snapshotName}
                          style={{width: "100%"}}
                          label={"Snapshot name"}
                          variant={"outlined"}
                          onChange={(event) => setSnapshotName(event.target.value)}
                          required={true}
                      />
                  </div>
                  <div id={"snapshot-name-save"}>
                      <IconButton aria-label="save" onClick={saveSnapshot} style={{height: "100%"}} color={"primary"}>
                          <Save style={{height: "100%", width: "100%"}}/>
                      </IconButton>
                  </div>
              </div>
          </Popover>
      </div>
  );
}

export default SnapshotSidebar;

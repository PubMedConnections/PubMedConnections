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
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Analytics from '../graph/Analytics'
import JsonData from '../../json/analytics1.json';
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

  const [showModal, setShowModal] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({});

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

  useEffect(() => {
      setAnalyticsData(JsonData);
  }, []);





  const AnalyticsModal = () => (
    <Box style={{position: 'absolute', zIndex: 10000,  width: "100%", height: "100%", opacity: '1', textAlign: 'center'}}>
      <div style={{position: 'absolute', zIndex: 10000, backgroundColor: "black",  width: "100%", height: "100%", opacity: '0.4', textAlign: 'center'}} onClick={() => setShowModal(false)}></div>


      <div style={{position: "absolute", left: "15%", top: "15%", width: '70%', height: "70%", backgroundColor: "white", zIndex: 100000}}>

        <div style={{position: "fixed", left: "17.5%", top: "25%", width: "30%", height:"30%"}}>
          <h1>Graph Analytics</h1>

          <p>Snapshot ID: {snapshots[0].id}</p>
        </div>

        <Analytics data={analyticsData} />
      </div>
    </Box>
  )

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
        {showModal ? <AnalyticsModal /> : null}
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
            <div id="user-details" >
            <Button onClick={() => {setShowModal(true)}} style={{position: 'relative', top: '10px', left: "35%", backgroundColor: "#6372ff", padding: "10px 15px 10px", color: "white"}}>
                Open Analytics
            </Button>
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

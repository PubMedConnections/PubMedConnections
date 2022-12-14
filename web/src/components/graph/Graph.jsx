import React, {Fragment, useEffect, useState} from 'react';
import LinearProgress from '@mui/material/LinearProgress'
import {useSelector, useDispatch} from 'react-redux'
import {GET, POST} from "../../utils/APIRequests";
import { useSnackbar } from 'notistack';
import { DisplayError } from '../common/SnackBar';
import {setLoadResults, setResultsReturned, setResultsLoaded} from '../../store/slices/filterSlice';
import VisJSGraph from "./react-graph-vis";

const graphSettlingPersistentState = {
    "settleStartTimeMS": -1
};

const Graph = () => {
  const snackbar = useSnackbar();

  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters.filters);
  const loadResults = useSelector((state) => state.filters.loadResults);
  const resultsLoaded = useSelector((state) => state.filters.resultsLoaded);

  const [VISJSNetwork, setNetwork] = useState(null);

  const [loadingProgress, setLoadingProgress] = useState(-1)

  const [DBMetaData, setDBMetaData] = useState(null);

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: [],
      edges: [],
    },

    options: {
      autoResize: true,
      nodes: {
          shape: 'dot',
          font: {
              color: "#000000"
          }
      },
      edges: {
          arrows: {to: {enabled: false}},
          scaling: {
              label: true
          },
          color: {
            inherit: false,
            color: '#ccc',
            hover: '#777',
            highlight: '#333'
          }
      },
      interaction: {
        hover: true,
        tooltipDelay: 500,
      },
      physics: {
          minVelocity: 2,
          maxVelocity: 50,
          solver: "forceAtlas2Based",
          forceAtlas2Based: {
              avoidOverlap: 1,
              damping: 0.5,
              theta: 0.4,
              springConstant: 0.06,
              springLength: 100,
          },
          stabilization: {
              enabled: true,
              iterations: 1000,
              updateInterval: 20
          }
      }
    },
  });

  function loadGraphData(override_load) {
      if (!override_load && !loadResults){ // Must be ordered this way
          return;
      }

      if (VISJSNetwork == null) {
          return;
      }

      setGraphInfo({
          options: graphInfo.options,
          data: {
              nodes: [],
              edges: [],
          }
      });

      setLoadingProgress(-1);

      function processResponse(resp, errorMessage) {
          let data = resp.data;
          if (resp.status !== 200) {
              const err = errorMessage || resp.statusText
              data = {"error": err};
          }

          if (data.error) {
              DisplayError(snackbar, data.error);
              if (!data.empty_message) {
                  data.empty_message = data.error + ".";
              }
          }

          let graphData = {
              nodes: data.nodes || [],
              edges: data.edges || [],
              empty_message: data.empty_message
          }
          setGraphInfo({
              options: graphInfo.options,
              data: graphData
          });
          setLoadingProgress(100);
          dispatch(setResultsReturned(graphData.nodes.length > 0));
          dispatch(setResultsLoaded(true));
          dispatch(setLoadResults(false));

          // Fit the network for a few seconds.
          const start = performance.now();
          graphSettlingPersistentState["settleStartTimeMS"] = start;
          if (!graphData || !graphData.nodes || graphData.nodes.length === 0)
              return;

          const settleDurationMS = 10 * 1000;
          const lastFitParameters = {
              "initialised": false,
              "fitting": true,
              "timestep": -1
          };

          function settleGraph() {
              // If the graph has been changed, there will be a new settleGraph loop.
              if (graphSettlingPersistentState["settleStartTimeMS"] !== start)
                  return;

              const timeSinceStartMS = performance.now() - start;

              // If the user changed the viewport, stop trying to fit it.
              if (lastFitParameters["initialised"]) {
                  let position;
                  try {
                      position = VISJSNetwork.getViewPosition();
                  } catch (e) {
                      // The VISJSNetwork may have been destroyed when a new one was loaded
                      return;
                  }

                  if (VISJSNetwork.getScale() !== lastFitParameters["scale"] ||
                      position.x !== lastFitParameters["x"] || position.y !== lastFitParameters["y"]) {

                      // Stop fitting.
                      lastFitParameters["fitting"] = false;
                  }
              }

              let timestep = Math.max(0.1, 1 - 0.9 * timeSinceStartMS / settleDurationMS);
              timestep = Math.round(10 * timestep) / 10.0;

              if (lastFitParameters["timestep"] !== timestep) {
                  let options = graphInfo.options;
                  options = { ...options };
                  options.physics = { ...options.physics };
                  options.physics.timestep = timestep;
                  VISJSNetwork.setOptions(options);
                  lastFitParameters["timestep"] = timestep;
              }
              if (lastFitParameters["fitting"]) {
                  VISJSNetwork.fit();
              }

              const position = VISJSNetwork.getViewPosition();
              lastFitParameters["scale"] = VISJSNetwork.getScale();
              lastFitParameters["x"] = position.x;
              lastFitParameters["y"] = position.y;
              lastFitParameters["initialised"] = true;

              if (timeSinceStartMS < settleDurationMS) {
                   requestAnimationFrame(settleGraph);
              } else {
                  lastFitParameters["fitting"] = false;
              }
          }
          setTimeout(() => requestAnimationFrame(settleGraph));
      }

      POST('snapshot/visualise/', filters)
          .then(processResponse)
          .catch((err) => {
              processResponse(err.response, err.message)
          });
  }

  function loadDBMetaData() {
    GET('snapshot/database_version/')
        .then((resp) => {
            var data = resp.data;
            data['time'] = new Date(resp.data['time']);
            setDBMetaData(data);
        })
  }


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      loadGraphData();
      loadDBMetaData();
  }, [loadResults])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadGraphData(true), [VISJSNetwork]) // The first time

  return <div className="full-size" style={{opacity: resultsLoaded || loadResults ? 1 : 0.6}}>
      <VisJSGraph
          identifier="visualised-pubmed-graph"
          className="full-size"
          graph={graphInfo.data}
          options={graphInfo.options}
          getNetwork={setNetwork} />

      {loadingProgress < 100 &&
          <div id="visjs-loading-cover">
              <div id="visjs-progress-container">
                  <LinearProgress />
              </div>
          </div>
      }

      {loadingProgress >= 100 && graphInfo.data && graphInfo.data.nodes && graphInfo.data.nodes.length === 0 &&
          <div id="visjs-graph-message">
              <p>{graphInfo.data.empty_message || "Unable to build the graph."}</p>
              <p>Try adjusting your filters.</p>
          </div>
      }

      {loadingProgress >= 100 && graphInfo.data && graphInfo.data.nodes && graphInfo.data.edges &&
          <div id="visjs-graph-info">
              <p>
                  {graphInfo.data.nodes.length.toLocaleString()} Nodes,&nbsp;
                  {graphInfo.data.edges.length.toLocaleString()} Edges
                  <span className="not-loaded" >{resultsLoaded ? "" : " (Graph not refreshed)"}</span>

                  {DBMetaData &&
                      <Fragment>
                        <br/>
                        <span>
                          Database updated on:&nbsp;
                            {DBMetaData.time.toLocaleDateString()}
                        </span>
                      </Fragment>
                  }
              </p>
          </div>
      }


    </div>;
};

export default Graph;

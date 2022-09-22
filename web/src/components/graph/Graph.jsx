import React, { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress'
import {useSelector, useDispatch} from 'react-redux'
import {POST, PUT} from "../../utils/APIRequests";
import VisJSGraph from 'react-graph-vis';
import { useSnackbar } from 'notistack';
import { DisplayError } from '../common/SnackBar';
import {setLoadResults, setResultsReturned, setResultsLoaded} from '../../store/slices/filterSlice'

const Graph = () => {
  const snackbar = useSnackbar();

  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters.filters);
  const loadResults = useSelector((state) => state.filters.loadResults);
  const resultsLoaded = useSelector((state) => state.filters.resultsLoaded);

  const [VISJSNetwork, setNetwork] = useState(null);

  const [loadingProgress, setLoadingProgress] = useState(-1)

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: [],
      edges: [],
    },

    options: {
      autoResize: true,
      nodes: {
        shape: 'dot',
      },
      edges: {
          arrows: {to: {enabled: false}},
          scaling: {
              label: true
          }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
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
              iterations: 200,
              updateInterval: 50
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
              DisplayError(snackbar, err);
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
          const lastFitParameters = {
              "initialised": false
          };

          function fit() {
              // If the user changed the viewport, stop trying to fit it.
              if (lastFitParameters["initialised"]) {
                  const position = VISJSNetwork.getViewPosition();
                  if (VISJSNetwork.getScale() !== lastFitParameters["scale"] ||
                      position.x !== lastFitParameters["x"] || position.y !== lastFitParameters["y"]) {

                      // Stop fitting.
                      return;
                  }
              }

              VISJSNetwork.fit();

              const position = VISJSNetwork.getViewPosition();
              lastFitParameters["scale"] = VISJSNetwork.getScale();
              lastFitParameters["x"] = position.x;
              lastFitParameters["y"] = position.y;
              lastFitParameters["initialised"] = true;

              if (performance.now() - start < 10000) {
                   requestAnimationFrame(fit);
              }
          }
          setTimeout(() => requestAnimationFrame(fit));
      }

      POST('snapshot/visualise/', filters)
          .then(processResponse)
          .catch((err) => {
              processResponse(err.response, err.message)
          });
  }

  useEffect(loadGraphData, [loadResults])

  useEffect(() => loadGraphData(true), [VISJSNetwork]) // The first time

  return <div className="full-size">
      <VisJSGraph className="full-size" graph={graphInfo.data} options={graphInfo.options}
          getNetwork={setNetwork}
      />

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
              {graphInfo.data.nodes.length.toLocaleString()} Nodes,&nbsp;
              {graphInfo.data.edges.length.toLocaleString()} Edges
              {resultsLoaded ? "" : " (Graph not refreshed)"}
          </div>
      }
    </div>;
};

export default Graph;

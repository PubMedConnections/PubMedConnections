/**
 * Code Inspired from:
 		* https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js

 * Data from:
 		* https://visjs.github.io/vis-network/examples/
		* https://visjs.github.io/vis-network/examples/static/codepen.03abfb6443c182fdd9fdb252aa1d7baab3900da615e980199e21189c8f7a41e4.html
 */

import React, { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress'
import {useSelector, useDispatch} from 'react-redux'
import {POST, PUT} from "../../utils/APIRequests";
import VisJSGraph from 'react-graph-vis';
import { useSnackbar } from 'notistack';
import { DisplayError } from '../common/SnackBar';

const Graph = () => {
  const snackbar = useSnackbar();
  const filters = useSelector((state) => state.filters.filters);

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
              iterations: 1000,
              updateInterval: 50
          }
      }
    },
  });

  function loadGraphData() {
      const delayDebounceLoad = setTimeout(() => {
          if (VISJSNetwork == null)
              return;

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
              setLoadingProgress(100)

              // Fit the network for a few seconds.
              const start = performance.now();
              function fit() {
                  VISJSNetwork.fit();
                  if (performance.now() - start < 3000) {
                       requestAnimationFrame(fit);
                  }
              }
              setTimeout(fit);
          }

          POST('snapshot/visualise/', filters)
              .then(processResponse)
              .catch((err) => {
                  processResponse(err.response, err.message)
              });
      }, 1500)

      return () => clearTimeout(delayDebounceLoad);
  }

  useEffect(loadGraphData, [VISJSNetwork, filters]);

  return <div className="full-size">
      <VisJSGraph className="full-size" graph={graphInfo.data} options={graphInfo.options}
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
              {graphInfo.data.nodes.length.toLocaleString()} Nodes,&nbsp;
              {graphInfo.data.edges.length.toLocaleString()} Edges
          </div>
      }
    </div>;
};

export default Graph;

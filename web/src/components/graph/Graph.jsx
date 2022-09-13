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
import VisJSGraph from 'react-graph-vis'

const Graph = () => {
  const filters = useSelector((state) => state.filters.filters);

  const [VISJSNetwork, setNetwork] = useState(null);

  const [loadingProgress, setLoadingProgress] = useState(-1)

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: [],
      edges: [],
    },

    options: {
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
          maxVelocity: 20,
          repulsion: {
              nodeDistance: 100,
              centralGravity: 1,
              damping: 0.05,
              springConstant: 0.01,
          },
          stabilization: {
              enabled: true,
              iterations: 10
          }
      }
    },
  });

  function loadGraphData() {
    const delayDebounceLoad = setTimeout(() => {
        if (VISJSNetwork == null) {
            return
        }
        setGraphInfo({
            options: graphInfo.options,
            data: {
              nodes: [],
              edges: [],
            }
        });
        setLoadingProgress(-1);

        POST('snapshot/visualise/', filters)
            .then((resp) => {
                if (resp.status !== 200) {
                    // TODO : Display this to the user.
                    console.error("Something went wrong: " + resp.status)
                    console.error(resp);
                    setLoadingProgress(100)
                    return;
                }

                const data = resp.data;
                if (data.error) {
                    // TODO : Display this to the user.
                    console.error(data.error);
                    setLoadingProgress(100)
                    return;
                }

                let graphData = {
                    nodes: resp.data.nodes,
                    edges: resp.data.edges
                }
                setGraphInfo({
                    options: graphInfo.options,
                    data: graphData
                });
                setLoadingProgress(100)
            })
    }, 1500)

      return () => clearTimeout(delayDebounceLoad);
  }

  useEffect(loadGraphData, [VISJSNetwork, filters])

  return <div className="full-size">
    <VisJSGraph className="full-size" graph={graphInfo.data} options={graphInfo.options}
      getNetwork={(network) => {
          setNetwork(network);
      }}
    />
      {loadingProgress < 100 && <div id="visjs-loading-cover">
      <div id="visjs-progress-container">
        <LinearProgress />
      </div>
    </div>}
  </div>;
};

export default Graph;

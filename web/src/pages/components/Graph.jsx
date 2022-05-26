/**
 * Code Inspired from:
 		* https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js

 * Data from:
 		* https://visjs.github.io/vis-network/examples/
		* https://visjs.github.io/vis-network/examples/static/codepen.03abfb6443c182fdd9fdb252aa1d7baab3900da615e980199e21189c8f7a41e4.html
 */

import React, { useEffect, useRef } from 'react';
import { DataSet, Network} from 'vis-network';

export const Graph = () => {
  // A reference to the div rendered by this component
  const domNode = useRef(null);

  // A reference to the vis network instance
  const network = useRef(null);

  // An array of nodes
	// create people.	
  // value corresponds with the age of the person
  const nodes = [
    { id: 1, value: 2, label: "Algie" },
    { id: 2, value: 31, label: "Alston" },
    { id: 3, value: 12, label: "Barney" },
    { id: 4, value: 16, label: "Coley" },
    { id: 5, value: 17, label: "Grant" },
    { id: 6, value: 15, label: "Langdon" },
    { id: 7, value: 6, label: "Lee" },
    { id: 8, value: 5, label: "Merlin" },
    { id: 9, value: 30, label: "Mick" },
    { id: 10, value: 18, label: "Tod" },
  ];



  // An array of edges
	// create connections between people
  // value corresponds with the amount of contact between two people
  const edges = [
    { from: 2, to: 8, value: 3 },
    { from: 2, to: 9, value: 5 },
    { from: 2, to: 10, value: 1 },
    { from: 4, to: 6, value: 8 },
    { from: 5, to: 7, value: 2 },
    { from: 4, to: 5, value: 1 },
    { from: 9, to: 10, value: 2 },
    { from: 2, to: 3, value: 6 },
    { from: 3, to: 9, value: 4 },
    { from: 5, to: 3, value: 1 },
    { from: 2, to: 7, value: 4 },
  ];


  const data = {
    nodes,
    edges
  };

  var options = {
    nodes: {
      shape: "dot",
      scaling: {
        customScalingFunction: function (min, max, total, value) {
          return value / total;
        },
        min: 5,
        max: 150,
      },
    },
  };

  useEffect(
    () => {
      network.current = new Network(domNode.current, data, options);
    },
    [domNode, network, data, options]
  );

  return (
    <div ref = { domNode } />
  );
};
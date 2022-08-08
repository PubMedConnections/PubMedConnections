/**
 * Code Inspired from:
 		* https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js

 * Data from:
 		* https://visjs.github.io/vis-network/examples/
		* https://visjs.github.io/vis-network/examples/static/codepen.03abfb6443c182fdd9fdb252aa1d7baab3900da615e980199e21189c8f7a41e4.html
 */

import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';

const Graph = () => {

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: [
        {id: 1, value: 13, label: 'Edwidge Danticat'},
        {id: 2, value: 12, label: 'Ernest Hemingway'},
        {id: 3, value: 10, label: 'J.R.R. Tolkien'},
        {id: 4, value: 11, label: 'Sidney Sheldon'},
        {id: 5, value: 1, label: 'Barbara Kingsolver'},
        {id: 6, value: 3, label: 'Djuna Barnes'},
        {id: 7, value: 3, label: 'Francine Prose'},
        {id: 8, value: 1, label: 'Milan Kundera'},
        {id: 9, value: 1, label: 'Ursula K. LeGuin'},
        {id: 10, value: 1, label: 'Edgar Allan Poe'},
        {id: 11, value: 2, label: 'Miranda July'},
        {id: 12, value: 2, label: 'Ayn Rand'},
        {id: 13, value: 2, label: 'Dashiell Hammett'},
        {id: 14, value: 1, label: 'Anais Nin'},
        {id: 15, value: 2, label: 'Ambrose Bierce'},
        {id: 16, value: 2, label: 'Oscar Wilde'},
        {id: 17, value: 3, label: 'Sylvia Plath'},
        {id: 18, value: 3, label: 'Harriet Beecher'},
        {id: 19, value: 1, label: 'Pablo Neruda'},
        {id: 20, value: 3, label: 'Camille Paglia'},
        {id: 21, value: 2, label: 'Tim Adams'},
        {id: 22, value: 1, label: 'Dianne Ross'},
        {id: 23, value: 3, label: 'Padddy Lamont'},
        {id: 24, value: 2, label: 'Patrick Roe'},
        {id: 25, value: 3, label: 'Jai Castle'},
        {id: 26, value: 1, label: 'Hadi Navabi'},
        {id: 27, value: 1, label: 'Wenxiao Zhang'},
        {id: 28, value: 3, label: 'Aaron Norrish'},
      ],
      edges: [
        {from: 1, to: 6, value:2 , label: ''},
        {from: 1, to: 7, value:1 , label: ''},
        {from: 1, to: 8, value:3 , label: ''},
        {from: 1, to: 9, value:3 , label: ''},
        {from: 1, to: 10, value:2 , label: ''},
        {from: 1, to: 11, value:1 , label: ''},
        {from: 1, to: 12, value:2 , label: ''},
        {from: 1, to: 3, value:4 , label: ''},
        {from: 1, to: 13, value:4 , label: ''},
        {from: 1, to: 14, value: 2, label: ''},
        {from: 2, to: 5, value:2 , label: ''},
        {from: 2, to: 15, value:5 , label: ''},
        {from: 2, to: 16, value:2 , label: ''},
        {from: 2, to: 17, value:5 , label: ''},
        {from: 2, to: 18, value:5 , label: ''},
        {from: 2, to: 3, value:4 , label: ''},
        {from: 2, to: 12, value: 2, label: ''},
        {from: 2, to: 11, value:3 , label: ''},
        {from: 2, to: 19, value:1 , label: ''},
        {from: 3, to: 20, value:2 , label: ''},
        {from: 3, to: 16, value:3 , label: ''},
        {from: 3, to: 5, value:3 , label: ''},
        {from: 3, to: 21, value:3 , label: ''},
        {from: 3, to: 22, value:3 , label: ''},
        {from: 3, to: 23, value:4 , label: ''},
        {from: 3, to: 24, value:2 , label: ''},
        {from: 3, to: 25, value:1 , label: ''},
        {from: 4, to: 26, value:3 , label: ''},
        {from: 4, to: 27, value: 2, label: ''},
        {from: 4, to: 17, value:4 , label: ''},
        {from: 4, to: 28, value: 2, label: ''},
        {from: 4, to: 20, value:1 , label: ''},
        {from: 2, to: 27, value: 2, label: ''},
        {from: 3, to: 17, value:4 , label: ''},
        {from: 1, to: 28, value: 2, label: ''},
        {from: 3, to: 20, value:1 , label: ''},
      ],
    },
    options: {
      nodes: {
      shape: "dot",
    },}
  })

  // A reference to the div rendered by this component
  const domNode = useRef(null);

  useEffect(
    () => {
      domNode.current = new Network(domNode.current, graphInfo.data, graphInfo.options);
    },
    [domNode, graphInfo]
  );

  return (
    <div ref = {domNode} />
  );
};

export default Graph;
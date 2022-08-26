import React, { useEffect } from 'react';
import { Graph } from '../../components/graph';

function Explore() {
  useEffect(() => {
    document.title = 'PubMed Connections | Explore';
  }, []);
  return <Graph />;
}

export default Explore;

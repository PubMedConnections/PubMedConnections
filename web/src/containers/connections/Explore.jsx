import React, { useEffect } from 'react';
import { Graph } from '../../components/graph';
import FiltersDropdown from "../../components/graph/FiltersDropdown";

function Explore() {
  useEffect(() => {
    document.title = 'PubMed Connections | Explore';
  }, []);
  return <div>
    <FiltersDropdown />
    <Graph />;
  </div>
}

export default Explore;
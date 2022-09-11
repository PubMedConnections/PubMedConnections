import React, { Fragment, useEffect } from 'react';
import { Graph } from '../../components/graph';
import SnapshotSidebar from '../../components/graph/SnapshotSidebar';

function Snapshots() {
  useEffect(() => {
    document.title = 'PubMed Connections | Snapshots';
  }, []);

  return (
    <Fragment className="full-size">
      <SnapshotSidebar />
      <Graph />
    </Fragment>
  );
}

export default Snapshots;

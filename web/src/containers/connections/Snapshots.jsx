import React, { Fragment } from 'react';
import { Graph } from '../../components/graph';
import SnapshotSidebar from '../../components/graph/SnapshotSidebar';

function Snapshots() {
  return (
    <Fragment>
      <SnapshotSidebar />
      <Graph />
    </Fragment>
  );
}

export default Snapshots;

import React, { useEffect } from 'react';
import { Graph } from '../../components/graph';
import SnapshotSidebar from '../../components/graph/SnapshotSidebar';

function Snapshots() {
  useEffect(() => {
    document.title = 'PubMed Connections | Snapshots';
  }, []);

  return (
    <div className="full-size">
      <SnapshotSidebar />
      <Graph />
    </div>
  );
}

export default Snapshots;

import React, {useEffect, useState} from 'react';
import JsonData from '../../json/analytics1.json';



function SnapshotSidebar() {

    const [analyticsData, setAnalyticsData] = useState({});
    
    useEffect(() => {
      setAnalyticsData(JsonData);
    }, []);
  
  
    return (
        <div>
            <p> Analytics Data </p>
          
        </div>
    );
  }
  
  export default SnapshotSidebar;
  
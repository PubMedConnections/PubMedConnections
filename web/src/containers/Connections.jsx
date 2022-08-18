import { ConnectionsNavigation } from '../components/navigation';
import { Outlet } from 'react-router-dom';

function Connections() {
  return (
    <div>
      <ConnectionsNavigation />
      <Outlet />
    </div>
  );
}

export default Connections;

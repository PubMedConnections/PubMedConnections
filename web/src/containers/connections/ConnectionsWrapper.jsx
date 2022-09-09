import { ConnectionsNavigation } from '../../components/navigation';
import { Outlet } from 'react-router-dom';

function ConnectionsWrapper() {
  return (
    <div className="full-size">
      <ConnectionsNavigation />
      <Outlet />
    </div>
  );
}

export default ConnectionsWrapper;

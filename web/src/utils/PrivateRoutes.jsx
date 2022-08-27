import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  //TODO: Integrate with login page to check credentials
  const userLoggedIn = useSelector((store) => store.user.success);

  return userLoggedIn ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes;

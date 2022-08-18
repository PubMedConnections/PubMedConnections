import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  //TODO: Integrate with login page to check credentials
  let auth = { token: true };
  return auth.token ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes;

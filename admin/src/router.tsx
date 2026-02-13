/**
 * admin/src/router.tsx
 * 路由配置
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import HotelEdit from './pages/HotelEdit';
import AuditList from './pages/AuditList';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/hotels/edit" replace />,
      },
      {
        path: 'hotels/edit',
        element: <HotelEdit />,
      },
      {
        path: 'hotels/audit',
        element: <AuditList />,
      },
    ],
  },
]);

export default router;

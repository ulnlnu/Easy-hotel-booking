/**
 * admin/src/router.tsx
 * 路由配置
 */

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import HotelEdit from './pages/HotelEdit';
import AuditList from './pages/AuditList';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
        element: (
          <ProtectedRoute requireAdmin>
            <AuditList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'change-password',
        element: <ChangePassword />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;

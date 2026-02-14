/**
 * admin/src/router.tsx
 * 路由配置
 */

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import HotelEdit from './pages/HotelEdit';
import AuditList from './pages/AuditList';
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
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;

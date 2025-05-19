import {Navigate, Route, Routes} from 'react-router';
import UserDashboard from '@/pages/UserDashboard.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminPanel from '@/pages/AdminPanel.jsx';
import LoginForm from '@/pages/LoginForm.jsx';
import RegisterForm from '@/pages/RegisterForm.jsx';
import RoomManagement from '@/pages/RoomManagement.jsx';
import RoomAllocation from '@/pages/RoomAllocation.jsx';
import {useSelector} from 'react-redux';
import {
  selectIsAdmin,
  selectIsAuthenticated,
} from '@/store/slices/authSlice.js';

export const MyRoutes = () => {

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  return (
      <Routes>
        <Route
            path="/"
            element={
              isAuthenticated && isAdmin
                  ? <AdminPanel/>
                  : <RegisterForm/>
            }
        />
        <Route
            path="/dashboard"
            element={
              isAuthenticated ? <UserDashboard/> : <LoginForm/>
            }
        />
        <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel/>
              </ProtectedRoute>
            }
        />
        <Route
            path="/rooms"
            element={
              <ProtectedRoute requireAdmin={true}>
                <RoomManagement/>
              </ProtectedRoute>
            }
        />
        <Route
            path="/room-allocation"
            element={
              <ProtectedRoute requireAdmin={true}>
                <RoomAllocation/>
              </ProtectedRoute>
            }
        />
        <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace/> : <LoginForm/>
            }
        />
        <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace/> : <RegisterForm/>
            }
        />
      </Routes>
  );
};

import {Navigate, Route, Routes} from 'react-router';
import UserDashboard from '@/pages/UserDashboard.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminPanel from '@/pages/AdminPanel.jsx';
import LoginForm from '@/pages/LoginForm.jsx';
import RegisterForm from '@/pages/RegisterForm.jsx';
import {useSelector} from 'react-redux';
import {selectIsAuthenticated} from '@/store/slices/authSlice.js';

export const MyRoutes = () => {

  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
      <Routes>
        <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace/> : <RegisterForm/>
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

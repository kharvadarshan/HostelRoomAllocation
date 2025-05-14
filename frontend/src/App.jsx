import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { selectIsAuthenticated, selectUser, getUserProfile, setAuthToken } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Set auth token on app load
  useEffect(() => {
    // Check if we have a token in local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in axios headers
      setAuthToken(token);
      // Try to fetch user profile if we have a token
      dispatch(getUserProfile());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />
        
        <div className="container mx-auto py-8 px-4">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? <UserDashboard /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterForm />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

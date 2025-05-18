import {useEffect, useState} from 'react';
import {BrowserRouter as Router} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {Toaster} from 'react-hot-toast';
import {
  getUserProfile,
  selectUser,
  setAuthToken,
} from './store/slices/authSlice';
import Navbar from './components/Navbar';
import {MyRoutes} from '@/routes.jsx';
import { SplashScreen } from '@/pages/SplashScreen.jsx';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showSplash, setShowSplash] = useState(true);

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

  // Control splash screen display
  useEffect(() => {
    if (showSplash) {
      // Show splash screen for 5 seconds only on initial app load
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Store in session that splash has been shown
        sessionStorage.setItem('splashShown', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Check if splash has already been shown in this session
  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setShowSplash(false);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right"/>
          <Navbar/>
          <MyRoutes/> 
        </div>
      </Router>
  );
}

export default App;

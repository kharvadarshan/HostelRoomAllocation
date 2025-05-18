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
import ThemeProvider from './theme/ThemeProvider';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

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
    <ThemeProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              borderRadius: '10px',
              background: '#fff',
              color: '#333',
            },
          }}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-150">
          <Navbar/>
          <main className="pt-2">
            <MyRoutes/> 
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

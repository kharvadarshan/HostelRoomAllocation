import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { login, getUserProfile, selectAuthError, selectAuthLoading, clearError } from '../store/slices/authSlice.js';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FiPhone, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    // Display error message if there is one
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mobile || !formData.password) {
      toast.error('Please enter mobile and password');
      return;
    }
    
    try {
      const resultAction = await dispatch(login({
        mobile: formData.mobile,
        password: formData.password
      }));
      
      if (login.fulfilled.match(resultAction)) {
        // Save the token to localStorage
        localStorage.setItem('token', resultAction.payload.token);
        // Fetch the complete user profile
        await dispatch(getUserProfile());
        toast.success('Logged in successfully!');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-earth-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-earth-200 dark:border-gray-700">
          <CardHeader className="text-center p-6 border-b border-earth-100 dark:border-gray-700">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <FiLogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <CardTitle className="text-2xl text-earth-800 dark:text-earth-100">Welcome Back</CardTitle>
            <p className="mt-2 text-earth-600 dark:text-earth-300">Sign in to your account</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  required
                  autoFocus
                  className="border-earth-300 dark:border-gray-600"
                  icon={<FiPhone className="w-5 h-5 text-earth-500" />}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="border-earth-300 dark:border-gray-600"
                  icon={<FiLock className="w-5 h-5 text-earth-500" />}
                  endIcon={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-earth-500 hover:text-earth-700 dark:hover:text-earth-300"
                    >
                      {showPassword ? 
                        <FiEyeOff className="w-5 h-5" /> : 
                        <FiEye className="w-5 h-5" />
                      }
                    </button>
                  }
                />
              </div>
              
              <Button
                type="submit"
                className="w-full mt-8"
                isLoading={loading}
                size="lg"
                icon={<FiLogIn />}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="px-8 py-6 bg-earth-50 dark:bg-gray-800/50 flex justify-center border-t border-earth-100 dark:border-gray-700">
            <p className="text-earth-600 dark:text-earth-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm; 
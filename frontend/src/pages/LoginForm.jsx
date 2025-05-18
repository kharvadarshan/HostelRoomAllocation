import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { login, getUserProfile, selectAuthError, selectAuthLoading, clearError } from '../store/slices/authSlice.js';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
  
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card max-w-md mx-auto mt-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="mobile" className="form-label">mobile</label>
          <input
            id="mobile"
            name="mobile"
            type="text"
            className="input-field"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter your mobile"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </motion.div>
  );
};

export default LoginForm; 
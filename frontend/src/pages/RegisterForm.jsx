import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { register, getUserProfile, selectAuthError, selectAuthLoading, clearError } from '../store/slices/authSlice.js';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FiUser, FiBook, FiPhone, FiLock, FiEye, FiEyeOff, FiUpload, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    mobile: '',
    password: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.field || !formData.mobile || !formData.password || !photo) {
      toast.error('Please fill in all fields and upload a photo');
      return;
    }
    
    try {
      const resultAction = await dispatch(register({
        ...formData,
        photo,
      }));
      
      if (register.fulfilled.match(resultAction)) {
        // Save the token to localStorage
        localStorage.setItem('token', resultAction.payload.token);
        // Fetch the complete user profile after registration
        await dispatch(getUserProfile());
        toast.success('Registered successfully!');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-earth-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <Card className="border border-earth-200 dark:border-gray-700">
          <CardHeader className="text-center p-6 border-b border-earth-100 dark:border-gray-700">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <FiUser className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <CardTitle className="text-2xl text-earth-800 dark:text-earth-100">Create Your Account</CardTitle>
            <p className="mt-2 text-earth-600 dark:text-earth-300">Join our eco-friendly hostel community</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="border-earth-300 dark:border-gray-600"
                  icon={<FiUser className="w-5 h-5 text-earth-500" />}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="field" className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Field of Study
                </label>
                <Input
                  id="field"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="Eg. Computer Engineering 3rd Year BVM"
                  required
                  className="border-earth-300 dark:border-gray-600"
                  icon={<FiBook className="w-5 h-5 text-earth-500" />}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Eg. 9638631366"
                  required
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
                  placeholder="Choose a strong password"
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
              
              <div className="space-y-4 pt-2">
                <label className="block text-sm font-medium mb-2 text-earth-700 dark:text-earth-200">
                  Profile Photo <span className="text-earth-500">(Will be displayed on projector)</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-full sm:w-7/12">
                    <div className="border-2 border-dashed border-earth-300 dark:border-primary-800/40 rounded-lg p-8 text-center bg-earth-50 dark:bg-gray-800/20">
                      <input
                        id="photo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        required
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center gap-3 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <FiUpload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-earth-700 dark:text-earth-300">
                          {photo ? 'Change photo' : 'Select a photo'}
                        </span>
                        <span className="text-xs text-earth-500 dark:text-earth-400">
                          JPG, PNG or GIF (Max. 5MB)
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-earth-200 dark:border-earth-800 bg-earth-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-12 h-12 text-earth-400 dark:text-earth-600" />
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full mt-8"
                isLoading={loading}
                size="lg"
                icon={<FiArrowRight />}
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="px-8 py-6 bg-earth-50 dark:bg-gray-800/50 flex justify-center border-t border-earth-100 dark:border-gray-700">
            <p className="text-earth-600 dark:text-earth-300">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterForm; 
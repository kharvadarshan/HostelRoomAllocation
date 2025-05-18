import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading, 
  updateProfile, 
  updatePhoto, 
  deletePhoto,
  getUserProfile
} from '../store/slices/authSlice.js';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  FiUser, 
  FiBookOpen, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCamera, 
  FiSave, 
  FiUpload, 
  FiTrash2, 
  FiX
} from 'react-icons/fi';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    password: '',
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user profile if authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        field: user.field || '',
      }));
      setPhotoPreview(user.photo || null);
    }
  }, [user]);

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
    
    // Only include password if it has been changed
    const userData = {
      name: formData.name,
      field: formData.field,
    };
    
    if (formData.password) {
      userData.password = formData.password;
    }
    
    try {
      const resultAction = await dispatch(updateProfile(userData));
      
      if (updateProfile.fulfilled.match(resultAction)) {
        toast.success('Profile updated successfully');
        setFormData({
          ...formData,
          password: '',
        });
        setShowPasswordField(false);
        setShowPassword(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      toast.error('Please select a photo');
      return;
    }
    
    try {
      const resultAction = await dispatch(updatePhoto(photo));
      
      if (updatePhoto.fulfilled.match(resultAction)) {
        toast.success('Photo updated successfully');
        setPhoto(null);
      }
    } catch (error) {
      console.error('Photo update error:', error);
    }
  };

  const handlePhotoDelete = async () => {
    if (window.confirm('Are you sure you want to remove your photo?')) {
      try {
        const resultAction = await dispatch(deletePhoto());
        
        if (deletePhoto.fulfilled.match(resultAction)) {
          toast.success('Photo removed successfully');
          setShowFullPhoto(false);
        }
      } catch (error) {
        console.error('Photo delete error:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AnimatePresence>
        {showFullPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFullPhoto(false)}
          >
            <motion.div 
              className="relative max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFullPhoto(false)}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              >
                <FiX className="h-6 w-6" />
              </button>
              <img 
                src={user.photo} 
                alt={user.name} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
              />
              
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handlePhotoDelete}
                  disabled={loading}
                  variant="danger"
                  icon={<FiTrash2 />}
                >
                  {loading ? 'Processing...' : 'Remove Photo'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <CardTitle>Your Profile</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'profile' ? 'primary' : 'ghost'}
                size="sm"
                icon={<FiUser />}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </Button>
              <Button
                variant={activeTab === 'photo' ? 'primary' : 'ghost'}
                size="sm"
                icon={<FiCamera />}
                onClick={() => setActiveTab('photo')}
              >
                Photo
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div 
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
                  onClick={() => setShowFullPhoto(true)}
                >
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiUser className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.field}</p>
              </div>
              
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      icon={<FiUser className="w-5 h-5 text-gray-400" />}
                    />
                  </div>

                  <div>
                    <label htmlFor="field" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Field
                    </label>
                    <Input
                      id="field"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      placeholder="Enter your field (e.g. Engineering, Art)"
                      icon={<FiBookOpen className="w-5 h-5 text-gray-400" />}
                    />
                  </div>

                  <div className="flex items-center">
                    <div className="flex-grow">
                      <label htmlFor="change-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Change Password
                      </label>
                    </div>
                    <div className="h-6 w-10 flex items-center">
                      <input
                        type="checkbox"
                        id="change-password"
                        checked={showPasswordField}
                        onChange={() => setShowPasswordField(!showPasswordField)}
                        className="relative h-4 w-7 cursor-pointer appearance-none rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200 ease-in-out before:absolute before:top-[-2px] before:left-[-1px] before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-all before:duration-200 before:ease-in-out checked:bg-primary-500 checked:before:left-3"
                      />
                    </div>
                  </div>

                  {showPasswordField && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        icon={<FiLock className="w-5 h-5 text-gray-400" />}
                        endIcon={
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? 
                              <FiEyeOff className="w-5 h-5" /> : 
                              <FiEye className="w-5 h-5" />
                            }
                          </button>
                        }
                      />
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={loading}
                      icon={<FiSave />}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'photo' && (
            <form onSubmit={handlePhotoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Update Your Profile Photo
                  </h3>
                  
                  <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-8 text-center">
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex flex-col items-center gap-3 cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiUpload className="h-12 w-12 text-primary-500" />
                      </motion.div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {photo ? 'Change selected photo' : 'Click to select a photo'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Your photo will be displayed on the projector
                      </p>
                    </label>
                  </div>
                  
                  {photo && (
                    <div className="mt-6">
                      <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                        icon={<FiSave />}
                      >
                        {loading ? 'Uploading...' : 'Upload New Photo'}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Preview
                  </h3>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 mx-auto">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FiUser className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {user.photo && (
                    <Button
                      variant="outline"
                      onClick={handlePhotoDelete}
                      className="mt-6"
                      icon={<FiTrash2 />}
                    >
                      Remove Current Photo
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard; 
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
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
  FiX,
  FiUsers,
  FiLayers,
  FiEdit
} from 'react-icons/fi';
import { names, levels } from '../utils/names';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const loading = useSelector(selectAuthLoading);
  
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    password: '',
    group: '',
    level: '',
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

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
        group: user.group || names[0],
        level: user.level || levels[2], // Default to 'C'
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
      group: formData.group,
      level: formData.level,
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
        setIsEditing(false);
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
        setShowPhoto(false);
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

  const toggleEditing = () => {
    setIsEditing(!isEditing);
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
    <div className="container-fluid px-4 py-8 max-w-full">
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
              
              <div className="mt-6 flex justify-center space-x-4">
                <Button
                  onClick={handlePhotoDelete}
                  disabled={loading}
                  variant="danger"
                  icon={<FiTrash2 />}
                >
                  {loading ? 'Processing...' : 'Remove Photo'}
                </Button>
                
                <Button
                  onClick={() => {
                    setShowFullPhoto(false);
                    setShowPhoto(true);
                  }}
                  disabled={loading}
                  variant="primary"
                  icon={<FiCamera />}
                >
                  Change Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPhoto(false)}
          >
            <motion.div 
              className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Photo</h2>
                <button
                  onClick={() => setShowPhoto(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handlePhotoSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-6 text-center">
                      <input
                        id="photo-upload-modal"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="photo-upload-modal"
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
                      </label>
                    </div>
                    
                    {photoPreview && (
                      <div className="mt-4 flex justify-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowPhoto(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={!photo || loading}
                      icon={<FiSave />}
                    >
                      {loading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <CardTitle>Your Profile</CardTitle>
            <div className="flex space-x-2">
              {isAdmin && (
                <Button
                  variant={isEditing ? "danger" : "primary"}
                  size="sm"
                  icon={isEditing ? <FiX /> : <FiEdit />}
                  onClick={toggleEditing}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div 
                className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 relative"
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
                
                <button 
                  className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPhoto(true);
                  }}
                >
                  <FiCamera className="w-5 h-5" />
                </button>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{user.field}</p>
              
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {user.group && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    <FiUsers className="mr-1" />
                    {user.group}
                  </span>
                )}
                
                {user.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                    <FiLayers className="mr-1" />
                    Level {user.level}
                  </span>
                )}
              </div>
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="group" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Group
                    </label>
                    <select
                      id="group"
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
                      disabled={!isEditing}
                    >
                      {names.map(group => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
                      disabled={!isEditing}
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>
                          Level {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
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
                )}

                {isEditing && showPasswordField && (
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

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={loading}
                      icon={<FiSave />}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard; 
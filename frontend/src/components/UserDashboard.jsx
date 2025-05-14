import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading, 
  updateProfile, 
  updatePhoto, 
  deletePhoto,
  getUserProfile
} from '../store/slices/authSlice';

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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {showFullPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-screen p-4">
            <button
              onClick={() => setShowFullPhoto(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={user.photo} 
              alt={user.name} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <button
                onClick={handlePhotoDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                {loading ? 'Processing...' : 'Remove Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="md:flex">
          <div className="md:w-1/3 bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white">
            <div className="text-center mb-6">
              <div 
                className="h-40 w-40 mx-auto mb-4 rounded-full overflow-hidden cursor-pointer border-4 border-white shadow-lg hover:opacity-90 transition-opacity"
                onClick={() => setShowFullPhoto(true)}
              >
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="opacity-90">{user.field}</p>
            </div>
            
            <div className="mt-8">
              <form onSubmit={handlePhotoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Update Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white file:text-primary-700 cursor-pointer"
                  />
                </div>
                
                {photo && (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-primary-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {loading ? 'Uploading...' : 'Upload New Photo'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          <div className="md:w-2/3 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Update Your Profile</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="field" className="form-label">Field</label>
                <input
                  id="field"
                  name="field"
                  type="text"
                  className="input-field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="Enter your field (e.g. Engineering, Art)"
                />
              </div>

              {!showPasswordField ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(true)}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="password" className="form-label">New Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard; 
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { register, getUserProfile, selectAuthError, selectAuthLoading, clearError } from '../store/slices/authSlice.js';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    mobile: '',
    password: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card max-w-md mx-auto mt-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Details</h2>
      
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
            placeholder="Eg. Maharshi Bhagat pappa_nu_name"
            required
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
            placeholder="Eg. Computer 3rd Year BVM"
            required
          />
        </div>

        <div>
          <label htmlFor="mobile" className="form-label">Mobile No</label>
          <input
            id="mobile"
            name="mobile"
            type="text"
            className="input-field"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Eg. 9638631366"
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
            placeholder="No one cares"
            required
          />
        </div>

        <div>
          <label className="form-label">Photo (Will be display of Projector)</label>
          <div className="flex items-center space-x-4">
            <label className="block">
              <span className="sr-only">Choose photo</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                required
              />
            </label>
            {photoPreview && (
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting...' : 'SUBMIT'}
        </button>
      </form>
    </motion.div>
  );
};

export default RegisterForm; 
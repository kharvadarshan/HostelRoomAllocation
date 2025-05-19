"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FiUser, FiBook, FiPhone, FiUpload, FiArrowRight } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SuccessAnimation from '@/components/SuccessAnimation';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    mobile: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.field || !formData.mobile || !photo) {
      toast.error('Please fill in all fields and upload a photo');
      return;
    }
    
    try {
      setLoading(true);
      
      const formSubmitData = new FormData();
      formSubmitData.append('name', formData.name);
      formSubmitData.append('field', formData.field);
      formSubmitData.append('mobile', formData.mobile);
      formSubmitData.append('photo', photo);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formSubmitData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Show success animation
      setSuccess(true);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Use a simple div instead of the complete UI before client-side hydration
  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
      
      {success ? (
        <SuccessAnimation />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="border border-green-200 dark:border-green-900">
            <CardHeader className="text-center p-6 border-b border-green-100 dark:border-green-900">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <FiUser className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">User Registration</CardTitle>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Register for Shreekar Hostel</p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    icon={<FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="field" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Field of Study
                  </label>
                  <Input
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    placeholder="Eg. Computer Engineering 3rd Year BVM"
                    required
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    icon={<FiBook className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Mobile Number
                  </label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Eg. 9638631366"
                    required
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    icon={<FiPhone className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                  />
                </div>
                
                <div className="space-y-4 pt-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Profile Photo <span className="text-gray-500 dark:text-gray-400">(Will be displayed on projector)</span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-full sm:w-7/12">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700/30">
                        <input
                          id="photo-upload"
                          type="file"
                          ref={fileInputRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          required
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex flex-col items-center gap-3 cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <FiUpload className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {photo ? 'Change photo' : 'Select a photo'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG or GIF (Max. 5MB)
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-12 h-12 text-gray-400 dark:text-gray-600" />
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
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

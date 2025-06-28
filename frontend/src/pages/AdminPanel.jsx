import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  selectUsers, 
  selectUsersLoading, 
  selectPagination,
  fetchUsers, 
  deleteUser,
  updateUser,
  setSelectedUser,
  selectSelectedUser,
  clearSelectedUser
} from '../store/slices/userSlice.js';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FiRefreshCw, 
  FiTrash2, 
  FiX, 
  FiSearch,
  FiFilter,
  FiUser,
  FiHome,
  FiUsers,
  FiEdit2
} from 'react-icons/fi';
import { names, levels } from '../utils/names.js';
import api from '../api';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const pagination = useSelector(selectPagination);
  const selectedUser = useSelector(selectSelectedUser);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editUserData, setEditUserData] = useState({
    name: '',
    field: '',
    mobile: '',
    group: 'New A-B',
    level: 'C',
    room: '',
    role: 'user'
  });
  const [rooms, setRooms] = useState([]);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
    fetchRooms();
  }, [dispatch, currentPage, filterGroup]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = () => {
    dispatch(fetchUsers({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      group: filterGroup
    }));
  };

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      if (data.ok) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const resultAction = await dispatch(deleteUser(id));
        
        if (deleteUser.fulfilled.match(resultAction)) {
          toast.success('User deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const openPhotoModal = (user) => {
    dispatch(setSelectedUser(user));
    setShowFullPhoto(true);
  };

  const closePhotoModal = () => {
    setShowFullPhoto(false);
    setTimeout(() => {
      dispatch(clearSelectedUser());
    }, 300);
  };

  const openEditModal = (user) => {
    setEditUserData({
      name: user.name,
      field: user.field,
      mobile: user.mobile,
      group: user.group || 'None',
      level: user.level || 'C',
      room: user.room || '',
      role: user.role || 'user'
    });
    dispatch(setSelectedUser(user));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTimeout(() => {
      dispatch(clearSelectedUser());
    }, 300);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const formData = new FormData();
      formData.append('name', editUserData.name);
      formData.append('field', editUserData.field);
      formData.append('mobile', editUserData.mobile);
      formData.append('group', editUserData.group);
      formData.append('level', editUserData.level);
      formData.append('room', editUserData.room);
      formData.append('role', editUserData.role);
      
      // Append photo if one is selected
      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }
      
      const resultAction = await dispatch(updateUser({ 
        id: selectedUser._id, 
        userData: formData 
      }));
      
      if (updateUser.fulfilled.match(resultAction)) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handlePhotoClick = (photo) => {
    setShowEditPhotoModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setShowEditPhotoModal(false);
    }
  };

  const triggerPhotoUpload = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Add this new component for pagination
  const Pagination = () => {
    const { page, pages, total } = pagination;
    
    if (total === 0) return null;

    return (
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * 10, total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              {[...Array(pages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === index + 1
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  page === pages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Add Photo Edit Modal Component
  const PhotoEditModal = () => {
    if (!showEditPhotoModal || !selectedUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={() => setShowEditPhotoModal(false)}
      >
        <motion.div 
          className="relative bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowEditPhotoModal(false)}
            className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <img 
              src={selectedUser.photo} 
              alt={selectedUser.name} 
              className="max-w-full max-h-[60vh] object-contain rounded-lg mb-4"
            />
            
            <div className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <Button
                onClick={triggerPhotoUpload}
                variant="outline"
                className="mt-4"
              >
                Change Photo
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/rooms">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary-200 hover:border-primary-400">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <FiHome className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <CardTitle className="mb-2">Room Management</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Manage hostel rooms, add, edit, and view room allocations</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/room-allocation">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-secondary-200 hover:border-secondary-400">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <CardTitle className="mb-2">Room Allocation</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Randomly allocate users to rooms with an engaging selection process</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-200 hover:border-gray-400">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <FiUser className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle className="mb-2">User Management</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Manage users, view details, promote to admin, or remove users</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Photo Modal */}
      <AnimatePresence>
        {showFullPhoto && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closePhotoModal}
          >
            <motion.div 
              className="relative bg-white dark:bg-gray-800 p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePhotoModal}
                className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <img 
                src={selectedUser.photo} 
                alt={selectedUser.name} 
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
              
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.field}</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.mobile}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeEditModal}
          >
            <motion.div 
              className="relative bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex justify-center">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500 cursor-pointer hover:border-primary-600 transition-all"
                  onClick={() => handlePhotoClick(selectedUser.photo)}
                >
                  <img 
                    src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : selectedUser.photo} 
                    alt={selectedUser.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editUserData.name}
                      onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Field
                    </label>
                    <input
                      type="text"
                      value={editUserData.field}
                      onChange={(e) => setEditUserData({ ...editUserData, field: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                      value={editUserData.mobile}
                      onChange={(e) => setEditUserData({ ...editUserData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Group
                      </label>
                      <select
                        value={editUserData.group}
                        onChange={(e) => setEditUserData({ ...editUserData, group: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        {names.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level
                      </label>
                      <select
                        value={editUserData.level}
                        onChange={(e) => setEditUserData({ ...editUserData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        {levels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={editUserData.role}
                      onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room
                    </label>
                    <select
                      value={editUserData.room}
                      onChange={(e) => setEditUserData({ ...editUserData, room: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Room</option>
                      {rooms.map((room) => (
                        <option 
                          key={room._id} 
                          value={room.roomNo}
                          disabled={room.allocatedPersons && room.allocatedPersons.length >= room.capacity && !room.allocatedPersons.includes(selectedUser._id)}
                        >
                          {room.roomNo} ({room.allocatedPersons ? room.allocatedPersons.length : 0}/{room.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Edit Modal */}
      <AnimatePresence>
        <PhotoEditModal />
      </AnimatePresence>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center pb-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {users.length} users found
            </p>
          </div>
          
          <div className="flex mt-4 sm:mt-0 gap-2">
            <Button
              onClick={() => dispatch(fetchUsers())}
              disabled={loading}
              variant="outline"
              icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-5 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by name, field, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              >
                <option value="all">All Groups</option>
                {names.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loading && users.length === 0 ? (
            <div className="text-center p-12">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <FiUser className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">No users found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Field
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Room
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map((user) => (
                      <motion.tr 
                        key={user._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer ring-2 ring-primary-500 hover:ring-primary-600 transition-all"
                              onClick={() => openPhotoModal(user)}
                            >
                              <img 
                                src={user.photo} 
                                alt={user.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{user.field}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{user.mobile}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{ user.room ? user.room : "None"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{ user.group || "Not Set"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{ user.level || "Not Set"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => openEditModal(user)}
                              variant="outline"
                              size="sm"
                              icon={<FiEdit2 />}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(user._id)}
                              variant="danger"
                              size="sm"
                              icon={<FiTrash2 />}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel; 
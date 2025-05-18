import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  selectUsers, 
  selectUsersLoading, 
  fetchUsers, 
  deleteUser,
  promoteToAdmin,
  setSelectedUser,
  selectSelectedUser,
  clearSelectedUser
} from '../store/slices/userSlice.js';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FiRefreshCw, 
  FiShield, 
  FiTrash2, 
  FiX, 
  FiSearch,
  FiFilter,
  FiUser,
  FiHome,
  FiUsers
} from 'react-icons/fi';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const selectedUser = useSelector(selectSelectedUser);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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

  const handlePromoteToAdmin = async (id) => {
    if (window.confirm('Are you sure you want to promote this user to admin?')) {
      try {
        const resultAction = await dispatch(promoteToAdmin(id));
        
        if (promoteToAdmin.fulfilled.match(resultAction)) {
          toast.success('User promoted to admin successfully');
        }
      } catch (error) {
        console.error('Error promoting user:', error);
        toast.error('Failed to promote user to admin');
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

  // Filter users by search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

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
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center pb-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredUsers.length} users found
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Users Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
          
          {loading && users.length === 0 ? (
            <div className="text-center p-12">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <FiUser className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">No users found.</p>
            </div>
          ) : (
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
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredUsers.map((user) => (
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
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {user.role !== 'admin' && (
                            <Button
                              onClick={() => handlePromoteToAdmin(user._id)}
                              variant="outline"
                              size="sm"
                              icon={<FiShield />}
                            >
                              Promote
                            </Button>
                          )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel; 
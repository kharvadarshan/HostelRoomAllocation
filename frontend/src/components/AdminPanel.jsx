import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
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
} from '../store/slices/userSlice';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const selectedUser = useSelector(selectSelectedUser);
  const [showFullPhoto, setShowFullPhoto] = useState(false);

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

  return (
    <div className="mx-auto max-w-6xl">
      {showFullPhoto && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-screen p-4">
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedUser.photo} 
              alt={selectedUser.name} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-bold">{selectedUser.name}</h3>
              <p>{selectedUser.field}</p>
            </div>
          </div>
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={() => dispatch(fetchUsers())}
            disabled={loading}
            className="btn btn-primary"
          >
            Refresh
          </button>
        </div>
        
        {loading && users.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                          onClick={() => openPhotoModal(user)}
                        >
                          <img 
                            src={user.photo} 
                            alt={user.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.field}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.username}</div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ user.room ? user.room : "None"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Promote to Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel; 
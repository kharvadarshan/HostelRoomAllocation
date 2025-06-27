import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../api';
import {
  FiPlus,
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUser,
  FiLayers,
  FiMail,
  FiPhone,
  FiInfo, 
  FiHome,
  FiSearch,
  FiUserPlus
} from 'react-icons/fi';
import { debounce } from 'lodash';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState('all');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    roomNo: '',
    capacity: 4
  });
  const [allocatedUsers, setAllocatedUsers] = useState({});
  
  // Search user states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [floorFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = floorFilter !== 'all' ? { floor: floorFilter } : {};
      
      const { data } = await api.get('/rooms', { params });
      
      if (data.ok) {
        setRooms(data.rooms);
        
        // Collect all user IDs from allocated persons
        const userIds = data.rooms.reduce((ids, room) => {
          if (room.allocatedPersons && room.allocatedPersons.length > 0) {
            return [...ids, ...room.allocatedPersons];
          }
          return ids;
        }, []);
        
        // If we have allocated users, fetch their details
        if (userIds.length > 0) {
          fetchAllocatedUsers(userIds);
        }
      } else {
        toast.error(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocatedUsers = async (userIds) => {
    try {
      if (!userIds || userIds.length === 0) {
        return;
      }
      
      // Using a single request with query parameters to get multiple users
      const { data } = await api.get('/users/allocated', { 
        params: { userIds: userIds.join(',') } 
      });
      
      if (data.ok) {
        // Convert array to object with _id as keys for easier lookup
        const usersMap = data.users.reduce((map, user) => {
          map[user._id] = user;
          return map;
        }, {});
        setAllocatedUsers(usersMap);
      }
    } catch (error) {
      console.error('Error fetching allocated users:', error);
      
      // For UI purposes, we'll create placeholder objects for users that failed to load
      const placeholderUsersMap = {};
      userIds.forEach(id => {
        placeholderUsersMap[id] = {
          _id: id,
          name: 'User data unavailable',
          photo: null,
          error: true
        };
      });
      
      setAllocatedUsers(prev => ({
        ...prev,
        ...placeholderUsersMap
      }));
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    try {
      const { data } = await api.post('/rooms', formData);
      
      if (data.ok) {
        toast.success('Room added successfully');
        setShowAddModal(false);
        setFormData({ roomNo: '', capacity: 4 });
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    
    try {
      const { data } = await api.patch(`/rooms/${currentRoom._id}`, formData);
      
      if (data.ok) {
        toast.success('Room updated successfully');
        setShowEditModal(false);
        setCurrentRoom(null);
        setFormData({ roomNo: '', capacity: 4 });
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    
    try {
      const { data } = await api.delete(`/rooms/${roomId}`);
      
      if (data.ok) {
        toast.success('Room deleted successfully');
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const handleDeAllocateUser = async (roomId, userId) => {
    try {
      // Optimistically update UI
      const updatedRooms = rooms.map(room => {
        if (room._id === roomId) {
          return {
            ...room,
            allocatedPersons: room.allocatedPersons.filter(id => id !== userId)
          };
        }
        return room;
      });
      
      // Update state immediately for responsive UI
      setRooms(updatedRooms);
      
      // Make API call
      const { data } = await api.delete('/rooms', {
        data: { roomId, userId }
      });
      
      if (data.ok) {
        toast.success('User deallocated successfully');
        // No need to call fetchRooms() since we've already updated the UI
      } else {
        toast.error(data.message || 'Failed to deallocate user');
        // Revert optimistic update on failure
        fetchRooms();
      }
    } catch (error) {
      console.error('Error deallocating user:', error);
      toast.error(error.response?.data?.message || 'Failed to deallocate user');
      // Revert optimistic update on failure
      fetchRooms();
    }
  };

  const openEditModal = (room) => {
    setCurrentRoom(room);
    setFormData({
      roomNo: room.roomNo,
      capacity: room.capacity
    });
    setShowEditModal(true);
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Helper to extract floor number from room number
  const getFloorFromRoomNo = (roomNo) => {
    if (!roomNo) return '?';
    return roomNo.toString().charAt(0);
  };

  // Instead of dynamically generating floor options, use static options
  const floorOptions = [
    { value: 'all', label: 'All Floors' },
    { value: '1', label: 'Floor 1' },
    { value: '2', label: 'Floor 2' },
    { value: '3', label: 'Floor 3' },
    { value: 'R', label: 'Rashmika' }
  ];

  // Function to search for users with debounce
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      
      try {
        setSearchLoading(true);
        const { data } = await api.get('/users/search', { 
          params: { 
            query,
            unallocated: true
          } 
        });
        
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Open modal to add a user to a room
  const openAddUserModal = (room) => {
    setCurrentRoom(room);
    setShowAddUserModal(true);
    // Reset search
    setSearchQuery('');
    setSearchResults([]);
  };

  // Close add user modal
  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    setCurrentRoom(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Add user to room
  const handleAddUserToRoom = async (userId) => {
    if (!currentRoom) return;
    
    try {
      const { data } = await api.post('/rooms/user', {
        newId: userId,
        roomNo: currentRoom.roomNo
      });
      
      if (data.ok) {
        toast.success('User added to room successfully');
        fetchRooms();
        closeAddUserModal();
      } else {
        toast.error(data.message || 'Failed to add user to room');
      }
    } catch (error) {
      console.error('Error adding user to room:', error);
      toast.error(error.response?.data?.message || 'Failed to add user to room');
    }
  };

  // Filter rooms based on search and floor filter
  const filteredRooms = rooms.filter(room => {
    // Filter by floor
    const matchesFloor = floorFilter === 'all' || getFloorFromRoomNo(room.roomNo) === floorFilter;
    
    // Filter by search query
    const matchesSearch = !roomSearchQuery || 
      room.roomNo.toLowerCase().includes(roomSearchQuery.toLowerCase());
    
    return matchesFloor && matchesSearch;
  });

  return (
    <div className="container-fluid px-4 py-8 max-w-full">
      {/* Add Room Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Room</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddRoom}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Room Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 101"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Room number format should start with floor number (e.g. 101, 201)</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Room
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Room Modal */}
      <AnimatePresence>
        {showEditModal && currentRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Room {currentRoom.roomNo}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditRoom}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Room Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 101"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Room
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 mb-4">
                  {selectedUser.photo ? (
                    <img 
                      src={selectedUser.photo} 
                      alt={selectedUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiUser className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h3>
                <p className="text-primary-600 dark:text-primary-400">{selectedUser.field}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <FiPhone className="text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                    <p>{selectedUser.mobile || 'Not provided'}</p>
                  </div>
                </div>
                
                {selectedUser.group && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <FiUsers className="text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
                      <p>{selectedUser.group}</p>
                    </div>
                  </div>
                )}
                
                {/*{selectedUser.level && (*/}
                {/*  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">*/}
                {/*    <FiLayers className="text-primary-500 flex-shrink-0" />*/}
                {/*    <div>*/}
                {/*      <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>*/}
                {/*      <p>Level {selectedUser.level}</p>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
                
                {selectedUser.room && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <FiHome className="text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Room</p>
                      <p>Room {selectedUser.room}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowUserModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User to Room Modal */}
      <AnimatePresence>
        {showAddUserModal && currentRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={closeAddUserModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add User to Room {currentRoom.roomNo}
                </h2>
                <button
                  onClick={closeAddUserModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Room Capacity: {currentRoom.allocatedPersons?.length || 0}/{currentRoom.capacity}
                </p>
              </div>
              
              <div className="relative mb-5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search users by name, mobile..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.length > 0 ? "No users found" : "Search for users to add"}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {searchResults.map(user => (
                      <li 
                        key={user._id} 
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleAddUserToRoom(user._id)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-600">
                            {user.photo ? (
                              <img 
                                src={user.photo} 
                                alt={user.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <FiUser className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="truncate">{user.mobile}</span>
                              <span className="mx-1">•</span>
                              <span className="truncate">{user.field}</span>
                            </div>
                            {(user.group ) && (
                              <div className="flex mt-1 space-x-1">
                                {user.group && (
                                  <span className="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                                    {user.group}
                                  </span>
                                )}
                                {/*{user.level && (*/}
                                {/*  <span className="px-1.5 py-0.5 text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded">*/}
                                {/*    Level {user.level}*/}
                                {/*  </span>*/}
                                {/*)}*/}
                              </div>
                            )}
                          </div>
                          <FiPlus className="h-5 w-5 text-primary-500 ml-2" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mt-5 flex justify-end">
                <Button
                  variant="outline"
                  onClick={closeAddUserModal}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center">
              <FiHome className="mr-2 text-primary-500" />
              Room Management
            </CardTitle>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredRooms.length} rooms available
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                placeholder="Search room number..."
                value={roomSearchQuery}
                onChange={(e) => setRoomSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center shadow-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <div className="pl-3 pr-2">
                <FiFilter className="text-gray-500" />
              </div>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="py-2 pr-3 pl-1 rounded-lg bg-transparent dark:bg-transparent border-0 border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-none"
              >
                {floorOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<FiPlus />}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
            >
              Add Room
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center p-12">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <FiUsers className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">No rooms found.</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                Add your first room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <motion.div
                  key={room._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Room {room.roomNo}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                        title="Edit Room"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                        title="Delete Room"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center">
                          <FiHome className="mr-1.5" /> Floor {getFloorFromRoomNo(room.roomNo)}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 flex items-center mt-1">
                          <FiUsers className="mr-1.5" /> Capacity: <span className="font-medium ml-1">{room.capacity}</span>
                        </p>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900 rounded-full px-4 py-2 font-medium">
                        <p className="text-primary-800 dark:text-primary-200 text-sm flex items-center">
                          <FiUser className="mr-1.5" />
                          {room.allocatedPersons?.length || 0}/{room.capacity}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-gray-900 dark:text-white font-medium text-lg flex items-center">
                          <FiUsers className="w-4 h-4 mr-1.5" /> Occupants
                        </h4>
                        {(room.allocatedPersons?.length || 0) < room.capacity && (
                          <Button
                            onClick={() => openAddUserModal(room)}
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 h-8"
                            icon={<FiUserPlus className="w-4 h-4" />}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                      {!room.allocatedPersons || room.allocatedPersons.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                          <FiUsers className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-500 italic">No one allocated yet</p>
                          <Button
                            onClick={() => openAddUserModal(room)}
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            icon={<FiUserPlus className="w-4 h-4" />}
                          >
                            Add User
                          </Button>
                        </div>
                      ) : (
                        <ul className="space-y-2.5">
                          {room.allocatedPersons.map((personId) => {
                            const user = allocatedUsers[personId];
                            return (
                              <li key={personId} className="flex justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div 
                                  className="flex items-center cursor-pointer rounded px-2 py-1 transition-colors w-full"
                                  onClick={() => user && !user.error && openUserModal(user)}
                                >
                                  {user ? (
                                    <>
                                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-primary-200 shadow-sm">
                                        {user.photo ? (
                                          <img 
                                            src={user.photo} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <FiUser className="text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm truncate ${user.error ? 'text-red-500' : ''}`}>
                                          {user.name}
                                        </p>
                                        {!user.error && (
                                          <div className="flex items-center space-x-1 mt-1">
                                            {user.group && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                                                {user.group}
                                              </span>
                                            )}
                                            {/*{user.level && (*/}
                                            {/*  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200">*/}
                                            {/*    Level {user.level}*/}
                                            {/*  </span>*/}
                                            {/*)}*/}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                                        <FiUser className="text-gray-500" />
                                      </div>
                                      <span className="text-sm">Loading user...</span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeAllocateUser(room._id, personId)}
                                  className="text-red-500 hover:text-red-700 p-1.5 self-center ml-2 flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                  title="Remove user"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManagement; 
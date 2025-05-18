import { useState, useEffect } from 'react';
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
  FiUsers
} from 'react-icons/fi';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNo: '',
    capacity: 4
  });

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
      // This would require a PATCH endpoint to be added to the backend
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
      // This would require a DELETE endpoint to be added to the backend
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
      const { data } = await api.delete('/rooms', {
        data: { roomId, userId }
      });
      
      if (data.ok) {
        toast.success('User deallocated successfully');
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to deallocate user');
      }
    } catch (error) {
      console.error('Error deallocating user:', error);
      toast.error(error.response?.data?.message || 'Failed to deallocate user');
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

  // Helper to extract floor number from room number
  const getFloorFromRoomNo = (roomNo) => {
    if (!roomNo) return '?';
    return roomNo.toString().charAt(0);
  };

  // Get unique floor numbers for filter
  const getFloors = () => {
    const floors = new Set(rooms.map(room => getFloorFromRoomNo(room.roomNo)));
    return Array.from(floors).sort();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
          <div>
            <CardTitle>Room Management</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {rooms.length} rooms found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="py-2 px-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Floors</option>
                {getFloors().map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<FiPlus />}
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
          ) : rooms.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <motion.div
                  key={room._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-card dark:shadow-card-dark border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 bg-primary-500 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Room {room.roomNo}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-1 rounded hover:bg-primary-600"
                        title="Edit Room"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="p-1 rounded hover:bg-primary-600"
                        title="Delete Room"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Floor {getFloorFromRoomNo(room.roomNo)}</p>
                        <p className="text-gray-700 dark:text-gray-300">Capacity: <span className="font-medium">{room.capacity}</span></p>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900 rounded-full px-3 py-1">
                        <p className="text-primary-800 dark:text-primary-200 text-sm font-medium">
                          {room.allocatedPersons?.length || 0}/{room.capacity}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-medium mb-2">Allocated Persons</h4>
                      {!room.allocatedPersons || room.allocatedPersons.length === 0 ? (
                        <p className="text-gray-500 italic">No one allocated yet</p>
                      ) : (
                        <ul className="space-y-2">
                          {/* Note: This would need to be populated with user information fetched separately or included in the API response */}
                          {room.allocatedPersons.map((personId, index) => (
                            <li key={personId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span>User ID: {personId.toString().substring(0, 8)}...</span>
                              <button
                                onClick={() => handleDeAllocateUser(room._id, personId)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove user"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
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
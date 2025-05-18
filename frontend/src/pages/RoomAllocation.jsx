import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../api';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiUser, 
  FiUsers, 
  FiHome,
  FiRefreshCw,
  FiFilter
} from 'react-icons/fi';

const RoomAllocation = () => {
  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState('');
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [allocatedUsers, setAllocatedUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const selectionTimerRef = useRef(null);
  const allocationAnimationRef = useRef(null);

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (currentFloor) {
      fetchRooms(currentFloor);
    }
  }, [currentFloor]);

  useEffect(() => {
    fetchUnallocatedUsers();
  }, []);

  useEffect(() => {
    if (selectedGroup === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.group === selectedGroup));
    }
  }, [selectedGroup, users]);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rooms');
      
      if (data.ok) {
        // Extract unique floor numbers from rooms
        const floors = [...new Set(data.rooms.map(room => room.roomNo.toString().charAt(0)))].sort();
        setFloors(floors);
        
        if (floors.length > 0) {
          setCurrentFloor(floors[0]);
        }
      } else {
        toast.error(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      toast.error('Failed to fetch floors');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (floor) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/rooms`, {
        params: { floor }
      });
      
      if (data.ok) {
        // Sort rooms by room number
        const sortedRooms = data.rooms.sort((a, b) => a.roomNo - b.roomNo);
        setRooms(sortedRooms);
        setCurrentRoomIndex(0);
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

  const fetchUnallocatedUsers = async () => {
    try {
      const { data } = await api.get('/users/unallocated');
      
      if (data.ok) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to fetch unallocated users');
      }
    } catch (error) {
      console.error('Error fetching unallocated users:', error);
      toast.error('Failed to fetch unallocated users');
    }
  };

  const startUserSelection = () => {
    if (filteredUsers.length === 0) {
      toast.error('No unallocated users available');
      return;
    }

    const currentRoom = rooms[currentRoomIndex];
    if (!currentRoom) {
      toast.error('No room selected');
      return;
    }

    if (currentRoom.allocatedPersons && currentRoom.allocatedPersons.length >= currentRoom.capacity) {
      toast.error('This room is already at full capacity');
      return;
    }

    setIsSelecting(true);
    let selectionCounter = 0;
    const maxSelections = 15; // Number of "shuffles" before final selection
    const interval = 200; // Time between shuffles in ms
    
    // Clear any existing timer
    if (selectionTimerRef.current) {
      clearInterval(selectionTimerRef.current);
    }
    
    // Start the selection animation
    selectionTimerRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredUsers.length);
      setSelectedUser(filteredUsers[randomIndex]);
      
      selectionCounter++;
      
      if (selectionCounter >= maxSelections) {
        clearInterval(selectionTimerRef.current);
        
        // Final selection
        const finalUser = filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
        setSelectedUser(finalUser);
        
        // After 5 seconds, allocate the user and reset
        allocationAnimationRef.current = setTimeout(() => {
          allocateUserToRoom(finalUser._id, currentRoom.roomNo);
        }, 5000);
      }
    }, interval);
  };

  const allocateUserToRoom = async (userId, roomNo) => {
    try {
      const { data } = await api.post('/rooms/user', {
        newId: userId,
        roomNo
      });
      
      if (data.ok) {
        // Make sure we have a selectedUser before accessing its properties
        if (selectedUser) {
          // Add to allocated users
          setAllocatedUsers([...allocatedUsers, selectedUser]);
          
          // Remove from available users
          const updatedUsers = users.filter(user => user._id !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(selectedGroup === 'all' 
            ? updatedUsers 
            : updatedUsers.filter(user => user.group === selectedGroup));
          
          toast.success(`${selectedUser.name} allocated to Room ${roomNo}`);
        } else {
          // Handle case where selectedUser is null or undefined
          toast.success(`User allocated to Room ${roomNo}`);
          
          // Update users list
          const updatedUsers = users.filter(user => user._id !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(selectedGroup === 'all' 
            ? updatedUsers 
            : updatedUsers.filter(user => user.group === selectedGroup));
        }
        
        // Update the current room's allocated persons
        setRooms(rooms.map(room => {
          if (room.roomNo === roomNo) {
            return {
              ...room,
              allocatedPersons: [...(room.allocatedPersons || []), userId]
            };
          }
          return room;
        }));
        
        // Move to next room automatically after a brief pause
        setTimeout(() => {
          goToNextRoom();
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to allocate user');
      }
    } catch (error) {
      console.error('Error allocating user to room:', error);
      toast.error('Failed to allocate user to room');
    } finally {
      setIsSelecting(false);
      setSelectedUser(null);
    }
  };

  const goToNextRoom = () => {
    // Clean up any pending animations
    if (selectionTimerRef.current) {
      clearInterval(selectionTimerRef.current);
    }
    if (allocationAnimationRef.current) {
      clearTimeout(allocationAnimationRef.current);
    }
    
    setIsSelecting(false);
    setSelectedUser(null);
    
    if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    } else if (floors.length > 0) {
      // Move to next floor if available
      const currentFloorIndex = floors.indexOf(currentFloor);
      if (currentFloorIndex < floors.length - 1) {
        setCurrentFloor(floors[currentFloorIndex + 1]);
      } else {
        toast.info('Reached the last room on the last floor');
      }
    }
  };

  const goToPreviousRoom = () => {
    // Clean up any pending animations
    if (selectionTimerRef.current) {
      clearInterval(selectionTimerRef.current);
    }
    if (allocationAnimationRef.current) {
      clearTimeout(allocationAnimationRef.current);
    }
    
    setIsSelecting(false);
    setSelectedUser(null);
    
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
    } else if (floors.length > 0) {
      // Move to previous floor if available
      const currentFloorIndex = floors.indexOf(currentFloor);
      if (currentFloorIndex > 0) {
        // Set to the previous floor
        const prevFloor = floors[currentFloorIndex - 1];
        setCurrentFloor(prevFloor);
        
        // Need to ensure we have rooms for that floor and set index to the last room
        api.get(`/rooms`, {
          params: { floor: prevFloor }
        })
          .then(({ data }) => {
            if (data.ok && data.rooms.length > 0) {
              const sortedRooms = data.rooms.sort((a, b) => a.roomNo - b.roomNo);
              setRooms(sortedRooms);
              setCurrentRoomIndex(sortedRooms.length - 1);
            }
          })
          .catch(error => {
            console.error('Error fetching previous floor rooms:', error);
          });
      } else {
        toast.info('Already at the first room on the first floor');
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (selectionTimerRef.current) {
        clearInterval(selectionTimerRef.current);
      }
      if (allocationAnimationRef.current) {
        clearTimeout(allocationAnimationRef.current);
      }
    };
  }, []);

  // Current room for rendering
  const currentRoom = rooms[currentRoomIndex] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Floor Selection</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && floors.length === 0 ? (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
              ) : floors.length === 0 ? (
                <p className="text-gray-500 text-center">No floors available</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {floors.map(floor => (
                    <Button
                      key={floor}
                      variant={currentFloor === floor ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setCurrentFloor(floor)}
                    >
                      <FiHome className="mr-2" />
                      Floor {floor}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Group</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={selectedGroup === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedGroup('all')}
                  >
                    <FiFilter className="mr-2" />
                    All Groups
                  </Button>
                  <Button
                    variant={selectedGroup === 'a' ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedGroup('a')}
                  >
                    <FiFilter className="mr-2" />
                    Group A
                  </Button>
                  <Button
                    variant={selectedGroup === 'b' ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedGroup('b')}
                  >
                    <FiFilter className="mr-2" />
                    Group B
                  </Button>
                  <Button
                    variant={selectedGroup === 'c' ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedGroup('c')}
                  >
                    <FiFilter className="mr-2" />
                    Group C
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-3/4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Room Allocation</CardTitle>
                  {selectedGroup !== 'all' && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                      Filtering: Group {selectedGroup.toUpperCase()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToPreviousRoom}
                    disabled={loading || isSelecting}
                    icon={<FiChevronLeft />}
                  >
                    Previous Room
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToNextRoom}
                    disabled={loading || isSelecting}
                    icon={<FiChevronRight />}
                  >
                    Next Room
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center p-12">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
                </div>
              ) : !currentRoom ? (
                <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <FiHome className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">No rooms available for this floor</p>
                </div>
              ) : (
                <div>
                  <div className="bg-primary-500 text-white p-4 rounded-t-lg mb-6">
                    <h2 className="text-2xl font-bold text-center">Room {currentRoom.roomNo}</h2>
                    <div className="text-center mt-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {currentRoom.allocatedPersons?.length || 0} / {currentRoom.capacity} Allocated
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Current Occupants</h3>
                    {!currentRoom.allocatedPersons || currentRoom.allocatedPersons.length === 0 ? (
                      <p className="text-gray-500 italic text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">No occupants yet</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentRoom.allocatedPersons.map(personId => {
                          // Find the allocated user if it's in our allocated users list
                          const user = allocatedUsers.find(u => u._id === personId);
                          return (
                            <div 
                              key={personId} 
                              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center"
                            >
                              {user ? (
                                <>
                                  <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 mb-2 border-2 border-primary-500">
                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                  </div>
                                  <p className="font-medium text-center">{user.name}</p>
                                  <p className="text-sm text-gray-500 text-center">{user.field}</p>
                                  {user.group && (
                                    <span className="mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                                      Group {user.group.toUpperCase()}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
                                    <FiUser className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <p className="font-medium text-center">User {personId.substring(0, 6)}...</p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <AnimatePresence>
                      {isSelecting && selectedUser && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-6 relative z-10"
                        >
                          <div className="relative">
                            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-primary-500 shadow-lg mb-4">
                              <img 
                                src={selectedUser.photo} 
                                alt={selectedUser.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <motion.div 
                              className="absolute inset-0 bg-primary-500 mix-blend-overlay rounded-full"
                              animate={{ 
                                opacity: [0, 0.2, 0], 
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop"
                              }}
                            />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">{selectedUser.name}</h3>
                          <p className="text-lg text-center text-primary-600 dark:text-primary-400 mb-4">{selectedUser.field}</p>
                          
                          <div className="text-center space-y-2">
                            <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm px-3 py-1 rounded-full">
                              {selectedUser.mobile}
                            </span>
                            
                            {selectedUser.group && (
                              <div>
                                <span className="inline-block bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 text-sm px-3 py-1 rounded-full">
                                  Group {selectedUser.group.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={startUserSelection}
                        disabled={loading || isSelecting || filteredUsers.length === 0 || (currentRoom.allocatedPersons?.length >= currentRoom.capacity)}
                        icon={<FiUsers />}
                        size="lg"
                      >
                        {isSelecting ? 'Selecting...' : 'Select Random User'}
                      </Button>
                      
                      <Button
                        onClick={fetchUnallocatedUsers}
                        variant="outline"
                        disabled={loading || isSelecting}
                        icon={<FiRefreshCw />}
                        size="lg"
                      >
                        Refresh Users
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-3">
                      {filteredUsers.length} unallocated {filteredUsers.length === 1 ? 'user' : 'users'} available
                      {selectedGroup !== 'all' && ` in Group ${selectedGroup.toUpperCase()}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomAllocation; 
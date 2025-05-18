import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../api';
import Confetti from 'react-confetti';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiUser, 
  FiUsers, 
  FiHome,
  FiRefreshCw,
  FiFilter,
  FiLayers,
  FiX
} from 'react-icons/fi';
import { fetchUnallocatedUsers, selectUnallocatedUsers, selectUsersLoading, removeAllocatedUser } from '../store/slices/userSlice';
import { names, levels } from '../utils/names';

// Component imports
import FloorSelector from '../components/room/FloorSelector';
import UserSelection from '../components/room/UserSelection';
import RoomHeader from '../components/room/RoomHeader';
import RoomDetails from '../components/room/RoomDetails';
import RoomOccupants from '../components/room/RoomOccupants';

// Custom confetti explosion component to avoid JSS warnings
const CustomConfettiExplosion = ({ colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 100 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * 360;
        const distance = Math.random() * 200 + 100;
        const opacity = Math.random() * 0.5 + 0.5;
        
        return (
          <motion.div 
            key={i} 
            className="absolute rounded-full"
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: color,
              opacity: opacity
            }}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1, 0.5, 0],
              x: [0, Math.cos(angle * Math.PI / 180) * distance],
              y: [0, Math.sin(angle * Math.PI / 180) * distance]
            }}
            transition={{ 
              duration: duration,
              delay: delay,
              ease: [0.1, 0.9, 0.4, 0]
            }}
          />
        );
      })}
    </div>
  );
};

const RoomAllocation = () => {
  const dispatch = useDispatch();
  const unallocatedUsers = useSelector(selectUnallocatedUsers);
  const usersLoading = useSelector(selectUsersLoading);

  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState('');
  const [rooms, setRooms] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [allocatedUsers, setAllocatedUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [allocatedUsersMap, setAllocatedUsersMap] = useState({});
  const [carouselUsers, setCarouselUsers] = useState([]);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const allocationAnimationRef = useRef(null);
  const isAllocationInProgress = useRef(false);
  const allocationAttemptedForUser = useRef(new Set());

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for userSelected event from UserSelection component
  useEffect(() => {
    const handleUserSelected = (event) => {
      const { user } = event.detail;
      if (user) {
        // First check if the room can accept more users
        const currentRoom = rooms[currentRoomIndex];
        if (currentRoom && 
            currentRoom.allocatedPersons && 
            currentRoom.allocatedPersons.length >= currentRoom.capacity) {
          toast.error(`Room ${currentRoom.roomNo} is already at full capacity`);
          // Reset selection states without showing confetti
          setIsSelecting(false);
          setSelectionComplete(false);
          return;
        }

        // Check if we've already tried to allocate this user
        if (allocationAttemptedForUser.current.has(user._id)) {
          console.log(`Already attempted to allocate user ${user._id}, skipping`);
          return;
        }

        setSelectedUser(user);
        setSelectionComplete(true);
        setShowConfetti(true);
        setShowExplosion(true);
        
        // Auto hide confetti after 6 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 6000);
        
        // Auto hide explosion after 3 seconds
        setTimeout(() => {
          setShowExplosion(false);
        }, 3000);
      }
    };

    window.addEventListener('userSelected', handleUserSelected);
    return () => {
      window.removeEventListener('userSelected', handleUserSelected);
    };
  }, [rooms, currentRoomIndex]);

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (currentFloor) {
      fetchRooms(currentFloor);
    }
  }, [currentFloor]);

  useEffect(() => {
    // Fetch unallocated users when component mounts
    loadUnallocatedUsers();
  }, [dispatch]);

  useEffect(() => {
    if (selectedGroup === 'all' && selectedLevel === 'all') {
      setFilteredUsers(unallocatedUsers);
    } else if (selectedGroup === 'all') {
      setFilteredUsers(unallocatedUsers.filter(user => user.level === selectedLevel));
    } else if (selectedLevel === 'all') {
      setFilteredUsers(unallocatedUsers.filter(user => user.group === selectedGroup));
    } else {
      setFilteredUsers(unallocatedUsers.filter(
        user => user.group === selectedGroup && user.level === selectedLevel
      ));
    }
  }, [selectedGroup, selectedLevel, unallocatedUsers]);

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
        
        // Collect user IDs from all allocated persons
        const userIds = [];
        sortedRooms.forEach(room => {
          if (room.allocatedPersons && room.allocatedPersons.length > 0) {
            userIds.push(...room.allocatedPersons);
          }
        });
        
        // Fetch allocated users' details
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
      
      const { data } = await api.get('/users/allocated', { 
        params: { userIds: userIds.join(',') } 
      });
      
      if (data.ok) {
        // Convert to map for easier lookup
        const usersMap = {};
        data.users.forEach(user => {
          usersMap[user._id] = user;
        });
        
        setAllocatedUsersMap(usersMap);
      }
    } catch (error) {
      console.error('Error fetching allocated users:', error);
      
      // Create placeholder objects for users that failed to load
      const placeholderUsersMap = {};
      userIds.forEach(id => {
        placeholderUsersMap[id] = {
          _id: id,
          name: 'User data unavailable',
          photo: null,
          error: true
        };
      });
      
      setAllocatedUsersMap(prev => ({
        ...prev,
        ...placeholderUsersMap
      }));
    }
  };

  const loadUnallocatedUsers = () => {
    // Using Redux to fetch unallocated users with filters
    const filters = {};
    if (selectedGroup !== 'all') {
      filters.group = selectedGroup;
    }
    if (selectedLevel !== 'all') {
      filters.level = selectedLevel;
    }
    
    dispatch(fetchUnallocatedUsers(filters));
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

    // Clear any previous allocation attempts tracking
    allocationAttemptedForUser.current.clear();
    
    setIsSelecting(true);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
    setShowExplosion(false);
  };

  const allocateUserToRoom = async (userId, roomNo) => {
    try {
      // Check if userId is undefined or null
      if (!userId) {
        console.error('Cannot allocate undefined or null user ID');
        return false;
      }

      // Check if roomNo is undefined or null
      if (!roomNo) {
        console.error('Cannot allocate to undefined or null room number');
        return false;
      }

      // Check if we've already attempted to allocate this user
      if (allocationAttemptedForUser.current.has(userId)) {
        console.log(`Already attempted to allocate user ${userId}, not trying again`);
        return false;
      }
      
      // Mark that we've attempted to allocate this user
      allocationAttemptedForUser.current.add(userId);
      
      // Set flag to prevent multiple allocation attempts
      if (isAllocationInProgress.current) {
        console.log('Allocation already in progress, skipping');
        return false;
      }
      
      isAllocationInProgress.current = true;
      console.log(`Allocating user ${userId} to room ${roomNo}`);
      
      // First check if the room is at capacity
      const roomToAllocate = rooms.find(room => room.roomNo === roomNo);
      if (roomToAllocate && 
          roomToAllocate.allocatedPersons && 
          roomToAllocate.allocatedPersons.length >= roomToAllocate.capacity) {
        toast.error(`Room ${roomNo} is already at full capacity`);
        console.log('Room is at capacity, not making API call');
        return false;
      }
      
      const { data } = await api.post('/rooms/user', {
        newId: userId,
        roomNo
      });
      
      if (data.ok) {
        // Make sure we have a selectedUser before accessing its properties
        if (selectedUser) {
          // Add to allocated users
          setAllocatedUsers(prev => [...prev, selectedUser]);
          
          // Also add to the map for immediate display
          setAllocatedUsersMap(prev => ({
            ...prev,
            [userId]: selectedUser
          }));
          
          // Remove from available users using Redux
          dispatch(removeAllocatedUser(userId));
          
          toast.success(`${selectedUser.name} allocated to Room ${roomNo}`);
        } else {
          // Handle case where selectedUser is null or undefined
          toast.success(`User allocated to Room ${roomNo}`);
          dispatch(removeAllocatedUser(userId));
        }
        
        // Update the current room's allocated persons
        setRooms(prev => prev.map(room => {
          if (room.roomNo === roomNo) {
            return {
              ...room,
              allocatedPersons: [...(room.allocatedPersons || []), userId]
            };
          }
          return room;
        }));
        
        return true;
      } else {
        toast.error(data.message || 'Failed to allocate user');
        return false;
      }
    } catch (error) {
      console.error('Error allocating user to room:', error);
      
      // Check if there's a response with a message
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to allocate user to room');
      }
      
      return false;
    } finally {
      isAllocationInProgress.current = false;
    }
  };

  const goToNextRoom = async () => {
    // Clean up any pending animations
    if (allocationAnimationRef.current) {
      clearTimeout(allocationAnimationRef.current);
    }
    
    // If a user was selected, allocate them to the current room before moving on
    if (selectionComplete && selectedUser) {
      const currentRoom = rooms[currentRoomIndex];
      
      if (currentRoom) {
        // Wait for allocation to complete before proceeding
        const success = await allocateUserToRoom(selectedUser._id, currentRoom.roomNo);
        
        if (!success) {
          // If allocation failed, log but still proceed to next room
          console.log('Failed to allocate user, proceeding to next room anyway');
        }
      }
    }
    
    setIsSelecting(false);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
    
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
    if (allocationAnimationRef.current) {
      clearTimeout(allocationAnimationRef.current);
    }
    
    setIsSelecting(false);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
    setShowExplosion(false);
    
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
        toast.success('Already at the first room on the first floor');
      }
    }
  };

  const closeSelection = async (user) => {
    // If user closes the selection, still allocate the user to the room
    if ((selectionComplete && selectedUser) || user) {
      const userToAllocate = user || selectedUser;
      const currentRoom = rooms[currentRoomIndex];
      
      if (currentRoom && userToAllocate && userToAllocate._id) {
        // Check if we've already tried to allocate this user
        if (!allocationAttemptedForUser.current.has(userToAllocate._id)) {
          await allocateUserToRoom(userToAllocate._id, currentRoom.roomNo);
        } else {
          console.log(`User ${userToAllocate._id} allocation was already attempted, skipping`);
        }
      }
    }
    
    setIsSelecting(false);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (allocationAnimationRef.current) {
        clearTimeout(allocationAnimationRef.current);
      }
    };
  }, []);

  // Current room for rendering
  const currentRoom = rooms[currentRoomIndex] || null;

  return (
    <div className="container-fluid px-4 py-8 max-w-full">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          tweenDuration={6000}
        />
      )}
      
      {showExplosion && <CustomConfettiExplosion />}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/5">
          <FloorSelector 
            floors={floors}
            currentFloor={currentFloor}
            setCurrentFloor={setCurrentFloor}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            loading={loading}
          />
        </div>
        
        <div className="md:w-4/5">
          <Card className="h-full">
            <CardHeader>
              <RoomHeader 
                currentRoom={currentRoom}
                goToPreviousRoom={goToPreviousRoom}
                goToNextRoom={goToNextRoom}
                loading={loading}
                isSelecting={isSelecting}
                selectionComplete={selectionComplete}
                selectedGroup={selectedGroup}
                selectedLevel={selectedLevel}
              />
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center p-12">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
                </div>
              ) : (
                <div>
                  <RoomDetails currentRoom={currentRoom} />
                  
                  <RoomOccupants 
                    currentRoom={currentRoom}
                    allocatedUsersMap={allocatedUsersMap}
                    allocatedUsers={allocatedUsers}
                  />
                  
                  <div className="flex flex-col items-center">
                    <UserSelection 
                      isSelecting={isSelecting}
                      selectionComplete={selectionComplete}
                      filteredUsers={filteredUsers}
                      currentRoom={currentRoom}
                      selectedUser={selectedUser}
                      closeSelection={closeSelection}
                      goToNextRoom={goToNextRoom}
                      startUserSelection={startUserSelection}
                      usersLoading={usersLoading}
                      showConfetti={showConfetti}
                      showExplosion={showExplosion}
                      windowSize={windowSize}
                    />
                    
                    <div className="mt-4">
                      <Button
                        onClick={loadUnallocatedUsers}
                        variant="outline"
                        disabled={usersLoading || isSelecting}
                        icon={<FiRefreshCw />}
                        size="lg"
                      >
                        Refresh Users
                      </Button>
                    </div>
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

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api';
import useAudio from '../../hooks/useAudio';

const useRoomAllocationState = () => {
  const audio = useAudio();
  
  // State for rooms
  const [rooms, setRooms] = useState([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [floors, setFloors] = useState([]);
  const [currentFloor, setCurrentFloor] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  // State for users
  const [unallocatedUsers, setUnallocatedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [allocatedUsersMap, setAllocatedUsersMap] = useState({});
  const [allocatedUsers, setAllocatedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // State for selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State for UI effects
  const [showConfetti, setShowConfetti] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  
  // Window size for confetti
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  // Refs
  const hasSelectionOccurred = useRef(false);
  const allocationAttemptedForUser = useRef(new Set());
  const isAllocationInProgress = useRef(false);
  
  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update filtered users when unallocated users or filters change
  useEffect(() => {
    if (unallocatedUsers.length > 0) {
      let filtered = [...unallocatedUsers];
      
      // Apply group filter if not 'all'
      if (selectedGroup !== 'all') {
        filtered = filtered.filter(user => user.group === selectedGroup);
      }
      
      // Apply level filter if not 'all'
      if (selectedLevel !== 'all') {
        filtered = filtered.filter(user => user.level === selectedLevel);
      }
      
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [unallocatedUsers, selectedGroup, selectedLevel]);
  
  // Load floors and rooms on mount
  useEffect(() => {
    fetchFloors();
  }, []);
  
  // Load rooms when floor changes
  useEffect(() => {
    if (currentFloor) {
      fetchRoomsForFloor(currentFloor);
    }
  }, [currentFloor]);
  
  // Update filtered users when filters change
  useEffect(() => {
    fetchUnallocatedUsers();
  }, [selectedGroup, selectedLevel]);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rooms');
      
      if (data.ok) {
        // Extract unique floor numbers from rooms
        const floorSet = new Set();
        
        data.rooms.forEach(room => {
          const roomNo = room.roomNo.toString();
          if (roomNo.startsWith('R')) {
            floorSet.add('R');
          } else {
            floorSet.add(roomNo.charAt(0));
          }
        });
        
        const sortedFloors = Array.from(floorSet).sort((a, b) => {
          if (a === 'R') return 1;
          if (b === 'R') return -1;
          return a - b;
        });
        
        setFloors(sortedFloors);
        
        if (sortedFloors.length > 0) {
          setCurrentFloor(sortedFloors[0]);
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

  const fetchRoomsForFloor = async (floor) => {
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

  const fetchUnallocatedUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Build query parameters
      const params = {};
      if (selectedGroup !== 'all') {
        params.group = selectedGroup;
      }
      if (selectedLevel !== 'all') {
        params.level = selectedLevel;
      }
      
      const { data } = await api.get('/users/unallocated', { params });
      
      if (data.ok) {
        setUnallocatedUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to fetch unallocated users');
      }
    } catch (error) {
      console.error('Error fetching unallocated users:', error);
      toast.error('Failed to fetch unallocated users');
    } finally {
      setUsersLoading(false);
    }
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
          
          // Remove from available users
          setUnallocatedUsers(prev => prev.filter(user => user._id !== userId));
          
          toast.success(`${selectedUser.name} allocated to Room ${roomNo}`);
        } else {
          // Handle case where selectedUser is null or undefined
          toast.success(`User allocated to Room ${roomNo}`);
          setUnallocatedUsers(prev => prev.filter(user => user._id !== userId));
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

  const handleUserSelected = (user) => {
    console.log('User selected:', user.name);
    
    // Update state with selected user
    setSelectedUser(user);
    setSelectionComplete(true);
    setShowUserPopup(true);
    setIsSelecting(false);
    
    console.log('State updated after user selection');
  };

  const startUserSelection = () => {
    console.log('startUserSelection called');
    console.log('Current state:', { 
      filteredUsers: filteredUsers.length,
      currentRoomIndex,
      isSelecting,
      selectionComplete
    });
    
    if (filteredUsers.length === 0) {
      console.error('No filtered users available');
      toast.error('No unallocated users available');
      return;
    }

    const currentRoom = rooms[currentRoomIndex];

    // Check if we have a current room
    if (!currentRoom) {
      console.error('No room selected');
      toast.error('No room selected');
      return;
    }

    if (currentRoom.allocatedPersons && currentRoom.allocatedPersons.length >= currentRoom.capacity) {
      console.error('Room at capacity:', currentRoom.allocatedPersons.length, '>=', currentRoom.capacity);
      toast.error('This room is already at full capacity');
      return;
    }

    console.log('Starting user selection process');
    
    // Clear any previous allocation attempts tracking
    allocationAttemptedForUser.current.clear();
    hasSelectionOccurred.current = false;
    
    // Start the selection process - now showing card grid instead of random selection
    setIsSelecting(true);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
    setShowUserPopup(false);
    
    console.log('Selection state initialized with', filteredUsers.length, 'filtered users');
  };

  const goToNextRoom = async () => {
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
    setIsSelecting(false);
    setSelectionComplete(false);
    setSelectedUser(null);
    setShowConfetti(false);
    
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

  // Function to handle when a user is selected and the modal should be shown
  const allocateSelectedUser = async () => {
    if (!selectedUser || !rooms[currentRoomIndex]) return;
    
    const currentRoom = rooms[currentRoomIndex];
    
    // Play success sound
    audio.play('/assets/sounds/success-sound.mp3', { volume: 0.4 });
    
    try {
      const { data } = await api.post('/rooms/user', {
        newId: selectedUser._id,
        roomNo: currentRoom.roomNo
      });
      
      if (data.ok) {
        // Update rooms data
        const updatedRooms = [...rooms];
        const updatedRoom = {
          ...currentRoom,
          allocatedPersons: [
            ...(currentRoom.allocatedPersons || []),
            selectedUser._id
          ]
        };
        updatedRooms[currentRoomIndex] = updatedRoom;
        setRooms(updatedRooms);
        
        // Update allocated users map
        setAllocatedUsersMap(prev => ({
          ...prev,
          [selectedUser._id]: selectedUser
        }));
        
        // Remove user from unallocated users
        setUnallocatedUsers(prev => 
          prev.filter(user => user._id !== selectedUser._id)
        );
        
        toast.success(`${selectedUser.name} allocated to Room ${currentRoom.roomNo}`);
      } else {
        toast.error(data.message || 'Failed to allocate user');
      }
    } catch (error) {
      console.error('Error allocating user:', error);
      toast.error('Failed to allocate user');
    } finally {
      // First close the popup
      setShowUserPopup(false);
      
      // Delay clearing the other states to avoid visual glitches
      setTimeout(() => {
        setShowConfetti(false);
        setSelectedUser(null);
      }, 300);
    }
  };
  
  // Function to refresh the unallocated users list
  const loadUnallocatedUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Build query parameters
      const params = {};
      if (selectedGroup !== 'all') {
        params.group = selectedGroup;
      }
      if (selectedLevel !== 'all') {
        params.level = selectedLevel;
      }
      
      const { data } = await api.get('/users/unallocated', { params });
      
      if (data.ok) {
        setUnallocatedUsers(data.users);
        toast.success('User list refreshed');
      } else {
        toast.error(data.message || 'Failed to refresh users');
      }
    } catch (error) {
      console.error('Error refreshing unallocated users:', error);
      toast.error('Failed to refresh users');
    } finally {
      setUsersLoading(false);
    }
  };
  
  // Close popup without allocating
  const closeUserPopup = () => {
    // Play a UI sound
    audio.play('/assets/sounds/click-sound.mp3', { volume: 0.2 });
    
    // First close the popup
    setShowUserPopup(false);
    
    // Delay clearing the selected user to avoid flickering
    setTimeout(() => {
      setSelectedUser(null);
      setShowConfetti(false);
    }, 300);
  };

  // Is room at capacity
  const isRoomFull = rooms[currentRoomIndex] && 
    rooms[currentRoomIndex].allocatedPersons && 
    rooms[currentRoomIndex].allocatedPersons.length >= rooms[currentRoomIndex].capacity;

  return {
    // State
    rooms,
    currentRoomIndex,
    floors,
    currentFloor,
    loading,
    selectedGroup,
    selectedLevel,
    unallocatedUsers,
    usersLoading,
    allocatedUsersMap,
    filteredUsers,
    isSelecting,
    selectionComplete,
    selectedUser,
    showConfetti,
    showUserPopup,
    windowSize,
    isRoomFull,
    currentRoom: rooms[currentRoomIndex] || null,
    
    // Methods
    setSelectedGroup,
    setSelectedLevel,
    handleUserSelected,
    startUserSelection,
    goToNextRoom,
    goToPreviousRoom,
    closeSelection,
    allocateSelectedUser,
    loadUnallocatedUsers,
    closeUserPopup,
    setCurrentFloor
  };
};

export default useRoomAllocationState; 
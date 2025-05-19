import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import useAudio from '../../hooks/useAudio';

const UserSelectionController = ({ 
  filteredUsers,
  currentRoom,
  onUserSelected,
  isRoomFull
}) => {
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [rouletteData, setRouletteData] = useState([]);
  const [startRoulette, setStartRoulette] = useState(false);
  const audio = useAudio();
  const selectionInProgress = useRef(false);

  // Function to get a truly random index
  const getRandomIndex = (array) => {
    if (!array || array.length === 0) return -1;
    
    // Use crypto for better randomness if available
    if (window.crypto && window.crypto.getRandomValues) {
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      return Math.floor(randomBuffer[0] / (0xffffffff + 1) * array.length);
    }
    
    // Fallback to Math.random
    return Math.floor(Math.random() * array.length);
  };
  
  // Convert users to roulette data format
  const prepareRouletteData = (users) => {
    if (!users || users.length === 0) return [];
    
    // Ensure we have at least 10 prizes for a good spin
    let data = users.map((user, index) => ({
      id: user._id,
      image: user.photo || 'https://via.placeholder.com/80',
      text: user.name,
      userData: user
    }));
    
    // If we have less than 10 users, repeat them to get a good spin
    if (data.length < 10) {
      const multiplier = Math.ceil(10 / data.length);
      const repeatedData = [];
      
      for (let i = 0; i < multiplier; i++) {
        data.forEach(item => {
          repeatedData.push({
            ...item,
            id: `${item.id}-${i}`, // To ensure unique IDs
            originalId: item.id
          });
        });
      }
      
      data = repeatedData;
    }
    
    return data;
  };

  // Start the random user selection
  const startRandomSelection = () => {
    // Prevent multiple selections
    if (selectionInProgress.current) {
      return;
    }
    
    // Check if we have users to select
    if (filteredUsers.length === 0) {
      console.error('No filtered users available');
      toast.error('No users available for selection');
      return;
    }
    
    // Check if room is full
    if (isRoomFull) {
      console.error('Room at capacity');
      toast.error('Room is at full capacity');
      return;
    }
    
    selectionInProgress.current = true;
    
    // Prepare roulette data
    const data = prepareRouletteData(filteredUsers);
    setRouletteData(data);
    
    // Get a truly random index
    const randomIndex = getRandomIndex(filteredUsers);
    setPrizeIndex(randomIndex);
    
    console.log('Selected random prize index:', randomIndex, 'for user:', filteredUsers[randomIndex]?.name);
    
    // Play spinning sound
    audio.play('/assets/sounds/wheel-spinning.mp3', {
      volume: 0.3,
      loop: true
    });
    
    console.log('Starting roulette with', data.length, 'entries, prize index:', randomIndex);
    
    // Start the roulette
    setStartRoulette(true);
    
    // After 6 seconds (just after the roulette should have stopped), trigger the user selection directly
    setTimeout(() => {
      if (filteredUsers[randomIndex]) {
        console.log('Timeout triggered - selecting user:', filteredUsers[randomIndex].name);
        console.log('User data:', filteredUsers[randomIndex]);
        
        // Stop audio
        audio.stop();
        
        // Play success sound
        audio.play('/assets/sounds/win-sound.mp3', { volume: 0.5 });
        
        // Show the selected user
        onUserSelected(filteredUsers[randomIndex]);
        setStartRoulette(false);
        selectionInProgress.current = false;
      } else {
        console.error('No user found at index:', randomIndex);
        toast.error('Error selecting user');
        selectionInProgress.current = false;
      }
    }, 6000); // 6 seconds, allowing the 5-second spin to complete first
  };

  return {
    startRandomSelection,
    rouletteData,
    prizeIndex,
    startRoulette,
    selectionInProgress: selectionInProgress.current
  };
};

export default UserSelectionController; 
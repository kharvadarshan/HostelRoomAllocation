import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { FiUsers } from 'react-icons/fi';
import Roulette from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import { useTheme } from '@/hooks/useTheme.js';
import useAudio from '../../hooks/useAudio';
import { toast } from 'react-hot-toast';

const UserSelectionEnhanced = ({
  isSelecting,
  selectionComplete,
  filteredUsers,
  currentRoom,
  startUserSelection,
  onUserSelected,
  usersLoading
}) => {
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [rouletteStart, setRouletteStart] = useState(false);
  const [rouletteData, setRouletteData] = useState([]);
  const { isDarkMode } = useTheme();
  const audio = useAudio();
  const selectionInProgress = useRef(false);

  // Set up roulette data when selection starts
  useEffect(() => {
    console.log("Selection state:", { isSelecting, selectionComplete, filteredUsersCount: filteredUsers?.length });
    
    if (isSelecting && !selectionComplete && filteredUsers.length > 0) {
      // Don't start if already in progress
      if (selectionInProgress.current) return;
      
      selectionInProgress.current = true;
      
      // Create a ref to track if selection has been made by handlePrizeDetermined
      const selectionMade = { current: false };
      
      // Get random prize index
      const randomIndex = getRandomIndex(filteredUsers);
      console.log("--------------------------Random index:", { randomIndex });
      setPrizeIndex(randomIndex);
      console.log('Selected random prize index:', randomIndex, 'for user:', filteredUsers[randomIndex].name);
      
      // Prepare the roulette data
      const data = prepareRouletteData(filteredUsers);
      setRouletteData(data);
      console.log('Prepared roulette data with', data.length, 'items');
      
      // Play spinning sound
      audio.play('/assets/sounds/wheel-spinning.mp3', {
        volume: 0.3,
        loop: true
      });
      
      // Start roulette after a small delay
      setTimeout(() => {
        console.log('Starting roulette animation');
        setRouletteStart(true);
      }, 100);
      
      // Schedule selection completion (fallback in case handlePrizeDetermined doesn't fire)
      setTimeout(() => {
        // Skip if selection was already made by handlePrizeDetermined
        if (selectionInProgress.current && !selectionComplete) {
          console.log('Fallback timeout triggered - handlePrizeDetermined may not have fired');
          
          if (filteredUsers[randomIndex]) {
            console.log('Selection timeout triggered - selecting user:', filteredUsers[randomIndex].name);
            
            // Stop spinning audio
            audio.stop();
            
            // Play success sound
            audio.play('/assets/sounds/win-sound.mp3', { volume: 0.5 });
            
            // Show the selected user
            onUserSelected(filteredUsers[randomIndex]);
          }
          
          // Reset state
          setRouletteStart(false);
          selectionInProgress.current = false;
        }
      }, 8000); // Extended to 8 seconds to ensure the roulette has time to complete
    } else if (!isSelecting) {
      // Reset when selection is cancelled or completed
      setRouletteStart(false);
      selectionInProgress.current = false;
    }
  }, [isSelecting, selectionComplete, filteredUsers, audio, onUserSelected]);

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

  // Convert users data to roulette format
  const prepareRouletteData = (users) => {
    if (!users || users.length === 0) return [];
    
    // Ensure we have at least 10 prizes for a good spin
    let data = users.map((user) => ({
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

  // Handle prize determined event
  const handlePrizeDetermined = () => {
    console.log('Prize determined from roulette component!', { prizeIndex });
    
    // If we have a valid prize index and users
    if (prizeIndex >= 0 && filteredUsers && filteredUsers.length > 0 && prizeIndex < filteredUsers.length) {
      const selectedUser = filteredUsers[prizeIndex];
      console.log('Winner selected by roulette:', selectedUser.name);
      
      // Stop spinning audio
      audio.stop();
      
      // Play success sound
      audio.play('/assets/sounds/win-sound.mp3', { volume: 0.5 });
      
      // Show full screen animation with selected user (with a slight delay for effect)
      setTimeout(() => {
        // Show the selected user with confetti animation
        onUserSelected(selectedUser);
        
        // Reset roulette state
        setRouletteStart(false);
        selectionInProgress.current = false;
      }, 500);
    }
  };

  // Roulette settings
  const rouletteSettings = {
    start: rouletteStart,
    prizes: rouletteData,
    prizeIndex,
    defaultDesignOptions: {
      prizeShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
      prizeItemBackground: isDarkMode ? '#2a2a2a' : '#ffffff',
      prizeItemTextColor: isDarkMode ? '#ffffff' : '#000000',
    },
    options: {
      stopInCenter: true,
      withoutAnimation: false,
      soundWhileSpinning: false, // Disable built-in sounds as we use our own custom audio
      spinningTime: 7, // Keep at 7 seconds to match our timeout
      generateId: true,
    },
    designOptions: {
      prizeShadowWidth: 30,
      prizeShadowOpacity: 0.3,
      prizeItemWidth: 90,
      prizeItemHeight: 90,
    },
    spinningTime: 7,
    onPrizeDetermined: handlePrizeDetermined,
  };
  
  // Custom styles for roulette
  const rouletteStyles = {
    wrapper: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      width: '100%',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    prize: {
      border: `3px solid ${isDarkMode ? '#3a86ff' : '#4361ee'}`,
      borderRadius: '50%',
      boxShadow: `0 0 10px ${isDarkMode ? 'rgba(61, 134, 255, 0.5)' : 'rgba(67, 97, 238, 0.5)'}`,
      overflow: 'hidden',
      position: 'relative',
    },
    prizeImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
    },
    prizeName: {
      position: 'absolute',
      bottom: '-24px',
      left: '0',
      right: '0',
      textAlign: 'center',
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      color: isDarkMode ? '#fff' : '#000',
      padding: '2px 0',
      fontSize: '10px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  // Begin selection process
  const handleStartSelection = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users available for selection');
      return;
    }
    
    if (currentRoom?.allocatedPersons?.length >= currentRoom?.capacity) {
      toast.error('Room is at full capacity');
      return;
    }
    
    if (selectionInProgress.current) {
      return;
    }
    
    startUserSelection();
  };

  return (
    <div className="flex flex-col items-center">
      {/* User Selection Roulette */}
      {isSelecting && !selectionComplete && (
        <div className="w-full my-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Selecting random user...
          </h3>
          
          <div className="max-w-2xl mx-auto">
            <Roulette
              {...rouletteSettings}
              className="custom-roulette"
              style={rouletteStyles}
            />
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              The wheel will stop automatically after spinning...
            </p>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          onClick={handleStartSelection}
          disabled={
            !filteredUsers.length || 
            isSelecting || 
            selectionInProgress.current ||
            (currentRoom?.allocatedPersons?.length >= currentRoom?.capacity)
          }
          icon={<FiUsers />}
          size="lg"
        >
          {isSelecting && !selectionComplete ? 'Selecting...' : 'Select Random User'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-3">
        {filteredUsers.length} unallocated {filteredUsers.length === 1 ? 'user' : 'users'} available
        {currentRoom?.capacity && currentRoom?.allocatedPersons && (
          <span> • Room capacity: {currentRoom.allocatedPersons.length}/{currentRoom.capacity}</span>
        )}
      </p>
    </div>
  );
};

export default UserSelectionEnhanced; 
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FiUsers } from 'react-icons/fi';
import RoulettePro from 'react-roulette-pro';
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
  const selectionComplete_ref = useRef(false);

  // Set up roulette data when selection starts
  useEffect(() => {
    
    if (isSelecting && !selectionComplete && filteredUsers.length > 0) {
      // Don't start if already in progress
      if (selectionInProgress.current) return;
      
      // Reset selection state
      selectionInProgress.current = true;
      selectionComplete_ref.current = false;
      
      // Get random prize index
      const randomIndex = getRandomIndex(filteredUsers);
      console.log("--------------------------Random index:", { randomIndex });
      setPrizeIndex(randomIndex);

      // Prepare the roulette data
      const data = prepareRouletteData(filteredUsers);
      
      // Make sure we have valid data
      if (!data.length) {
        console.error('Failed to prepare roulette data');
        toast.error('Error preparing selection wheel');
        setIsSelecting(false);
        selectionInProgress.current = false;
        return;
      }
      
      setRouletteData(data);
      
      // Play spinning sound
      audio.play('/assets/sounds/wheel-spinning.mp3', {
        volume: 0.3,
        loop: true
      });
      
      // Start roulette after a small delay
      setTimeout(() => {
        setRouletteStart(true);
      }, 100);
      
      // Schedule selection completion (fallback in case handlePrizeDefined doesn't fire)
      setTimeout(() => {
        // Skip if selection was already made by handlePrizeDefined
        if (selectionInProgress.current && !selectionComplete_ref.current) {
          console.log('Fallback timeout triggered - handlePrizeDefined may not have fired');
          
          if (filteredUsers[randomIndex]) {
            console.log('Selection timeout triggered - selecting user:', filteredUsers[randomIndex]?.name);
            
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
        } else {
          console.log('Skipping fallback timeout - selection already complete');
        }
      }, 8000); // Extended to 8 seconds to ensure the roulette has time to complete
    } else if (!isSelecting) {
      // Reset when selection is cancelled or completed
      setRouletteStart(false);
      selectionInProgress.current = false;
      selectionComplete_ref.current = false;
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
    
    // Generate a unique ID
    const generateId = () => {
      return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;
    };
    
    // Ensure we have at least 10 prizes for a good spin
    let data = users.map((user) => ({
      id: user._id || generateId(),
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
  const handlePrizeDefined = () => {
    
    // Mark that selection is complete to prevent the fallback timeout
    selectionComplete_ref.current = true;
    
    // If we have a valid prize index and users
    if (prizeIndex >= 0 && filteredUsers && filteredUsers.length > 0 && prizeIndex < filteredUsers.length) {
      const selectedUser = filteredUsers[prizeIndex];
      
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
    prizes: rouletteData,
    prizeIndex: prizeIndex,
    start: rouletteStart,
    spinningTime: 7,
    onPrizeDefined: handlePrizeDefined,
    stopInCenter: true, 
    soundWhileSpinning: false,
    withoutAnimation: false,
    designOptions: {
      prizeShadowWidth: 30,
      prizeShadowOpacity: 0.3,
      prizeItemWidth: 90,
      prizeItemHeight: 90,
      prizeShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
      prizeItemBackground: isDarkMode ? '#2a2a2a' : '#ffffff',
      prizeItemTextColor: isDarkMode ? '#ffffff' : '#000000',
    }
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
            <RoulettePro
              {...rouletteSettings}
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
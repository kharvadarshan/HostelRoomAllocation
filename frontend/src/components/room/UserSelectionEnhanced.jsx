import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FiUsers } from 'react-icons/fi';
import Roulette from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import { useTheme } from '../../hooks/useTheme';
import UserSelectionController from './UserSelectionController';

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
  const [localIsSelecting, setLocalIsSelecting] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Get the user selection controller hook
  const controller = UserSelectionController({
    filteredUsers,
    currentRoom,
    onUserSelected,
    isRoomFull: currentRoom?.allocatedPersons?.length >= currentRoom?.capacity
  });

  // Handle the button click to start selection
  const handleStartSelection = useCallback(() => {
    // First call the parent's startUserSelection to update global state
    startUserSelection();
    
    // Then start the local roulette selection
    setLocalIsSelecting(true);
    
    // Use the controller to handle the selection logic
    controller.startRandomSelection();
  }, [startUserSelection, controller, setLocalIsSelecting]);

  // Set up roulette data when selection starts
  useEffect(() => {
    if ((isSelecting || localIsSelecting) && !selectionComplete && filteredUsers.length > 0) {
      // Prepare the roulette data
      const data = prepareRouletteData(filteredUsers);
      setRouletteData(data);
      
      // Get random prize index
      const randomIndex = Math.floor(Math.random() * filteredUsers.length);
      setPrizeIndex(randomIndex);
      
      // Start roulette after a small delay
      setTimeout(() => {
        setRouletteStart(true);
      }, 100);
    } else {
      setRouletteStart(false);
    }
  }, [isSelecting, localIsSelecting, selectionComplete, filteredUsers]);

  // Reset local selection state when parent selection state changes
  useEffect(() => {
    if (!isSelecting) {
      setLocalIsSelecting(false);
    }
  }, [isSelecting]);

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
      soundWhileSpinning: false,
      spinningTime: 5, // 5 seconds spin
      generateId: true,
    },
    designOptions: {
      prizeShadowWidth: 30,
      prizeShadowOpacity: 0.3,
      prizeItemWidth: 90,
      prizeItemHeight: 90,
    },
    spinningTime: 5
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

  // Error boundary component for Roulette
  const ErrorBoundaryRoulette = ({ rouletteSettings, rouletteStyles }) => {
    try {
      return (
        <Roulette
          {...rouletteSettings}
          className="custom-roulette"
          style={rouletteStyles}
        />
      );
    } catch (error) {
      console.error('Error rendering Roulette:', error);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-500">Error rendering roulette. Please try again.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* User Selection Roulette */}
      {(isSelecting || localIsSelecting) && !selectionComplete && (
        <div className="w-full my-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Selecting random user...
          </h3>
          
          <div className="max-w-2xl mx-auto">
            <ErrorBoundaryRoulette
              rouletteSettings={rouletteSettings}
              rouletteStyles={rouletteStyles}
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          onClick={handleStartSelection}
          disabled={
            !filteredUsers.length || 
            isSelecting || 
            localIsSelecting ||
            (currentRoom?.allocatedPersons?.length >= currentRoom?.capacity)
          }
          icon={<FiUsers />}
          size="lg"
        >
          {(isSelecting || localIsSelecting) && !selectionComplete ? 'Selecting...' : 'Select Random User'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-3">
        {filteredUsers.length} unallocated {filteredUsers.length === 1 ? 'user' : 'users'} available
      </p>
    </div>
  );
};

export default UserSelectionEnhanced; 
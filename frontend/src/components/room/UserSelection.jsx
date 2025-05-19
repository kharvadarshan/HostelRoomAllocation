import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FiChevronRight, FiUsers } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useTheme } from '@/hooks/useTheme.js';
import Roulette from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import React from 'react';

const UserSelection = ({
  isSelecting,
  selectionComplete,
  filteredUsers,
  currentRoom,
  selectedUser,
  closeSelection,
  goToNextRoom,
  startUserSelection,
  usersLoading,
  showConfetti,
  windowSize
}) => {
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [rouletteStart, setRouletteStart] = useState(false);
  const [rouletteData, setRouletteData] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { isDarkMode } = useTheme();
  const hasDispatchedEvent = useRef(false);
  const audioRef = useRef(null);

  // Logging props for debugging
  useEffect(() => {
    console.log('UserSelection props updated:', { 
      isSelecting, 
      selectionComplete, 
      filteredUsersCount: filteredUsers?.length,
      hasCurrentRoom: !!currentRoom,
      hasSelectedUser: !!selectedUser
    });
  }, [isSelecting, selectionComplete, filteredUsers, currentRoom, selectedUser]);

  // Set up roulette data when selection starts
  useEffect(() => {
    console.log('Selection state changed:', { isSelecting, selectionComplete, filteredUsersLength: filteredUsers?.length });
    
    if (isSelecting && !selectionComplete && filteredUsers.length > 0) {
      const newPrizeIndex = Math.floor(Math.random() * filteredUsers.length);
      console.log('Setting new prize index:', newPrizeIndex, 'out of', filteredUsers.length);
      setPrizeIndex(newPrizeIndex);
      
      // Convert users to roulette data format
      const data = prepareRouletteData(filteredUsers);
      console.log('Prepared roulette data with', data.length, 'items');
      setRouletteData(data);
      setIsDataReady(true);
      
      // Reset state
      hasDispatchedEvent.current = false;
      
      // Delay the start of roulette animation
      console.log('Setting up timeout to start roulette');
      setTimeout(() => {
        console.log('Starting roulette now');
        setRouletteStart(true);
        
        // Play spinning sound if available
        try {
          const audio = new Audio('/assets/sounds/wheel-spinning.mp3');
          audio.volume = 0.3;
          audio.loop = true;
          audio.play().catch(e => {
            console.log('Audio play failed, continuing without sound:', e);
          });
          audioRef.current = audio;
        } catch (error) {
          console.log('Sound not available, continuing without audio:', error);
        }
      }, 100); // Reduced delay to start spinning faster
    } else {
      console.log('Not starting selection process. Conditions not met:', {
        isSelecting,
        notSelectionComplete: !selectionComplete,
        hasFilteredUsers: filteredUsers.length > 0
      });
    }
    
    // Clean up audio on unmount or when selection stops
    return () => {
      if (audioRef.current) {
        console.log('Cleaning up audio');
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isSelecting, selectionComplete, filteredUsers]);

  // Observe selection complete state change
  useEffect(() => {
    if (selectionComplete && selectedUser) {
      console.log('Selection completed with user:', selectedUser.name);
      
      // Clean up any audio still playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [selectionComplete, selectedUser]);

  // Add effect to monitor rouletteStart state
  useEffect(() => {
    console.log('Roulette start state changed:', rouletteStart);
  }, [rouletteStart]);

  // Convert users data to roulette format
  const prepareRouletteData = (users) => {
    console.log('Preparing roulette data from', users.length, 'users');
    
    // Ensure we have at least 10 prizes for a good spin
    let data = users.map((user, index) => ({
      id: user._id,
      image: user.photo || 'https://via.placeholder.com/80',
      text: user.name,
      index,
      userData: user
    }));
    
    console.log('Initial data mapping:', data.length, 'items');
    
    // If we have less than 10 users, repeat them to get a good spin
    if (data.length < 10) {
      const multiplier = Math.ceil(10 / data.length);
      console.log('Need to repeat data, multiplier:', multiplier);
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
      console.log('After repeating, data has', data.length, 'items');
    }
    
    return data;
  };

  // Handle when the roulette stops
  const handlePrizeDetermined = () => {
    console.log('Prize determined from roulette component!', { prizeIndex, dataLength: rouletteData.length });
    
    // We're now using the timeout-based approach in the parent component,
    // so this handler is mainly for logging and cleanup
    
    // Stop spinning sound
    if (audioRef.current) {
      console.log('Stopping audio in handlePrizeDetermined');
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Log the winning prize details for debugging
    if (rouletteData.length > 0) {
      const winningPrize = rouletteData[prizeIndex];
      console.log('Roulette winning prize:', winningPrize);
      
      if (!hasDispatchedEvent.current) {
        console.log('Not dispatching event - using timeout-based selection instead');
      }
    } else {
      console.log('Cannot determine winner: rouletteData.length =', rouletteData.length);
    }
  };

  // Roulette prize mapping
  const prizes = rouletteData;

  // Roulette settings for a smooth, slower animation
  const rouletteSettings = {
    start: rouletteStart,
    prizes,
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
      spinningTime: 5, // Keep at 5 seconds to match our 6-second timeout
      generateId: true,
    },
    designOptions: {
      prizeShadowWidth: 30,
      prizeShadowOpacity: 0.3,
      prizeItemWidth: 90,
      prizeItemHeight: 90,
    },
    spinningTime: 5, // Keep consistent with options.spinningTime
    onPrizeDetermined: handlePrizeDetermined,
  };

  // Custom styles for roulette component
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

  return (
    <div className="flex flex-col items-center">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={6000}
        />
      )}
      
      {/* User Selection Roulette */}
      {isSelecting && !selectionComplete && isDataReady && (
        <div className="w-full my-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Selecting random user...
          </h3>
          
          <div className="max-w-2xl mx-auto">
            {console.log('Rendering Roulette with settings:', {
              start: rouletteStart,
              prizeIndex,
              prizesLength: prizes.length,
              spinningTime: rouletteSettings.spinningTime
            })}
            
            <ErrorBoundaryRoulette
              rouletteSettings={rouletteSettings}
              rouletteStyles={rouletteStyles}
            />
          </div>
        </div>
      )}
      
      {/* Selected User Display */}
      <AnimatePresence>
        {selectionComplete && selectedUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            {/* Dark overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={closeSelection}
            />
            
            <motion.div 
              className="w-full max-w-lg bg-primary-800 dark:bg-gray-900 p-10 rounded-xl shadow-2xl relative z-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="relative">
                <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-6 border-primary-200 shadow-2xl mb-6">
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
                
                {/* Celebration emoji */}
                <div className="absolute -top-6 -left-6 text-6xl animate-bounce delay-300">🎉</div>
              </div>
              
              <h3 className="text-3xl font-bold text-center text-white mb-3">{selectedUser.name}</h3>
              <p className="text-xl text-center text-primary-300 mb-5">{selectedUser.field}</p>
              
              <div className="text-center space-y-3">
                <span className="inline-block bg-primary-700 text-white text-lg px-4 py-2 rounded-full">
                  {selectedUser.mobile}
                </span>
                
                <div className="flex justify-center gap-3 mt-3">
                  {selectedUser.group && (
                    <span className="inline-block bg-secondary-800 dark:bg-secondary-900 text-white text-lg px-4 py-2 rounded-full">
                      {selectedUser.group}
                    </span>
                  )}
                  
                  {selectedUser.level && (
                    <span className="inline-block bg-primary-700 text-white text-lg px-4 py-2 rounded-full">
                      Level {selectedUser.level}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center space-x-6 mt-8">
                <Button
                  onClick={closeSelection}
                  variant="outline"
                  className="bg-white text-primary-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 text-lg px-6 py-3"
                  size="lg"
                >
                  Close
                </Button>
                
                <Button
                  onClick={goToNextRoom}
                  className="bg-primary-500 text-white hover:bg-primary-600 text-lg px-6 py-3"
                  icon={<FiChevronRight />}
                  size="lg"
                >
                  Next Room
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex gap-4">
        <Button
          onClick={startUserSelection}
          disabled={!filteredUsers.length || isSelecting || (currentRoom?.allocatedPersons?.length >= currentRoom?.capacity)}
          icon={<FiUsers />}
          size="lg"
        >
          {isSelecting && !selectionComplete ? 'Selecting...' : 'Select Random User'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-3">
        {filteredUsers.length} unallocated {filteredUsers.length === 1 ? 'user' : 'users'} available
      </p>
    </div>
  );
};

// Error boundary component for Roulette
class ErrorBoundaryRoulette extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in Roulette component:', error, errorInfo);
  }

  render() {
    const { rouletteSettings, rouletteStyles } = this.props;
    
    if (this.state.hasError) {
      console.error('Rendering fallback due to error:', this.state.error);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-500">Error rendering roulette. Please try again.</p>
          <pre className="mt-2 text-xs overflow-auto">{this.state.error?.message}</pre>
        </div>
      );
    }

    try {
      return (
        <Roulette
          {...rouletteSettings}
          className="custom-roulette"
          style={rouletteStyles}
        />
      );
    } catch (error) {
      console.error('Caught error while rendering Roulette:', error);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-500">Failed to initialize roulette.</p>
        </div>
      );
    }
  }
}

export default UserSelection; 
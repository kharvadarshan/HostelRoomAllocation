import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FiChevronRight, FiUsers } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useTheme } from '../../hooks/useTheme';

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
  const [carouselUsers, setCarouselUsers] = useState([]);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const animationFrameRef = useRef(null);
  const carouselRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [animationProgress, setAnimationProgress] = useState(0);
  const startTimeRef = useRef(null);
  const [localSelectionComplete, setLocalSelectionComplete] = useState(false);
  const hasDispatchedEvent = useRef(false);
  const pauseTimeoutRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const pausedUserIndexRef = useRef(-1);

  // Set up carousel users when selection starts
  useEffect(() => {
    if (isSelecting && !selectionComplete && filteredUsers.length > 0) {
      // Create a carousel of users (original users repeated to make it seem infinite)
      const usersForCarousel = [
        ...filteredUsers.slice(Math.max(0, filteredUsers.length - 5)), 
        ...filteredUsers, 
        ...filteredUsers.slice(0, 5)
      ];
      setCarouselUsers(usersForCarousel);
      setCarouselPosition(0);
      setAnimationProgress(0);
      setLocalSelectionComplete(false);
      setIsPaused(false);
      pausedUserIndexRef.current = -1;
      hasDispatchedEvent.current = false;
      startTimeRef.current = Date.now();
      
      // Start the animation immediately
      startAnimation();
    }
  }, [isSelecting, selectionComplete, filteredUsers]);

  // Clean up on unmount or when selection completes
  useEffect(() => {
    if ((selectionComplete || localSelectionComplete) && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [selectionComplete, localSelectionComplete]);

  // Handle selection completion
  useEffect(() => {
    if (localSelectionComplete && !selectionComplete && !hasDispatchedEvent.current) {
      // When animation completes, notify parent component by triggering user selection
      const selectedUserIndex = selectionIndex % filteredUsers.length;
      const finalUser = filteredUsers[selectedUserIndex];
      
      // Prevent multiple event dispatches
      hasDispatchedEvent.current = true;
      
      // Check if the room is already at capacity before trying to allocate
      if (currentRoom && currentRoom.allocatedPersons && 
          currentRoom.allocatedPersons.length >= currentRoom.capacity) {
        // Skip allocation if room is full
        console.log('Room is already at capacity, not allocating user');
        return;
      }
      
      // Call closeSelection with the selected user
      // This simulates clicking the selection button with the final user
      if (finalUser) {
        const selectEvent = new CustomEvent('userSelected', { 
          detail: { user: finalUser, index: selectedUserIndex } 
        });
        window.dispatchEvent(selectEvent);
      }
    }
  }, [localSelectionComplete, selectionComplete, selectionIndex, filteredUsers, currentRoom]);

  // Animation function using requestAnimationFrame for smooth animation
  const startAnimation = () => {
    const totalDuration = 4000; // 4 seconds total animation
    const initialSpeed = 70; // Initial speed (pixels per frame) - faster start
    const minSpeed = 2; // Minimum speed at the end - slower finish
    
    const animate = () => {
      // Skip animation if paused
      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);
      setAnimationProgress(progress);
      
      // Calculate current speed using easing (fast start, slow finish)
      // Cubic ease-out for more dramatic slowdown
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentSpeed = initialSpeed * (1 - easedProgress) + minSpeed;
      
      // Move the carousel
      setCarouselPosition(prevPosition => {
        const newPosition = prevPosition + currentSpeed;
        
        // Calculate which user is centered
        const centerPosition = window.innerWidth / 2;
        const itemWidth = 140; // Width of each item plus margin
        const index = Math.floor((newPosition + centerPosition) / itemWidth) % filteredUsers.length;
        
        // Only update the index if it changed to avoid unnecessary re-renders
        if (index !== selectionIndex) {
          setSelectionIndex(index);
          
          // If we've changed index, pause briefly on this user (if not near the end)
          if (progress < 0.7 && index !== pausedUserIndexRef.current) {
            pausedUserIndexRef.current = index;
            setIsPaused(true);
            
            // Resume after 500ms
            pauseTimeoutRef.current = setTimeout(() => {
              setIsPaused(false);
            }, 500);
          }
        }
        
        return newPosition;
      });
      
      // Continue the animation if not complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation is complete
        setLocalSelectionComplete(true);
      }
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
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
      
      {/* User Selection Carousel with Prize Wheel effect */}
      {isSelecting && !selectionComplete && carouselUsers.length > 0 && (
        <div className="w-full my-8 relative">
          {/* Pin indicator - now pointing up instead of down */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600 z-20" />
          
          {/* Carousel window with partial visibility */}
          <div className="mx-auto relative max-w-xl overflow-hidden" style={{ height: '180px' }}>
            <div 
              className="flex items-center transition-transform absolute"
              style={{ transform: `translateX(-${carouselPosition}px)` }}
              ref={carouselRef}
            >
              {carouselUsers.map((user, index) => {
                const isSelected = index % filteredUsers.length === selectionIndex;
                return (
                  <div 
                    key={`carousel-${index}`}
                    className={`flex-shrink-0 w-[140px] mx-3 transform transition-all duration-300 ${
                      isSelected 
                        ? 'scale-110 z-10' 
                        : 'scale-90 opacity-70'
                    }`}
                  >
                    <div 
                      className={`relative rounded-full overflow-hidden border-4 h-[140px] ${
                        isSelected 
                          ? 'border-red-500 shadow-xl' 
                          : 'border-gray-300'
                      }`}
                    >
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <motion.div 
                          className="absolute inset-0 bg-red-500 mix-blend-overlay"
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity
                          }}
                        />
                      )}
                    </div>
                    <p className="text-center text-sm mt-2 truncate">{user.name}</p>
                    {isSelected && isPaused && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0 -right-4 w-8 h-8 bg-primary-500 rounded-full text-white flex items-center justify-center"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
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
                {/*<div className="absolute -top-6 -right-6 text-6xl animate-bounce">🎉</div>*/}
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

export default UserSelection; 
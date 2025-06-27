import React, {useEffect, useState, useRef} from 'react';
import {motion} from 'framer-motion';
import Confetti from 'react-confetti';
import {FiCheck, FiLayers, FiUsers} from 'react-icons/fi';
import Modal from '../ui/Modal';
import {Button} from '../ui/Button';
import ScratchCard from 'react-scratchcard-v2';
import ConfettiBoom from 'react-confetti-boom';

const UserSelectionModal = ({isOpen, onClose, user, onConfirm}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const scratchCardRef = useRef(null);

  // Set up window size for confetti
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setIsRevealed(false);
      setShowConfetti(false);
    }
  }, [isOpen, user]);

  const handleScratchComplete = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      // Show confetti animation after revealing
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
    }
  };

  if (!user) {
    return null;
  }

  // For the scratch card background - we'll use a solid color
  const scratchCardImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    // Create a gradient
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#9333ea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Add text
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal!', 150, 150);
    
    return canvas.toDataURL();
  };

  return (
      <>
        {showConfetti && (
            <ConfettiBoom
                mode="fall"
                duration={3000}
                particleCount={200}
                colors={['#4f46e5', '#9333ea', '#ec4899', '#f97316', '#eab308']}
                className="z-50"
            />
        )}

        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-2xl"
            showCloseButton={true}
        >
          <div className="p-6 sm:p-8 z-40">
            <div className="relative flex flex-col items-center">
              {!isRevealed ? (
                <div className="w-64 h-64 mx-auto mb-6">
                  <ScratchCard
                    ref={scratchCardRef}
                    width={300}
                    height={300}
                    willReadFrequently={true}
                    image={scratchCardImage()}
                    finishPercent={50}
                    onComplete={handleScratchComplete}
                    brushSize={30}
                    fadeOutOnComplete={true}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={user.photo || 'https://via.placeholder.com/300'}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </ScratchCard>
                  <p className="text-center mt-3 text-gray-600">
                    Scratch to reveal the user!
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden border-6 border-primary-200 shadow-2xl mb-6">
                    <img
                        src={user.photo || 'https://via.placeholder.com/150'}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading user photo:', e);
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                  </div>
                  <motion.div
                      className="absolute inset-0 bg-primary-500 mix-blend-overlay rounded-full"
                      animate={{
                        opacity: [0, 0.2, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                  />

                  {/* Celebration emoji */}
                  <div className="absolute -top-6 -left-6 text-6xl animate-bounce delay-300">🎉</div>

                  <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">{user.name}</h3>
                  <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-5">{user.field}</p>

                  <div className="flex justify-center gap-3 flex-wrap">
                    {user.group && (
                        <span
                            className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-lg px-4 py-2 rounded-full">
                      <FiUsers className="inline mr-1"/>
                          {user.group}
                    </span>
                    )}

                    {/*{user.level && (*/}
                    {/*    <span*/}
                    {/*        className="inline-block bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 text-lg px-4 py-2 rounded-full">*/}
                    {/*  <FiLayers className="inline mr-1"/>*/}
                    {/*  Level {user.level}*/}
                    {/*</span>*/}
                    {/*)}*/}

                    {user.mobile && (
                        <span
                            className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-lg px-4 py-2 rounded-full">
                      {user.mobile}
                    </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {isRevealed && (
              <div className="flex justify-center mt-8">
                <Button
                    onClick={() => {
                      console.log('Confirm button clicked');
                      setShowConfetti(false);
                      onConfirm();
                    }}
                    size="lg"
                    className="px-10 py-3 text-lg"
                    icon={<FiCheck/>}
                >
                  Confirm Allocation
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </>
  );
};

export default UserSelectionModal; 
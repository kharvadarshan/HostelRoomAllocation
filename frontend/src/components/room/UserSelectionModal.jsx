import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import Confetti from 'react-confetti';
import {FiCheck, FiLayers, FiUsers} from 'react-icons/fi';
import Modal from '../ui/Modal';
import {Button} from '../ui/Button';

const UserSelectionModal = ({isOpen, onClose, user, onConfirm}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

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

  // Show confetti effect when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Slight delay to ensure modal is fully rendered before showing confetti
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
  }, [isOpen, user, showConfetti]);

  if (!user) {
    return null;
  }

  return (
      <>
        {showConfetti && (
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={300}
                tweenDuration={6000}
            />
        )}

        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-2xl"
            showCloseButton={false}
        >
          <div className="p-8 sm:p-10">
            <div className="relative">
              <div
                  className="w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden border-6 border-primary-200 shadow-2xl mb-6">
                <img
                    src={user.photo}
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
              <div
                  className="absolute -top-6 -left-6 text-6xl animate-bounce delay-300">🎉
              </div>
              <div
                  className="absolute -top-6 -right-6 text-6xl animate-bounce">🎊
              </div>
            </div>

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

              {user.level && (
                  <span
                      className="inline-block bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 text-lg px-4 py-2 rounded-full">
                <FiLayers className="inline mr-1"/>
                Level {user.level}
              </span>
              )}

              {user.mobile && (
                  <span
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-lg px-4 py-2 rounded-full">
                {user.mobile}
              </span>
              )}
            </div>

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
          </div>
        </Modal>
      </>
  );
};

export default UserSelectionModal; 
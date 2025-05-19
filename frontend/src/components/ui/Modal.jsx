import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/**
 * Reusable modal component with animation effects
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  width = 'max-w-lg',
  showCloseButton = true,
  backdropColor = 'bg-black/80',
  preventBackdropClose = false
}) => {
  const handleBackdropClick = (e) => {
    if (!preventBackdropClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 ${backdropColor} flex items-center justify-center z-50 p-4 overflow-auto`}
          onClick={handleBackdropClick}
        >
          <motion.div 
            className={`${width} w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative z-10`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
            
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 
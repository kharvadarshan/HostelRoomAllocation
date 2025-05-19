import React from 'react';
import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

const ScratchCardGrid = ({ users, onCardSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-500 italic">No unallocated users available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-6">
      {users.map((user) => (
        <motion.div
          key={user._id}
          className="bg-gray-50 dark:bg-gray-800 shadow-md rounded-xl overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCardSelect(user)}
        >
          <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-700">
            {/* Card front - this looks like a scratch card */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-secondary-300 dark:from-primary-700 dark:to-secondary-700">
              <div className="text-white text-3xl">?</div>
            </div>
          </div>
          <div className="p-3 text-center">
            <p className="font-medium">Mystery User</p>
            <p className="text-xs text-gray-500">Click to reveal</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ScratchCardGrid; 
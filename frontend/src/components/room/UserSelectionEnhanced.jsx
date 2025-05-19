import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { FiUser } from 'react-icons/fi';
import ScratchCardGrid from './ScratchCardGrid';
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
  const [showCards, setShowCards] = useState(false);

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
    
    // Show cards grid
    setShowCards(true);
    startUserSelection();
  };

  // Handle when user selects a card
  const handleCardSelect = (user) => {
    console.log('User card selected:', user.name);
    onUserSelected(user);
    setShowCards(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Show the scratch card grid when in selection mode */}
      {isSelecting && !selectionComplete && showCards && (
        <div className="w-full mt-6 mb-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Select a card to reveal a user
          </h3>
          
          <ScratchCardGrid 
            users={filteredUsers}
            onCardSelect={handleCardSelect}
            loading={usersLoading}
          />
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Click on a card to select a user for allocation
            </p>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          onClick={handleStartSelection}
          disabled={
            usersLoading || 
            !currentRoom || 
            filteredUsers.length === 0 ||
            (currentRoom?.allocatedPersons?.length >= currentRoom?.capacity) || 
            isSelecting
          }
          variant="primary"
          size="lg"
          icon={<FiUser/>}
        >
          Select User for Allocation
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
import React, {useState} from 'react';
import {Button} from '../ui/Button';
import {Input} from '../ui/Input';
import {FiUser} from 'react-icons/fi';
import ScratchCardGrid from './ScratchCardGrid';
import {toast} from 'react-hot-toast';
import {cryptoShuffle} from '@/utils/cryptoShuffle.js';
import api from '@/api/index.js';

const UserSelectionEnhanced = ({
  isSelecting,
  selectionComplete,
  filteredUsers,
  setFilteredUsers,
  currentRoom,
  startUserSelection,
  onUserSelected,
  usersLoading,
}) => {
  const [showCards, setShowCards] = useState(false);
  const [chitthiNumber, setChitthiNumber] = useState(null);

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

    //shuffle filtered users
    setFilteredUsers((pvs) => cryptoShuffle(pvs));

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

  const onNumberEntered = async  () => {
    //get user from number
    try {
      const response = await api.get(`users/chitthi/${chitthiNumber}`)
      const data = await response.data;
      if(!data || !data.ok){
        toast.error(data.message || 'No user with given chitthi number');
      }else{
        handleCardSelect(data.user);
        setChitthiNumber('');
      }
      
    }catch (error) {
      console.log( "Error to get user " ,error);
      toast.error(error.response.data.message || 'No user with given chitthi number');
    }
    

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

          <Input
              placeholder="Enter a number"
              value={chitthiNumber}
              onChange={(e) => setChitthiNumber(e.target.value)}
          />

          <Button
              onClick={onNumberEntered}
              disabled={
                  usersLoading ||
                  !currentRoom ||
                  filteredUsers.length === 0 ||
                  (currentRoom?.allocatedPersons?.length >=
                      currentRoom?.capacity) ||
                  isSelecting
              }
              variant="primary"
              size="lg"
              icon={<FiUser/>}
          >
            Get Bhai
          </Button>
        </div>
      </div>
  );
};

export default UserSelectionEnhanced; 
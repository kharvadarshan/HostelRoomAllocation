import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../ui/Button';

const RoomAllocationHeader = ({ 
  currentRoom, 
  goToPreviousRoom, 
  goToNextRoom, 
  loading, 
  isSelecting,
  selectionComplete
}) => {
  if (!currentRoom) {
    return (
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">No rooms available</h3>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <Button
        onClick={goToPreviousRoom}
        disabled={loading || isSelecting}
        variant="outline"
        icon={<FiChevronLeft />}
        size="sm"
      >
        Previous
      </Button>

      <h3 className="text-xl font-semibold">
        Room {currentRoom.roomNo}
      </h3>

      <Button
        onClick={goToNextRoom}
        disabled={loading || isSelecting}
        variant="outline"
        icon={<FiChevronRight />}
        size="sm"
      >
        Next
      </Button>
    </div>
  );
};

export default RoomAllocationHeader; 
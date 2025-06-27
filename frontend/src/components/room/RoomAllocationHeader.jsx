import React, {useState} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import {Button} from '../ui/Button';
import {Input} from '@/components/ui/Input.jsx';

const RoomAllocationHeader = ({
  currentRoom,
  goToPreviousRoom,
  goToNextRoom,
  loading,
  isSelecting,
  selectionComplete,
  goToSpecificRoom,
}) => {
  const [roomNo, setRoomNo] = useState('');
  
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
            icon={<FiChevronLeft/>}
            // size="sm"
        >
          Previous
        </Button>

        {/*<h3 className="text-xl font-semibold">*/}
        {/*  Room {currentRoom.roomNo}*/}
        {/*</h3>*/}

        <div className="flex items-center gap-3">
          <Input
              placeholder="Enter Room No."
              size="lg"
              value={roomNo}
              onChange={(e) => {
                setRoomNo(e.target.value);
              }}
              
          />
          <Button 
              onClick={() => goToSpecificRoom(roomNo)}
              size="lg"
          >
            Enter
          </Button>
        </div>


        <Button
            onClick={goToNextRoom}
            disabled={loading || isSelecting}
            variant="outline"
            icon={<FiChevronRight/>}
            // size="sm"
        >
          Next
        </Button>
      </div>
  );
};

export default RoomAllocationHeader; 
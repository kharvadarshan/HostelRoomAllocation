import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../ui/Button';

const RoomHeader = ({ 
  currentRoom, 
  goToPreviousRoom, 
  goToNextRoom, 
  loading, 
  isSelecting, 
  selectionComplete,
  selectedGroup,
  selectedLevel
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h2 className="text-xl font-bold">Room Allocation</h2>
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedGroup !== 'all' && (
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Group: {selectedGroup}
            </p>
          )}
          {selectedLevel !== 'all' && (
            <p className="text-sm text-primary-600 dark:text-primary-400 ml-2">
              Level: {selectedLevel}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToPreviousRoom}
          disabled={loading || isSelecting}
          icon={<FiChevronLeft />}
        >
          Previous Room
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToNextRoom}
          disabled={loading || (isSelecting && !selectionComplete)}
          icon={<FiChevronRight />}
        >
          Next Room
        </Button>
      </div>
    </div>
  );
};

export default RoomHeader; 
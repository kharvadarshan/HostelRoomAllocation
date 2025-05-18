import { FiHome } from 'react-icons/fi';

const RoomDetails = ({ currentRoom }) => {
  if (!currentRoom) {
    return (
      <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <FiHome className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">No rooms available for this floor</p>
      </div>
    );
  }
  
  return (
    <div className="bg-primary-500 text-white p-4 rounded-t-lg mb-6">
      <h2 className="text-2xl font-bold text-center">Room {currentRoom.roomNo}</h2>
      <div className="text-center mt-2">
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {currentRoom.allocatedPersons?.length || 0} / {currentRoom.capacity} Allocated
        </span>
      </div>
    </div>
  );
};

export default RoomDetails; 
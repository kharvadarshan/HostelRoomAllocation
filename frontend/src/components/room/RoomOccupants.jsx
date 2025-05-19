import { FiUser } from 'react-icons/fi';

const RoomOccupants = ({ currentRoom, allocatedUsersMap = {} }) => {
  if (!currentRoom) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Current Occupants</h3>
      {!currentRoom.allocatedPersons || currentRoom.allocatedPersons.length === 0 ? (
        <p className="text-gray-500 italic text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">No occupants yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentRoom.allocatedPersons.map(personId => {
            // Get user from allocatedUsersMap
            const user = allocatedUsersMap[personId];
            return (
              <div 
                key={personId} 
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center shadow-md transform transition-all hover:scale-105 hover:shadow-lg"
              >
                {user ? (
                  <>
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 mb-3 border-3 border-primary-500">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FiUser className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className={`font-medium text-lg text-center ${user.error ? 'text-red-500' : ''}`}>{user.name}</p>
                    {!user.error && (
                      <>
                        <p className="text-sm text-gray-500 text-center mt-1">{user.field}</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {user.group && (
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                              {user.group}
                            </span>
                          )}
                          {user.level && (
                            <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 text-xs rounded-full">
                              Level {user.level}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 flex items-center justify-center">
                      <FiUser className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="font-medium text-lg text-center">Loading user...</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomOccupants; 
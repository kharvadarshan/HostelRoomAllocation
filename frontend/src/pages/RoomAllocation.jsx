import React from 'react';
import {Card, CardContent, CardHeader} from '../components/ui/Card';
import {Button} from '../components/ui/Button';
import {FiRefreshCw} from 'react-icons/fi';

// Import components
import UserSelectionModal from '../components/room/UserSelectionModal';
import RoomDetails from '../components/room/RoomDetails';
import RoomOccupants from '../components/room/RoomOccupants';
import UserSelectionEnhanced from '../components/room/UserSelectionEnhanced';
import FloorSelector from '../components/room/FloorSelector';
import RoomAllocationHeader from '../components/room/RoomAllocationHeader';
import FilterControls from '../components/room/FilterControls';

// Import state hook
import useRoomAllocationState from '../components/room/RoomAllocationState';

const RoomAllocation = () => {
  // Get state and methods from custom hook
  const {
    // State
    currentRoom,
    floors,
    currentFloor,
    loading,
    selectedGroup,
    selectedLevel,
    usersLoading,
    allocatedUsersMap,
    filteredUsers,
    isSelecting,
    selectionComplete,
    selectedUser,
    showUserPopup,

    // Methods
    setFilteredUsers,
    setSelectedGroup,
    setSelectedLevel,
    handleUserSelected,
    startUserSelection,
    goToNextRoom,
    goToPreviousRoom,
    allocateSelectedUser,
    loadUnallocatedUsers,
    closeUserPopup,
    setCurrentFloor,
    goToSpecificRoom,
  } = useRoomAllocationState();

  return (
      <div className="container-fluid px-4 py-8 max-w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Floor and filters */}
          {/*Comment due to we use chitthi*/}
          {/*<div className="md:w-1/5">*/}
          {/*  <FloorSelector*/}
          {/*      floors={floors}*/}
          {/*      currentFloor={currentFloor}*/}
          {/*      setCurrentFloor={setCurrentFloor}*/}
          {/*      selectedGroup={selectedGroup}*/}
          {/*      setSelectedGroup={setSelectedGroup}*/}
          {/*      selectedLevel={selectedLevel}*/}
          {/*      setSelectedLevel={setSelectedLevel}*/}
          {/*      loading={loading}*/}
          {/*  />*/}
          
          {/*  <FilterControls*/}
          {/*      selectedGroup={selectedGroup}*/}
          {/*      setSelectedGroup={setSelectedGroup}*/}
          {/*      selectedLevel={selectedLevel}*/}
          {/*      setSelectedLevel={setSelectedLevel}*/}
          {/*      loadUnallocatedUsers={loadUnallocatedUsers}*/}
          {/*      usersLoading={usersLoading}*/}
          {/*      isSelecting={isSelecting}*/}
          {/*  />*/}
          {/*</div>*/}

          {/* Main content */}
          {/*<div className="md:w-4/5">*/}
          <div className="w-full">
            <Card className="h-full">
              <CardHeader>
                <RoomAllocationHeader
                    currentRoom={currentRoom}
                    goToPreviousRoom={goToPreviousRoom}
                    goToNextRoom={goToNextRoom}
                    loading={loading}
                    isSelecting={isSelecting}
                    selectionComplete={selectionComplete}
                    goToSpecificRoom={goToSpecificRoom}
                />
              </CardHeader>

              <CardContent>
                {loading ? (
                    <div className="text-center p-12">
                      <div
                          className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading
                        rooms...</p>
                    </div>
                ) : (
                    <div>
                      <RoomDetails currentRoom={currentRoom}/>

                      <RoomOccupants
                          currentRoom={currentRoom}
                          allocatedUsersMap={allocatedUsersMap}
                      />

                      <div className="flex flex-col items-center">
                        <UserSelectionEnhanced
                            isSelecting={isSelecting}
                            selectionComplete={selectionComplete}
                            filteredUsers={filteredUsers}
                            setFilteredUsers={setFilteredUsers}
                            currentRoom={currentRoom}
                            startUserSelection={startUserSelection}
                            onUserSelected={handleUserSelected}
                            usersLoading={usersLoading}
                        />

                        <div className="mt-4">
                          <Button
                              onClick={loadUnallocatedUsers}
                              variant="outline"
                              disabled={usersLoading || isSelecting}
                              icon={<FiRefreshCw/>}
                              size="lg"
                          >
                            Refresh Users
                          </Button>
                        </div>
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected User Popup */}
        <UserSelectionModal
            isOpen={showUserPopup}
            onClose={closeUserPopup}
            user={selectedUser}
            onConfirm={allocateSelectedUser}
        />
      </div>
  );
};

export default RoomAllocation; 
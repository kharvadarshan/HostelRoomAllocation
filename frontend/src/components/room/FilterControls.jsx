import React from 'react';
import { Button } from '../ui/Button';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';
import { names, levels } from '../../utils/names';

const FilterControls = ({
  selectedGroup,
  setSelectedGroup,
  selectedLevel,
  setSelectedLevel,
  loadUnallocatedUsers,
  usersLoading,
  isSelecting
}) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Filter Users</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="group-filter" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Group
          </label>
          <select
            id="group-filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
            disabled={isSelecting}
          >
            <option value="all">All Groups</option>
            {names.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="level-filter" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Level
          </label>
          <select
            id="level-filter"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
            disabled={isSelecting}
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <Button
        onClick={loadUnallocatedUsers}
        variant="outline"
        disabled={usersLoading || isSelecting}
        icon={<FiRefreshCw className={usersLoading ? "animate-spin" : ""} />}
        size="sm"
      >
        Refresh Users
      </Button>
    </div>
  );
};

export default FilterControls; 
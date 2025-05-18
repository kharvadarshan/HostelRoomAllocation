import { FiHome, FiFilter, FiLayers } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { names, levels } from '../../utils/names';

const FloorSelector = ({ 
  floors, 
  currentFloor, 
  setCurrentFloor, 
  selectedGroup, 
  setSelectedGroup, 
  selectedLevel, 
  setSelectedLevel,
  loading 
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Floor Selection</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && floors.length === 0 ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : floors.length === 0 ? (
          <p className="text-gray-500 text-center">No floors available</p>
        ) : (
          <div className="flex flex-col gap-2">
            {floors.map(floor => (
              <Button
                key={floor}
                variant={currentFloor === floor ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setCurrentFloor(floor)}
              >
                <FiHome className="mr-2" />
                Floor {floor}
              </Button>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Group</h3>
          <div className="flex flex-col gap-2">
            <Button
              variant={selectedGroup === 'all' ? 'default' : 'outline'}
              size="sm"
              className="justify-start"
              onClick={() => setSelectedGroup('all')}
            >
              <FiFilter className="mr-2" />
              All Groups
            </Button>
            {names.map(group => (
              <Button
                key={group}
                variant={selectedGroup === group ? 'default' : 'outline'}
                size="sm"
                className="justify-start"
                onClick={() => setSelectedGroup(group)}
              >
                <FiFilter className="mr-2" />
                {group}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Level</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('all')}
            >
              <FiLayers className="mr-2" />
              All
            </Button>
            {levels.map(level => (
              <Button
                key={level}
                variant={selectedLevel === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel(level)}
              >
                Level {level}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorSelector; 
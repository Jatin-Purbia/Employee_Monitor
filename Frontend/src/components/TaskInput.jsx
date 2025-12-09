import { useEmployee } from '../context/EmployeeContext';

const TaskInput = () => {
  const { currentTask, setCurrentTask, isTracking } = useEmployee();

  return (
    <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
      <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-3.5">
        Current Task
      </label>
      <input
        type="text"
        id="task"
        value={currentTask}
        onChange={(e) => setCurrentTask(e.target.value)}
        placeholder="Enter task description..."
        disabled={isTracking}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
      />
      {isTracking && (
        <p className="mt-3 text-sm text-gray-500">
          Task is being tracked. Stop tracking to change task.
        </p>
      )}
    </div>
  );
};

export default TaskInput;


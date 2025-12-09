import { useEmployee } from '../context/EmployeeContext';
import { formatDuration, formatDateTime } from '../utils/formatTime';

const TaskList = () => {
  const { tasks, deleteTask } = useEmployee();

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Task History</h2>
        <div className="text-center py-14">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-500">No tasks recorded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Task History</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-blue-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-3">{task.task}</h3>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <p>Start: {formatDateTime(task.startTime)}</p>
                  <p>End: {formatDateTime(task.endTime)}</p>
                  <p>Duration: {formatDuration(task.duration)}</p>
                  <p className="text-blue-600">Screenshots: {task.screenshots}</p>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                title="Delete task"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;


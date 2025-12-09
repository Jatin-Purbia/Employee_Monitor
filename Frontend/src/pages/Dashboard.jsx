import Header from '../components/Header';
import TaskInput from '../components/TaskInput';
import Timer from '../components/Timer';
import TaskList from '../components/TaskList';
import ScreenshotGallery from '../components/ScreenshotGallery';
import Settings from '../components/Settings';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Work Dashboard</h1>
          <p className="text-gray-600 text-lg">Track your work time, tasks, and activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="lg:col-span-2">
            <Timer />
          </div>
          <div>
            <TaskInput />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <TaskList />
          <Settings />
        </div>

        <div className="mb-8">
          <ScreenshotGallery />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


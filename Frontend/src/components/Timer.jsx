import { useEmployee } from '../context/EmployeeContext';
import { useTimer } from '../hooks/useTimer';

const Timer = () => {
  const { isTracking, startTracking, stopTracking, startScreenshotCapture, stopScreenshotCapture, hasPermission, requestScreenPermission, startTime } = useEmployee();
  const { formattedTime } = useTimer(isTracking, startTime);

  const handleStart = async () => {
    if (!hasPermission) {
      const granted = await requestScreenPermission();
      if (granted) {
        startTracking();
        startScreenshotCapture();
      }
    } else {
      startTracking();
      startScreenshotCapture();
    }
  };

  const handleStop = () => {
    stopTracking();
    stopScreenshotCapture();
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-9 sm:p-10 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6">Work Timer</h2>
        <div className="text-6xl font-mono font-bold mb-8 tracking-tight">
          {formattedTime}
        </div>
        <div className="flex gap-4 justify-center">
          {!isTracking ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Tracking
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Stop Tracking
            </button>
          )}
        </div>
        {isTracking && hasPermission && (
          <p className="mt-4 text-sm text-green-200 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Screenshots are being captured automatically
          </p>
        )}
        {!hasPermission && !isTracking && (
          <p className="mt-4 text-sm text-yellow-200">
            Screen capture permission will be requested when you start tracking
          </p>
        )}
      </div>
    </div>
  );
};

export default Timer;


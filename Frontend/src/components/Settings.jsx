import { useState } from 'react';
import { useEmployee } from '../context/EmployeeContext';

const Settings = () => {
  const { screenshotInterval, updateScreenshotInterval, hasPermission, requestScreenPermission } = useEmployee();
  const [intervalInput, setIntervalInput] = useState(screenshotInterval);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (intervalInput >= 1 && intervalInput <= 60) {
      updateScreenshotInterval(intervalInput);
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          {isOpen ? '▼ Close' : '▶ Open'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          <div>
            <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-3">
              Screenshot Interval (minutes)
            </label>
            <input
              type="number"
              id="interval"
              min="1"
              max="60"
              value={intervalInput}
              onChange={(e) => setIntervalInput(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-gray-500">
              Screenshots will be captured every {intervalInput} minute(s)
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Screen Capture Permission</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasPermission 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hasPermission ? 'Granted' : 'Not Granted'}
              </span>
              {!hasPermission && (
                <button
                  onClick={requestScreenPermission}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Request Permission
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Save Settings
          </button>
        </div>
      )}

      {!isOpen && (
        <div className="text-sm text-gray-600">
          <p>Screenshot Interval: {screenshotInterval} minute(s)</p>
          <p>Permission: {hasPermission ? 'Granted' : 'Not Granted'}</p>
        </div>
      )}
    </div>
  );
};

export default Settings;


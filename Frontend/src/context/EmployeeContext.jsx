import { createContext, useContext, useState, useEffect, useRef } from 'react';

const EmployeeContext = createContext();

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [screenshotInterval, setScreenshotInterval] = useState(5); // minutes
  const [hasPermission, setHasPermission] = useState(false);
  const screenshotIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('employeeTasks');
    const savedScreenshots = localStorage.getItem('employeeScreenshots');
    const savedInterval = localStorage.getItem('screenshotInterval');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedScreenshots) {
      setScreenshots(JSON.parse(savedScreenshots));
    }
    if (savedInterval) {
      setScreenshotInterval(Number(savedInterval));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('employeeTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save screenshots to localStorage whenever they change
  useEffect(() => {
    if (screenshots.length > 0) {
      localStorage.setItem('employeeScreenshots', JSON.stringify(screenshots));
    }
  }, [screenshots]);

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
  };

  const stopTracking = () => {
    if (currentTask && startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime - startTime) / 1000); // seconds
      
      const newTask = {
        id: Date.now(),
        task: currentTask,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        screenshots: screenshots.filter(
          s => new Date(s.timestamp) >= startTime && new Date(s.timestamp) <= endTime
        ).length
      };
      
      setTasks(prev => [newTask, ...prev]);
    }
    
    setIsTracking(false);
    setStartTime(null);
    setCurrentTask('');
    stopScreenshotCapture();
  };

  const requestScreenPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      // Keep the stream alive for continuous capture
      streamRef.current = stream;
      setHasPermission(true);
      
      // Handle stream end (user stops sharing)
      stream.getTracks().forEach(track => {
        track.onended = () => {
          setHasPermission(false);
          streamRef.current = null;
          if (screenshotIntervalRef.current) {
            clearInterval(screenshotIntervalRef.current);
            screenshotIntervalRef.current = null;
          }
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting screen permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  const captureScreenshot = async () => {
    try {
      // If we have an active stream, use it
      if (streamRef.current && streamRef.current.active) {
        const video = document.createElement('video');
        video.srcObject = streamRef.current;
        video.play();

        await new Promise(resolve => {
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const screenshotData = canvas.toDataURL('image/png');
            
            const screenshot = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              task: currentTask || 'No task',
              data: screenshotData
            };
            
            setScreenshots(prev => [screenshot, ...prev]);
            resolve();
          };
        });
      } else {
        // Stream ended, need to request again
        setHasPermission(false);
        if (isTracking) {
          // Try to restart if still tracking
          const granted = await requestScreenPermission();
          if (granted) {
            captureScreenshot();
          }
        }
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  const startScreenshotCapture = async () => {
    if (!hasPermission || !streamRef.current || !streamRef.current.active) {
      const granted = await requestScreenPermission();
      if (!granted) {
        return;
      }
    }
    
    startScreenshotInterval();
  };

  const startScreenshotInterval = () => {
    // Capture immediately
    captureScreenshot();
    
    // Then capture at intervals
    screenshotIntervalRef.current = setInterval(() => {
      captureScreenshot();
    }, screenshotInterval * 60 * 1000); // Convert minutes to milliseconds
  };

  const stopScreenshotCapture = () => {
    if (screenshotIntervalRef.current) {
      clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const updateScreenshotInterval = (minutes) => {
    setScreenshotInterval(minutes);
    localStorage.setItem('screenshotInterval', minutes.toString());
    
    // Restart interval if currently tracking
    if (isTracking && screenshotIntervalRef.current) {
      stopScreenshotCapture();
      startScreenshotInterval();
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const deleteScreenshot = (screenshotId) => {
    setScreenshots(prev => prev.filter(screenshot => screenshot.id !== screenshotId));
  };

  const value = {
    currentTask,
    setCurrentTask,
    tasks,
    isTracking,
    startTracking,
    stopTracking,
    startTime,
    screenshots,
    screenshotInterval,
    hasPermission,
    requestScreenPermission,
    startScreenshotCapture,
    stopScreenshotCapture,
    updateScreenshotInterval,
    deleteTask,
    deleteScreenshot,
    captureScreenshot
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};


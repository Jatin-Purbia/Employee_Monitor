import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { taskApi, screenshotApi } from '../api';

const EmployeeContext = createContext();

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const { getToken } = useAuth();
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
    const savedInterval = localStorage.getItem('screenshotInterval');
    if (savedInterval) {
      setScreenshotInterval(Number(savedInterval));
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const loadData = async () => {
      try {
        const tasksRes = await taskApi.list({}, token);
        setTasks(tasksRes.data || []);
        const shotsRes = await screenshotApi.list({}, token);
        // Load image data for screenshots that have imageUrl
        const screenshotsWithImages = await Promise.all(
          (shotsRes.data || []).map(async (shot) => {
            if (shot.imageUrl && !shot.data && !shot.imageData) {
              try {
                const { data } = await screenshotApi.getImage(shot.id, token);
                return { ...shot, data: data?.imageData };
              } catch (err) {
                console.warn('Failed to load screenshot image', err);
                return shot;
              }
            }
            return shot;
          })
        );
        setScreenshots(screenshotsWithImages);
      } catch (error) {
        console.warn('Could not load employee data', error.message);
      }
    };

    loadData();
  }, [getToken]);

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
  };

  const stopTracking = () => {
    if (currentTask && startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime - startTime) / 1000);
      const shotCount = screenshots.filter(
        (s) => new Date(s.timestamp) >= startTime && new Date(s.timestamp) <= endTime
      ).length;

      const token = getToken();
      const newTask = {
        description: currentTask,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        screenshotCount: shotCount,
      };

      if (token) {
        taskApi
          .create(newTask, token)
          .then((res) => setTasks((prev) => [res.data, ...prev]))
          .catch((err) => console.error('Failed to sync task', err));
      } else {
        setTasks((prev) => [{ id: Date.now(), ...newTask }, ...prev]);
      }
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

            const token = getToken();
            if (token) {
              screenshotApi.upload({ imageData: screenshotData, timestamp: screenshot.timestamp }, token)
                .catch((err) => console.error('Failed to upload screenshot', err));
            }
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

  const deleteTask = async (taskId) => {
    const token = getToken();
    if (token) {
      try {
        await taskApi.delete(taskId, token);
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Failed to delete task', error);
        // Still remove from local state on error
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const deleteScreenshot = async (screenshotId) => {
    const token = getToken();
    if (token) {
      try {
        await screenshotApi.delete(screenshotId, token);
        setScreenshots(prev => prev.filter(screenshot => screenshot.id !== screenshotId));
      } catch (error) {
        console.error('Failed to delete screenshot', error);
        // Still remove from local state on error
        setScreenshots(prev => prev.filter(screenshot => screenshot.id !== screenshotId));
      }
    } else {
      setScreenshots(prev => prev.filter(screenshot => screenshot.id !== screenshotId));
    }
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


# Employee Work Monitor - Project Structure

## Overview
This application is designed for monitoring employee work by tracking time, tasks, and capturing screenshots at regular intervals.

## Folder Structure

```
Frontend/src/
├── components/          # Reusable UI components
│   ├── TaskInput.jsx   # Input field for entering current task
│   ├── Timer.jsx       # Timer component with start/stop functionality
│   ├── TaskList.jsx    # Display list of completed tasks
│   ├── ScreenshotGallery.jsx  # Gallery view of captured screenshots
│   └── Settings.jsx    # Settings panel for screenshot intervals
│
├── pages/              # Page components
│   └── Dashboard.jsx   # Main dashboard page
│
├── context/            # React Context for state management
│   └── EmployeeContext.jsx  # Global state for tasks, time, screenshots
│
├── hooks/              # Custom React hooks
│   └── useTimer.js     # Timer hook for elapsed time calculation
│
├── utils/              # Utility functions
│   └── formatTime.js   # Time formatting utilities
│
├── App.jsx             # Main app component
├── main.jsx            # Application entry point
└── index.css           # Global styles with Tailwind CSS
```

## Features

### 1. Time Tracking
- Start/stop timer for work sessions
- Real-time elapsed time display
- Automatic task recording when stopped

### 2. Task Management
- Enter task descriptions
- Track task duration
- View task history with timestamps
- Delete tasks

### 3. Screenshot Capture
- Automatic screenshot capture at configurable intervals
- Browser permission handling
- Screenshot gallery with preview
- Screenshots linked to tasks
- Delete screenshots

### 4. Settings
- Configure screenshot interval (1-60 minutes)
- Request screen capture permissions
- View permission status

## Data Persistence
- All data (tasks, screenshots, settings) is stored in browser localStorage
- Data persists across browser sessions
- Screenshots are stored as base64 encoded images

## Browser Compatibility
- Requires modern browser with `getDisplayMedia` API support
- Chrome, Edge, Firefox, Safari (latest versions)
- HTTPS required for screen capture (or localhost for development)

## Usage

1. **Start Tracking:**
   - Enter a task description
   - Click "Start Tracking"
   - Grant screen capture permission when prompted

2. **During Tracking:**
   - Timer runs automatically
   - Screenshots are captured at configured intervals
   - Task cannot be changed while tracking

3. **Stop Tracking:**
   - Click "Stop Tracking"
   - Task is automatically saved with duration and screenshot count

4. **View History:**
   - Check Task History for completed tasks
   - View Screenshot Gallery for captured images
   - Click on screenshots to view full size

5. **Configure Settings:**
   - Open Settings panel
   - Adjust screenshot interval
   - Request permissions if needed

## Technical Details

### State Management
- React Context API for global state
- LocalStorage for persistence
- Real-time timer updates using setInterval

### Screenshot Capture
- Uses `navigator.mediaDevices.getDisplayMedia()` API
- Canvas API for image conversion
- Base64 encoding for storage

### Styling
- Tailwind CSS for all styling
- Responsive design with grid layouts
- Modern UI with gradients and shadows


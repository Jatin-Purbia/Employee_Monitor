import { useState } from 'react';
import { useEmployee } from '../context/EmployeeContext';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/formatTime';
import { screenshotApi } from '../api';

const ScreenshotGallery = () => {
  const { screenshots, deleteScreenshot } = useEmployee();
  const { getToken } = useAuth();
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [loadingImages, setLoadingImages] = useState(new Set());

  if (screenshots.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Screenshots</h2>
        <div className="text-center py-14">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-500">No screenshots captured yet</p>
        </div>
      </div>
    );
  }

  const loadScreenshotImage = async (shot) => {
    if (shot.data || shot.imageData) {
      return shot.data || shot.imageData;
    }

    if (shot.imageUrl || shot.id) {
      try {
        const token = getToken();
        if (!token) return null;
        
        const { data } = await screenshotApi.getImage(shot.id, token);
        return data?.imageData || null;
      } catch (err) {
        console.error('Failed to load screenshot image', err);
        return null;
      }
    }
    return null;
  };

  const handleOpen = async (shot) => {
    const imageData = await loadScreenshotImage(shot);
    setSelectedScreenshot({ ...shot, data: imageData || shot.data || shot.imageData });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Screenshots ({screenshots.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-h-96 overflow-y-auto">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-blue-300"
              onClick={() => handleOpen(screenshot)}
            >
              <img
                src={screenshot.data || screenshot.imageData || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=='}
                alt={`Screenshot ${screenshot.id}`}
                className="w-full h-32 object-cover"
                onError={async (e) => {
                  // Try to load image if not already loaded
                  if (!screenshot.data && !screenshot.imageData) {
                    const token = getToken();
                    if (token && !loadingImages.has(screenshot.id)) {
                      setLoadingImages(prev => new Set(prev).add(screenshot.id));
                      try {
                        const { data } = await screenshotApi.getImage(screenshot.id, token);
                        if (data?.imageData) {
                          e.target.src = data.imageData;
                        }
                      } catch (err) {
                        console.error('Failed to load screenshot', err);
                      } finally {
                        setLoadingImages(prev => {
                          const next = new Set(prev);
                          next.delete(screenshot.id);
                          return next;
                        });
                      }
                    }
                  }
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScreenshot(screenshot.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-opacity"
                  title="Delete screenshot"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                <p className="truncate">{screenshot.task || 'No task'}</p>
                <p className="text-gray-300">{formatDateTime(screenshot.timestamp || screenshot.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedScreenshot.data || selectedScreenshot.imageData || ''}
              alt="Full screenshot"
              className="max-w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
              <p className="font-semibold">{selectedScreenshot.task || 'No task'}</p>
              <p className="text-sm text-gray-300">{formatDateTime(selectedScreenshot.timestamp || selectedScreenshot.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenshotGallery;


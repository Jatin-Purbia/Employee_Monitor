import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a screenshot
 * POST /api/screenshots
 */
export const uploadScreenshot = async (req, res, next) => {
  try {
    const { imageData, taskId, timestamp } = req.body;
    const userId = req.user.userId;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required',
      });
    }

    // Get employee record
    const employee = db.employees.findByUserId(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee record not found',
      });
    }

    // Verify task belongs to employee if taskId is provided
    if (taskId) {
      const task = db.tasks.findById(taskId);
      if (!task || task.employeeId !== employee.id) {
        return res.status(403).json({
          success: false,
          error: 'Task not found or does not belong to you',
        });
      }
    }

    const screenshotId = uuidv4();
    const screenshot = db.screenshots.create(screenshotId, {
      employeeId: employee.id,
      companyId: employee.companyId,
      taskId: taskId || null,
      imageData, // Base64 encoded image
      timestamp: timestamp || new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Screenshot uploaded successfully',
      data: {
        ...screenshot,
        // Don't send full image data in list response, just metadata
        imageData: undefined,
        imageUrl: `/api/screenshots/${screenshotId}/image`,
      },
    });
  } catch (error) {
    console.error('Upload screenshot error:', error);
    next(error);
  }
};

/**
 * Get screenshots
 * GET /api/screenshots
 */
export const getScreenshots = async (req, res, next) => {
  try {
    const { taskId, employeeId } = req.query;
    const userId = req.user.userId;

    let screenshots;

    if (taskId) {
      const task = db.tasks.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        });
      }

      // Check permissions
      const employee = db.employees.findById(task.employeeId);
      if (req.user.role !== 'owner' && employee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view these screenshots',
        });
      }

      screenshots = db.screenshots.findByTaskId(taskId);
    } else if (employeeId) {
      const employee = db.employees.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      // Check permissions
      if (req.user.role === 'owner') {
        const company = db.companies.findByOwnerId(userId);
        if (company && employee.companyId === company.id) {
          screenshots = db.screenshots.findByEmployeeId(employeeId);
        } else {
          return res.status(403).json({
            success: false,
            error: 'You do not have permission to view screenshots for this employee',
          });
        }
      } else if (employee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view your own screenshots',
        });
      } else {
        screenshots = db.screenshots.findByEmployeeId(employeeId);
      }
    } else {
      // Get current user's screenshots
      const employee = db.employees.findByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee record not found',
        });
      }

      screenshots = db.screenshots.findByEmployeeId(employee.id);
    }

    // Return metadata only (not full image data)
    const screenshotsMetadata = screenshots.map((screenshot) => ({
      id: screenshot.id,
      employeeId: screenshot.employeeId,
      taskId: screenshot.taskId,
      timestamp: screenshot.timestamp,
      createdAt: screenshot.createdAt,
      imageUrl: `/api/screenshots/${screenshot.id}/image`,
    }));

    res.json({
      success: true,
      data: screenshotsMetadata,
    });
  } catch (error) {
    console.error('Get screenshots error:', error);
    next(error);
  }
};

/**
 * Get screenshot image
 * GET /api/screenshots/:id/image
 */
export const getScreenshotImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screenshot = db.screenshots.findById(id);

    if (!screenshot) {
      return res.status(404).json({
        success: false,
        error: 'Screenshot not found',
      });
    }

    // Check permissions
    const employee = db.employees.findById(screenshot.employeeId);
    const user = db.users.findById(userId);

    if (user.role !== 'owner' && employee.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this screenshot',
      });
    }

    // Return the image data
    res.json({
      success: true,
      data: {
        id: screenshot.id,
        imageData: screenshot.imageData,
        timestamp: screenshot.timestamp,
      },
    });
  } catch (error) {
    console.error('Get screenshot image error:', error);
    next(error);
  }
};

/**
 * Delete screenshot
 * DELETE /api/screenshots/:id
 */
export const deleteScreenshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const screenshot = db.screenshots.findById(id);

    if (!screenshot) {
      return res.status(404).json({
        success: false,
        error: 'Screenshot not found',
      });
    }

    // Check permissions
    const employee = db.employees.findById(screenshot.employeeId);

    if (req.user.role !== 'owner' && employee.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this screenshot',
      });
    }

    db.screenshots.delete(id);

    res.json({
      success: true,
      message: 'Screenshot deleted successfully',
    });
  } catch (error) {
    console.error('Delete screenshot error:', error);
    next(error);
  }
};


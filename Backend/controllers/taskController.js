import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new task
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { description, startTime, endTime, duration, screenshotCount } = req.body;
    const userId = req.user.userId;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required',
      });
    }

    // Get employee record
    const employee = db.employees.findByUserId(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee record not found. Please join a company first.',
      });
    }

    const taskId = uuidv4();
    const task = db.tasks.create(taskId, {
      employeeId: employee.id,
      companyId: employee.companyId,
      description,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date().toISOString(),
      duration: duration || 0, // in seconds
      screenshotCount: screenshotCount || 0,
      status: 'completed',
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    next(error);
  }
};

/**
 * Get tasks
 * GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    const { employeeId, companyId } = req.query;
    const userId = req.user.userId;

    let tasks;

    if (companyId) {
      // Owner viewing all tasks for their company
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Only owners can view company-wide tasks',
        });
      }

      const company = db.companies.findById(companyId);
      if (!company || company.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view tasks for this company',
        });
      }

      tasks = db.tasks.findByCompanyId(companyId);
    } else if (employeeId) {
      // Viewing tasks for a specific employee
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
          tasks = db.tasks.findByEmployeeId(employeeId);
        } else {
          return res.status(403).json({
            success: false,
            error: 'You do not have permission to view tasks for this employee',
          });
        }
      } else if (employee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view your own tasks',
        });
      } else {
        tasks = db.tasks.findByEmployeeId(employeeId);
      }
    } else {
      // Get current user's tasks
      const employee = db.employees.findByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee record not found',
        });
      }

      tasks = db.tasks.findByEmployeeId(employee.id);
    }

    // Enrich with employee data
    const enrichedTasks = tasks.map((task) => {
      const employee = db.employees.findById(task.employeeId);
      const employeeUser = employee ? db.users.findById(employee.userId) : null;
      return {
        ...task,
        employeeName: employeeUser?.name,
        employeeEmail: employeeUser?.email,
      };
    });

    res.json({
      success: true,
      data: enrichedTasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    next(error);
  }
};

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = db.tasks.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Check permissions
    const employee = db.employees.findById(task.employeeId);
    const user = db.users.findById(userId);

    if (user.role !== 'owner' && employee.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this task',
      });
    }

    // Enrich with employee data
    const employeeUser = db.users.findById(employee.userId);

    res.json({
      success: true,
      data: {
        ...task,
        employeeName: employeeUser?.name,
        employeeEmail: employeeUser?.email,
      },
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    next(error);
  }
};

/**
 * Update task
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, duration, screenshotCount } = req.body;
    const userId = req.user.userId;

    const task = db.tasks.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Check permissions - only the employee who created the task can update it
    const employee = db.employees.findById(task.employeeId);
    if (employee.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own tasks',
      });
    }

    const updateData = {};
    if (description) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (screenshotCount !== undefined) updateData.screenshotCount = screenshotCount;

    const updatedTask = db.tasks.update(id, updateData);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    next(error);
  }
};

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = db.tasks.findById(id);

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
        error: 'You do not have permission to delete this task',
      });
    }

    // Delete associated screenshots
    const screenshots = db.screenshots.findByTaskId(id);
    screenshots.forEach((screenshot) => {
      db.screenshots.delete(screenshot.id);
    });

    // Delete task
    db.tasks.delete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    next(error);
  }
};


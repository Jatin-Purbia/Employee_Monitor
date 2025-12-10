import { db } from '../config/database.js';

/**
 * Get all employees for a company
 * GET /api/employees
 */
export const getEmployees = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    const userId = req.user.userId;

    let employees;

    if (companyId) {
      // Verify user has access to this company
      const company = db.companies.findById(companyId);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found',
        });
      }

      // Check if user is owner or employee of this company
      if (company.ownerId !== userId) {
        const employee = db.employees.findByUserId(userId);
        if (!employee || employee.companyId !== companyId) {
          return res.status(403).json({
            success: false,
            error: 'You do not have permission to view employees of this company',
          });
        }
      }

      employees = db.employees.findByCompanyId(companyId);
    } else {
      // Get current user's employee record
      const employee = db.employees.findByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee record not found',
        });
      }

      // If user is owner, get all employees of their company
      if (req.user.role === 'owner') {
        const company = db.companies.findByOwnerId(userId);
        if (company) {
          employees = db.employees.findByCompanyId(company.id);
        } else {
          employees = [];
        }
      } else {
        employees = [employee];
      }
    }

    // Enrich with user data
    const enrichedEmployees = employees.map((emp) => {
      const user = db.users.findById(emp.userId);
      return {
        ...emp,
        name: user?.name,
        email: user?.email,
      };
    });

    res.json({
      success: true,
      data: enrichedEmployees,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    next(error);
  }
};

/**
 * Get employee by ID
 * GET /api/employees/:id
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const employee = db.employees.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'owner' && employee.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this employee',
      });
    }

    // Enrich with user data
    const userData = db.users.findById(employee.userId);

    res.json({
      success: true,
      data: {
        ...employee,
        name: userData?.name,
        email: userData?.email,
      },
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    next(error);
  }
};

/**
 * Get current employee profile
 * GET /api/employees/me
 */
export const getMyEmployeeProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const employee = db.employees.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee record not found',
      });
    }

    // Enrich with user data
    const user = db.users.findById(userId);
    const company = db.companies.findById(employee.companyId);

    res.json({
      success: true,
      data: {
        ...employee,
        name: user?.name,
        email: user?.email,
        company: company ? { id: company.id, name: company.name } : null,
      },
    });
  } catch (error) {
    console.error('Get my employee profile error:', error);
    next(error);
  }
};

/**
 * Update employee status
 * PUT /api/employees/:id
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const employee = db.employees.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Check permissions - only owner can update employee status
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only company owners can update employee status',
      });
    }

    // Verify owner owns the company
    const company = db.companies.findById(employee.companyId);
    if (company.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this employee',
      });
    }

    const updateData = {};
    if (status) updateData.status = status;

    const updatedEmployee = db.employees.update(id, updateData);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    next(error);
  }
};


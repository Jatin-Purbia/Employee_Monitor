import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Create a new company
 * POST /api/companies
 */
export const createCompany = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required',
      });
    }

    // Check if owner already has a company
    const existingCompany = db.companies.findByOwnerId(ownerId);
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        error: 'You already have a company. One owner can only have one company.',
      });
    }

    const companyId = uuidv4();
    const company = db.companies.create(companyId, {
      name,
      description: description || '',
      ownerId,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    console.error('Create company error:', error);
    next(error);
  }
};

/**
 * Get company by owner
 * GET /api/companies/my-company
 */
export const getMyCompany = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const company = db.companies.findByOwnerId(ownerId);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Get all employees for this company
    const employees = db.employees.findByCompanyId(company.id);

    res.json({
      success: true,
      data: {
        ...company,
        employees,
        employeeCount: employees.length,
      },
    });
  } catch (error) {
    console.error('Get company error:', error);
    next(error);
  }
};

/**
 * Get company by ID
 * GET /api/companies/:id
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = db.companies.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Get all employees for this company
    const employees = db.employees.findByCompanyId(company.id);

    res.json({
      success: true,
      data: {
        ...company,
        employees,
        employeeCount: employees.length,
      },
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    next(error);
  }
};

/**
 * Update company
 * PUT /api/companies/:id
 */
export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const ownerId = req.user.userId;

    const company = db.companies.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    if (company.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this company',
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCompany = db.companies.update(id, updateData);

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Update company error:', error);
    next(error);
  }
};

/**
 * Generate invitation token for employees
 * POST /api/companies/:id/invite
 */
export const generateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const company = db.companies.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    if (company.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to invite employees to this company',
      });
    }

    // Generate a unique invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Store invitation
    db.invitations.create(token, {
      companyId: id,
      ownerId,
      role: 'employee',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    res.json({
      success: true,
      message: 'Invitation token generated successfully',
      data: {
        token,
        invitationLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${token}`,
        expiresAt: db.invitations.findByToken(token).expiresAt,
      },
    });
  } catch (error) {
    console.error('Generate invitation error:', error);
    next(error);
  }
};

/**
 * Accept invitation
 * POST /api/companies/accept-invitation
 */
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Invitation token is required',
      });
    }

    const invitation = db.invitations.findByToken(token);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invitation token',
      });
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      db.invitations.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Invitation token has expired',
      });
    }

    // Check if user is already an employee
    const existingEmployee = db.employees.findByUserId(userId);
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        error: 'You are already associated with a company',
      });
    }

    // Create employee record
    const employeeId = uuidv4();
    const employee = db.employees.create(employeeId, {
      userId,
      companyId: invitation.companyId,
      role: invitation.role || 'employee',
      status: 'active',
    });

    // Delete invitation token
    db.invitations.delete(token);

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    next(error);
  }
};


import admin from '../config/firebase.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    if (!['owner', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "owner" or "employee"',
      });
    }

    // Check if user already exists in our database
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists in Firebase',
        });
      }
      throw firebaseError;
    }

    // Create user in our database
    const userId = uuidv4();
    const user = db.users.create(userId, {
      firebaseUid: firebaseUser.uid,
      name,
      email,
      role,
    });

    // Return user data (without sensitive information)
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

/**
 * Login user (verify Firebase token)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required',
      });
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Find or create user in our database
    let user = db.users.findByEmail(email);
    
    if (!user) {
      // Create user if doesn't exist (for users created via Google sign-in or directly in Firebase)
      const userId = uuidv4();
      user = db.users.create(userId, {
        firebaseUid: uid,
        email,
        name: name || email.split('@')[0],
        role: 'employee', // Default role for new users (can be changed later)
        picture: picture || null,
      });
    } else {
      // Update user info if it exists (in case name or picture changed)
      const updateData = {};
      if (name && name !== user.name) updateData.name = name;
      if (picture && picture !== user.picture) updateData.picture = picture;
      if (uid !== user.firebaseUid) updateData.firebaseUid = uid;
      if (Object.keys(updateData).length > 0) {
        user = db.users.update(user.id, updateData);
      }
    }

    // Return user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/invalid-id-token' || error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = db.users.findByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const user = db.users.findByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (role && ['owner', 'employee'].includes(role)) updateData.role = role;

    const updatedUser = db.users.update(user.id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};


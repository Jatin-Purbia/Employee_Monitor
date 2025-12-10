import admin from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please include a Bearer token in the Authorization header.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Get user from database to attach userId
    const { db } = await import('../config/database.js');
    let user = db.users.findByEmail(decodedToken.email);
    
    // If user doesn't exist in our DB, create a basic record
    if (!user) {
      const { v4: uuidv4 } = await import('uuid');
      const userId = uuidv4();
      user = db.users.create(userId, {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        role: 'employee', // Default role
      });
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || user.name,
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
  }
};

/**
 * Middleware to check if user has owner role
 */
export const requireOwner = async (req, res, next) => {
  try {
    // Get user from database to check role
    const { db } = await import('../config/database.js');
    const user = db.users.findByEmail(req.user.email);

    if (!user || user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Owner role required.',
      });
    }

    req.user.role = user.role;
    req.user.userId = user.id;
    next();
  } catch (error) {
    console.error('Role verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error verifying user role.',
    });
  }
};

/**
 * Middleware to check if user has employee role
 */
export const requireEmployee = async (req, res, next) => {
  try {
    // Get user from database to check role
    const { db } = await import('../config/database.js');
    const user = db.users.findByEmail(req.user.email);

    if (!user || user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Employee role required.',
      });
    }

    req.user.role = user.role;
    req.user.userId = user.id;
    next();
  } catch (error) {
    console.error('Role verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error verifying user role.',
    });
  }
};


import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file first (if it exists)
    const serviceAccountPath = join(__dirname, '..', 'employee-818f9-firebase-adminsdk-fbsvc-070be55bcb.json');
    let serviceAccount;

    try {
      // Try to read from service account file
      const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountFile);
      console.log('Using Firebase service account file');
    } catch (fileError) {
      // Fallback to environment variables
      console.log('Service account file not found, using environment variables');
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'employee-818f9',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
    }

    // Initialize with service account
    if (serviceAccount.privateKey && serviceAccount.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId || 'employee-818f9',
      });
    } else {
      // Fallback: Initialize with default credentials
      admin.initializeApp({
        projectId: serviceAccount.projectId || 'employee-818f9',
      });
    }

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

export default admin;


# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure Firebase**
   
   You have two options:

   ### Option A: Service Account (Recommended)
   
   1. Go to [Firebase Console](https://console.firebase.google.com/)
   2. Select project: `employee-818f9`
   3. Go to Project Settings > Service Accounts
   4. Click "Generate New Private Key"
   5. Download the JSON file
   6. Extract values and add to `.env` file

   ### Option B: Use Firebase Emulator (Development)
   
   For local development, you can use Firebase emulator without service account.

3. **Create `.env` File**
   
   Create a `.env` file in the Backend directory:
   ```env
   FIREBASE_PROJECT_ID=employee-818f9
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@employee-818f9.iam.gserviceaccount.com
   
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Server**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

## Frontend Integration

The frontend needs to:

1. **Initialize Firebase Client SDK**
   ```javascript
   import { initializeApp } from "firebase/app";
   import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
   
   const firebaseConfig = {
     apiKey: "",
     authDomain: "",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: "",
     measurementId: ""
   };
   
   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   ```

2. **Sign Up**
   ```javascript
   import { createUserWithEmailAndPassword } from "firebase/auth";
   import { auth } from "./firebase";
   
   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
   const idToken = await userCredential.user.getIdToken();
   
   // Call backend signup API
   await fetch('http://localhost:5000/api/auth/signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name, email, password, role })
   });
   ```

3. **Login**
   ```javascript
   import { signInWithEmailAndPassword } from "firebase/auth";
   
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
   const idToken = await userCredential.user.getIdToken();
   
   // Call backend login API
   const response = await fetch('http://localhost:5000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ idToken })
   });
   ```

4. **Make Authenticated Requests**
   ```javascript
   const idToken = await user.getIdToken();
   
   const response = await fetch('http://localhost:5000/api/tasks', {
     method: 'GET',
     headers: {
       'Authorization': `Bearer ${idToken}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## API Base URL

- Development: `http://localhost:5000`
- Production: Update `FRONTEND_URL` in `.env`

## Testing the API

You can test the health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Firebase Authentication Errors

- **"Error initializing Firebase Admin SDK"**: Check your `.env` file has correct Firebase credentials
- **"Invalid or expired token"**: Make sure the frontend is sending a valid Firebase ID token
- **"User not found"**: User might not exist in Firebase Auth, create them first

### CORS Errors

- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that the frontend is making requests to the correct backend URL

### Database Issues

- The current implementation uses in-memory storage
- Data will be lost on server restart
- For production, replace `config/database.js` with a real database

## Next Steps

1. Replace in-memory database with MongoDB/PostgreSQL/Firestore
2. Add request validation using express-validator
3. Add rate limiting
4. Set up proper logging
5. Add API documentation (Swagger)
6. Configure Firebase Storage for screenshots
7. Add email notifications for invitations


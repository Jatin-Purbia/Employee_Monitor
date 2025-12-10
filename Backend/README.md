# Employee Work Monitor - Backend API

A comprehensive backend API for the Employee Work Monitor application, built with Node.js, Express, and Firebase Authentication.

## Features

- 🔐 Firebase Authentication (Login & Signup)
- 🏢 Company Management
- 👥 Employee Management
- 📋 Task Tracking
- 📸 Screenshot Management
- 🔒 Role-based Access Control (Owner/Employee)
- 🎫 Invitation System

## Project Structure

```
Backend/
├── config/
│   ├── firebase.js          # Firebase Admin SDK configuration
│   └── database.js           # In-memory database (replace with real DB in production)
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── companyController.js  # Company management
│   ├── employeeController.js # Employee management
│   ├── taskController.js     # Task tracking
│   └── screenshotController.js # Screenshot management
├── middleware/
│   ├── auth.js              # Authentication & authorization middleware
│   └── errorHandler.js      # Error handling middleware
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── companyRoutes.js     # Company routes
│   ├── employeeRoutes.js    # Employee routes
│   ├── taskRoutes.js        # Task routes
│   └── screenshotRoutes.js  # Screenshot routes
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

#### Option A: Using Service Account (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `employee-818f9`
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the following values and add them to `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

#### Option B: Using Application Default Credentials (Development)

For local development, you can use Firebase emulator or application default credentials.

### 3. Environment Variables

Create a `.env` file in the Backend directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=employee-818f9
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@employee-818f9.iam.gserviceaccount.com

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with Firebase ID token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Companies

- `POST /api/companies` - Create a company (Owner only)
- `GET /api/companies/my-company` - Get my company (Owner only)
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company (Owner only)
- `POST /api/companies/:id/invite` - Generate invitation token (Owner only)
- `POST /api/companies/accept-invitation` - Accept invitation

### Employees

- `GET /api/employees` - Get employees (with optional query params)
- `GET /api/employees/me` - Get my employee profile
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee status (Owner only)

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get tasks (with optional query params)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Screenshots

- `POST /api/screenshots` - Upload a screenshot
- `GET /api/screenshots` - Get screenshots (with optional query params)
- `GET /api/screenshots/:id/image` - Get screenshot image data
- `DELETE /api/screenshots/:id` - Delete screenshot

## Authentication

All protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Frontend Integration

The frontend should:
1. Use Firebase Client SDK to authenticate users
2. Get the ID token after login: `await user.getIdToken()`
3. Include the token in API requests: `Authorization: Bearer ${idToken}`

## Database

Currently, the backend uses an in-memory database for development. **For production, replace this with a real database** such as:
- MongoDB
- PostgreSQL
- Firebase Firestore
- MySQL

Update `config/database.js` to use your preferred database.

## Error Handling

All errors are handled consistently:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Success responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Role-Based Access Control

- **Owner**: Can create companies, invite employees, view all company data
- **Employee**: Can create tasks, upload screenshots, view own data

## Development Notes

- The database is in-memory and will reset on server restart
- Screenshots are stored as base64 strings (consider using Firebase Storage for production)
- Invitation tokens expire after 7 days
- CORS is configured for the frontend URL

## Production Considerations

1. Replace in-memory database with a real database
2. Use Firebase Storage for screenshots instead of base64
3. Add rate limiting
4. Add request validation
5. Set up proper logging
6. Configure environment variables securely
7. Add API documentation (Swagger/OpenAPI)
8. Set up monitoring and error tracking

## License

ISC


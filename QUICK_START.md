# Quick Start Guide

Get the Employee Work Monitor application running in 5 minutes!

## Prerequisites Check

- ✅ Node.js installed (v16+)
- ✅ Firebase project configured
- ✅ Service account JSON file in Backend folder

## Step-by-Step Setup

### 1. Backend Setup (Terminal 1)

```bash
cd Backend
npm install
npm run dev
```

**Expected output:**
```
✅ Firebase Admin SDK initialized successfully
🚀 Server is running on port 5000
```

### 2. Frontend Setup (Terminal 2)

```bash
cd Frontend
npm install
```

Create `.env` file in Frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Then start frontend:
```bash
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## First Time Usage

1. **Sign Up as Owner:**
   - Go to http://localhost:5173/signup
   - Select "Owner" role
   - Create account

2. **Create Company:**
   - After signup, create your company
   - Enter company name and description

3. **Invite Employee:**
   - Click "+ Invite" in Owner Dashboard
   - Copy the invitation link
   - Open in new browser/incognito
   - Sign up as Employee

4. **Start Tracking:**
   - Login as employee
   - Enter task description
   - Click "Start Tracking"
   - Grant screen capture permission
   - Screenshots capture automatically!

## Troubleshooting

**Backend won't start:**
- Check if port 5000 is available
- Verify service account JSON file exists
- Check console for Firebase errors

**Frontend can't connect:**
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Open browser console for errors

**Firebase errors:**
- Verify all Firebase env variables are set
- Check Firebase project is active
- Clear browser cache

## What's Connected?

✅ **Authentication:** Firebase Auth (Login/Signup)  
✅ **Backend API:** Express server with Firebase Admin  
✅ **Company Management:** Create companies, invite employees  
✅ **Task Tracking:** Create, view, delete tasks  
✅ **Screenshot Capture:** Automatic screenshots with screen sharing  
✅ **Role-Based Access:** Owner and Employee roles  

## Next Steps

- Check `Backend/README.md` for API documentation
- Review `Backend/ENV_SETUP.md` for environment variables

---

**Ready to go! 🎉**


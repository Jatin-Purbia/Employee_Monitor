# Environment Variables Setup

## Backend (.env file)

Create a `.env` file in the `Backend` directory with the following content:

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# MySQL Database
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

## Frontend (.env file)

Create a `.env` file in the `Frontend` directory with the following content:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

## Notes

- The backend will automatically use the service account JSON file if it exists in the Backend directory
- If the JSON file is not found, it will fall back to environment variables
- Make sure both `.env` files are created before starting the servers
- Never commit `.env` files to version control (they're already in `.gitignore`)


# Deployment Guide (LMS)

This guide outlines the steps to deploy the University Management System to a Staging or Production environment.

## 1. Prerequisites

- **Node.js**: v18+
- **Database**: MongoDB Atlas Cluster (or self-hosted MongoDB 6.0+)
- **Hosting**: Render, Vercel, AWS EC2, or DigitalOcean Droplet.

## 2. Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lms-production?retryWrites=true&w=majority
JWT_SECRET=complex_secret_key_here_at_least_32_chars
FRONTEND_URL=https://your-frontend-domain.com
```

> [!IMPORTANT]
> - `FRONTEND_URL`: Must match your deployed frontend domain exactly (no trailing slash) for CORS to work.
> - `MONGO_URI`: Ensure the user has read/write permissions.

## 3. Database Indices & Transactions

The system uses MongoDB Transactions for critical operations (Exam Generation).
- **Requirement:** MongoDB must be running as a **Replica Set** (Standard for Atlas). Transactions do NOT work on standalone instances.

## 4. Build & Run

### Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install --production
   ```
2. Start the server:
   ```bash
   npm start
   ```

### Frontend (Vite)
1. Configure API URL:
   - Create `.env.production` in `frontend/`.
   - Set `VITE_API_URL=https://your-backend-api.com`
2. Build the static files:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Serve the `dist/` folder using a static server (e.g., Nginx, Serve).

## 5. First-Time Setup

1. **Seed Data:**
   Run the seeder to create the initial Super Admin.
   ```bash
   cd backend
   npm run seed
   ```
   *Credentials:* `admin@university.com` / `admin123`

2. **Cron Jobs:**
   The backend runs internal cron jobs (Subscription checks). Ensure the backend process is kept alive (e.g., use PM2).
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "lms-backend"
   ```

## 6. Troubleshooting

- **CORS Error:** Check `FRONTEND_URL` in backend `.env` matches the browser's origin.
- **Attendance Error:** If upgrading from v0.9, drop the old 'attendances' collection as the schema has changed.

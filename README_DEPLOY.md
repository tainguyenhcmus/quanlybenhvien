# 🚀 Quick Deployment Guide

## Option 1: Docker (Easiest - All-in-One)

### Prerequisites
- Docker and Docker Compose installed

### Steps
```bash
# 1. Clone repository
git clone <your-repo-url>
cd QuanLyBenhVien

# 2. Update environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

cp frontend/.env.example frontend/.env.production
# Edit frontend/.env.production with your backend URL

# 3. Start all services
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5050
# Database: localhost:3306
```

---

## Option 2: Railway (Recommended for Beginners)

### Backend
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add MySQL database
5. Set environment variables (see DEPLOYMENT.md)
6. Deploy!

### Frontend
1. Go to [vercel.com](https://vercel.com)
2. Import Project from GitHub
3. Root Directory: `frontend`
4. Set `VITE_API_URL` to your Railway backend URL
5. Deploy!

---

## Option 3: Manual VPS Deployment

### 1. Database Setup
```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Import database
mysql -u root -p < newsql.sql
```

### 2. Backend Setup
```bash
cd backend
npm install --production
npm install -g pm2
pm2 start server.js --name backend
pm2 save
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
# Serve dist/ with nginx or serve
```

---

## Environment Variables

### Backend (.env)
```env
PORT=5050
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=QuanLyBenhVien
DB_PORT=3306
JWT_SECRET=your-secret-key
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Quick Commands

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy everything
./deploy.sh all

# Deploy only backend
./deploy.sh backend

# Deploy only frontend
./deploy.sh frontend
```

---

## Post-Deployment

1. ✅ Test backend: `curl https://your-backend.com/api/health`
2. ✅ Test frontend: Open in browser
3. ✅ Create admin account (use create-admin.js or SQL)
4. ✅ Test login functionality

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)


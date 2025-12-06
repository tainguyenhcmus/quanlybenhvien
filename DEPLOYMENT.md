# 🚀 Deployment Guide - Hệ Thống Quản Lý Bệnh Viện

Hướng dẫn deploy Frontend, Backend và Database lên production.

## 📋 Mục lục
1. [Database Deployment](#database-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)

---

## 🗄️ Database Deployment

### Option 1: MySQL Cloud (Recommended)
**Services:** AWS RDS, Google Cloud SQL, Azure Database, PlanetScale, Railway, Render

#### Steps:
1. **Create MySQL Database Instance**
   - Choose MySQL 8.0 or higher
   - Note down: Host, Port, Database name, Username, Password

2. **Run SQL Scripts**
   ```bash
   # Connect to your cloud database
   mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < newsql.sql
   
   # Or use MySQL Workbench/phpMyAdmin to import newsql.sql
   ```

3. **Update Environment Variables**
   - Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT` in backend `.env`

### Option 2: Local MySQL (Development)
```bash
# Install MySQL locally
# Import database
mysql -u root -p < newsql.sql
```

---

## 🔧 Backend Deployment

### Option 1: Railway (Recommended - Easy)
1. **Sign up at** [railway.app](https://railway.app)
2. **Create New Project**
3. **Add MySQL Service**
   - Click "New" → "Database" → "MySQL"
   - Copy connection details

4. **Add Node.js Service**
   - Click "New" → "GitHub Repo" → Select your repo
   - Set Root Directory: `backend`
   - Add Environment Variables (see below)
   - Railway auto-detects Node.js and runs `npm start`

5. **Environment Variables:**
   ```
   PORT=5050
   DB_HOST=<from MySQL service>
   DB_USER=<from MySQL service>
   DB_PASSWORD=<from MySQL service>
   DB_DATABASE=railway
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   ```

### Option 2: Render
1. **Sign up at** [render.com](https://render.com)
2. **Create Web Service**
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Add MySQL Database**
   - Create new MySQL database
   - Copy connection string

4. **Set Environment Variables** (same as Railway)

### Option 3: Heroku
1. **Install Heroku CLI**
2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add MySQL Add-on**
   ```bash
   heroku addons:create cleardb:ignite
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   cd backend
   git subtree push --prefix backend heroku main
   ```

### Option 4: VPS (DigitalOcean, AWS EC2, etc.)
1. **Setup Server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt-get install mysql-server
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd QuanLyBenhVien/backend
   npm install --production
   ```

3. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "benhvien-backend"
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5050;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended - Easy)
1. **Sign up at** [vercel.com](https://vercel.com)
2. **Import Project**
   - Connect GitHub repo
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Update API Configuration**
   - Edit `frontend/src/services/api.js` to use `import.meta.env.VITE_API_URL`

### Option 2: Netlify
1. **Sign up at** [netlify.com](https://netlify.com)
2. **Deploy Site**
   - Connect GitHub repo
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Option 3: GitHub Pages
1. **Update vite.config.js** (see below)
2. **Build and Deploy:**
   ```bash
   cd frontend
   npm run build
   # Use gh-pages package or GitHub Actions
   ```

### Option 4: VPS with Nginx
1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Setup Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-frontend-domain.com;
       root /path/to/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## 🔐 Environment Variables

### Backend (.env)
Create `backend/.env`:
```env
# Server
PORT=5050
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=QuanLyBenhVien
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

### Frontend (.env)
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-api-url.com
```

---

## 📝 Quick Start Commands

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm install
npm run build
# Serve dist/ folder
```

---

## ✅ Post-Deployment Checklist

- [ ] Database imported and running
- [ ] Backend API accessible at `/api/health`
- [ ] Frontend can connect to backend API
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL/HTTPS enabled (production)
- [ ] Admin account created
- [ ] Test login functionality

---

## 🆘 Troubleshooting

### Backend can't connect to database
- Check database credentials
- Verify database is accessible from backend server
- Check firewall rules

### Frontend can't reach backend
- Check CORS settings in backend
- Verify API URL in frontend
- Check network/firewall rules

### 404 errors on frontend routes
- Ensure server is configured for SPA (serve index.html for all routes)
- Check build output directory

---

## 📞 Support

For issues, check:
- Backend logs
- Frontend console
- Database connection status
- Network requests in browser DevTools


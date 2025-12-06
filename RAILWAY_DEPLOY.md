# 🚂 Railway Deployment Guide - Backend

Step-by-step guide to deploy your backend to Railway.

## 📋 Prerequisites

1. GitHub account with your code pushed to a repository
2. Railway account (sign up at [railway.app](https://railway.app))
3. Credit card (Railway offers $5 free credit monthly)

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub if prompted
5. Select your repository: `QuanLyBenhVien`

### Step 2: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Wait for MySQL to provision (takes 1-2 minutes)
4. Once created, click on the MySQL service
5. Go to the **"Variables"** tab
6. Copy these values (you'll need them later):
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLPORT`
   - `MYSQLDATABASE`

### Step 3: Import Database Schema

1. In the MySQL service, go to the **"Data"** tab
2. Click **"Connect"** to open MySQL console, OR
3. Use Railway CLI or MySQL client:
   ```bash
   # Install Railway CLI (optional)
   npm i -g @railway/cli
   railway login
   
   # Connect to MySQL
   railway connect mysql
   # Then import your SQL file
   mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < newsql.sql
   ```

   **OR use MySQL Workbench:**
   - Host: `$MYSQLHOST`
   - Port: `$MYSQLPORT`
   - Username: `$MYSQLUSER`
   - Password: `$MYSQLPASSWORD`
   - Database: `$MYSQLDATABASE`
   - Import `newsql.sql` file

### Step 4: Add Node.js Service (Backend)

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Select your repository again
3. Railway will auto-detect it's a Node.js project
4. **IMPORTANT:** Click on the service, go to **"Settings"** tab
5. Set **"Root Directory"** to: `backend`
6. Set **"Start Command"** to: `npm start` (should be auto-detected)
7. **IMPORTANT:** In Settings → Build, ensure **"Builder"** is set to **"Nixpacks"** (not Docker)

### Step 5: Configure Environment Variables

1. Click on your **Node.js service** (backend)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

   ```
   PORT=5050
   NODE_ENV=production
   
   DB_HOST=<MYSQLHOST from MySQL service>
   DB_USER=<MYSQLUSER from MySQL service>
   DB_PASSWORD=<MYSQLPASSWORD from MySQL service>
   DB_DATABASE=<MYSQLDATABASE from MySQL service>
   DB_PORT=<MYSQLPORT from MySQL service>
   
   JWT_SECRET=<generate-a-long-random-string-here-minimum-32-characters>
   ```

4. **To get MySQL variables:**
   - Go to MySQL service → Variables tab
   - Copy the values (they're already set by Railway)
   - Paste them into your Node.js service variables

5. **Generate JWT_SECRET:**
   ```bash
   # Run this in terminal to generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 6: Link MySQL to Backend Service

1. In your **Node.js service** (backend)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** → **"Reference from..."**
4. Select your **MySQL service**
5. Railway will automatically add references (you can use these instead of copying values)

### Step 7: Deploy

1. Railway will automatically deploy when you push to GitHub
2. OR click **"Deploy"** button in the dashboard
3. Watch the build logs in the **"Deployments"** tab
4. Wait for deployment to complete (usually 2-3 minutes)

### Step 8: Get Your Backend URL

1. Once deployed, go to **"Settings"** tab of your Node.js service
2. Scroll down to **"Networking"**
3. Click **"Generate Domain"** to get a public URL
4. Your backend will be available at: `https://your-service-name.up.railway.app`

### Step 9: Test Your Deployment

1. Test health endpoint:
   ```bash
   curl https://your-service-name.up.railway.app/api/health
   ```
   Should return: `{"status":"ok","time":"..."}`

2. Check logs:
   - Go to **"Deployments"** tab
   - Click on latest deployment
   - View logs to see if there are any errors

---

## 🔧 Troubleshooting

### Backend can't connect to database

**Problem:** Error: `ER_ACCESS_DENIED_ERROR` or connection timeout

**Solutions:**
1. Verify all database environment variables are correct
2. Make sure MySQL service is running (check status in Railway dashboard)
3. Check that you're using the correct variable names from MySQL service
4. Verify database name matches: `MYSQLDATABASE` value

### Port already in use

**Problem:** Error: `EADDRINUSE: address already in use`

**Solution:** Railway automatically sets `PORT` environment variable. Your code already uses `process.env.PORT || 5050`, so this should work. If not, remove the hardcoded port.

### Build fails

**Problem:** Build errors during deployment (e.g., `npm ci --only=production` error)

**Solutions:**
1. Check build logs in Railway dashboard
2. Ensure `package.json` has correct `start` script
3. Verify all dependencies are in `dependencies` (not just `devDependencies`)
4. Make sure Root Directory is set to `backend`
5. **If using yarn.lock:** Ensure Railway uses **Nixpacks** builder (not Docker)
   - Go to Settings → Build → Select "Nixpacks"
   - Nixpacks will auto-detect `yarn.lock` and use yarn
6. **If error persists:** The Dockerfile has been renamed to `Dockerfile.backup` to force Nixpacks usage

### Module not found errors

**Problem:** `Cannot find module 'xxx'`

**Solution:**
1. Check that all dependencies are listed in `package.json`
2. Railway runs `npm install` automatically
3. If using `yarn.lock`, Railway might use yarn instead

### CORS errors from frontend

**Problem:** Frontend can't connect to backend

**Solution:**
1. Update frontend API URL to your Railway backend URL
2. Check backend CORS configuration (should allow all origins in `server.js`)
3. Verify backend URL is accessible (test with curl)

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Railway sets this automatically) | `5050` |
| `NODE_ENV` | Environment mode | `production` |
| `DB_HOST` | MySQL host (from Railway MySQL service) | `containers-us-west-xxx.railway.app` |
| `DB_USER` | MySQL username (from Railway MySQL service) | `root` |
| `DB_PASSWORD` | MySQL password (from Railway MySQL service) | `xxx` |
| `DB_DATABASE` | Database name (from Railway MySQL service) | `railway` |
| `DB_PORT` | MySQL port (from Railway MySQL service) | `3306` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-long-random-string` |

---

## ✅ Post-Deployment Checklist

- [ ] MySQL database is running
- [ ] Database schema imported (`newsql.sql`)
- [ ] Backend service deployed successfully
- [ ] Environment variables configured
- [ ] Health endpoint working: `/api/health`
- [ ] Backend URL generated and accessible
- [ ] Logs show no errors
- [ ] Test API endpoints (if possible)
- [ ] Update frontend with new backend URL

---

## 🔗 Next Steps

After backend is deployed:

1. **Update Frontend:**
   - Set `VITE_API_URL` to your Railway backend URL
   - Deploy frontend to Vercel/Netlify

2. **Create Admin Account:**
   - Use `create-admin.js` script or SQL
   - Or create via API if you have an endpoint

3. **Monitor:**
   - Check Railway dashboard for usage
   - Monitor logs for errors
   - Set up alerts if needed

---

## 💡 Pro Tips

1. **Use Railway Variables Reference:**
   - Instead of copying MySQL credentials, use Railway's variable reference feature
   - This keeps them in sync automatically

2. **Custom Domain:**
   - You can add a custom domain in Railway settings
   - Railway provides free SSL certificates

3. **Database Backups:**
   - Railway MySQL includes automatic backups
   - Check "Data" tab → "Backups" section

4. **Logs:**
   - Always check logs when debugging
   - Railway keeps logs for 7 days (free tier)

5. **Resource Limits:**
   - Free tier: $5 credit/month
   - Monitor usage in Railway dashboard
   - Upgrade if needed

---

## 🆘 Need Help?

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check deployment logs in Railway dashboard

---

**Good luck with your deployment! 🚀**


# ⚡ Quick Setup - Railway Backend with Database

## ✅ Step 1: Set Environment Variables

Go to Railway → Your Backend Service → Variables tab

Add these variables (copy from `RAILWAY_ENV_VARS.txt`):

```
DB_HOST=ballast.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq
DB_DATABASE=railway
DB_PORT=35007
PORT=5050
NODE_ENV=production
JWT_SECRET=<generate-random-32-char-string>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Step 2: Import Database Schema

### Option A: Railway MySQL Console (Easiest)
1. Go to MySQL service → **"Data"** tab
2. Click **"Connect"** button
3. Copy entire contents of `newsql.sql`
4. Paste into MySQL console and execute

### Option B: MySQL Command Line
```bash
mysql -h ballast.proxy.rlwy.net -P 35007 -u root -p'LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq' railway < newsql.sql
```

### Option C: MySQL Workbench
- Host: `ballast.proxy.rlwy.net`
- Port: `35007`
- Username: `root`
- Password: `LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq`
- Default Schema: `railway`
- Import `newsql.sql` file

---

## ✅ Step 3: Redeploy Backend

1. After setting environment variables, Railway will auto-redeploy
2. OR click **"Redeploy"** button in Railway dashboard
3. Watch the deployment logs

---

## ✅ Step 4: Verify Connection

### Check Logs
In Railway → Backend Service → Deployments → Latest deployment logs

**Should see:**
```
✅ Connected to MySQL
🚀 Server chạy trên port 5050
```

**Should NOT see:**
```
❌ MySQL Connection Failed!
```

### Test Health Endpoint
```bash
# Replace with your Railway backend URL
curl https://your-backend-name.up.railway.app/api/health
```

Expected response:
```json
{"status":"ok","time":"2024-..."}
```

---

## 🔧 Troubleshooting

### Connection Failed Error

**Check:**
1. All environment variables are set correctly
2. Database name is `railway` (not `QuanLyBenhVien`)
3. Port is `35007` (not `3306`)
4. Host is `ballast.proxy.rlwy.net`

### Database doesn't exist

**Solution:** Import `newsql.sql` into the `railway` database

### Wrong credentials

**Solution:** Double-check the connection string:
```
mysql://root:LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq@ballast.proxy.rlwy.net:35007/railway
```

---

## 📝 Summary

✅ Database: `railway` on `ballast.proxy.rlwy.net:35007`  
✅ Backend: Set all environment variables  
✅ Import: Run `newsql.sql`  
✅ Test: Check `/api/health` endpoint  

---

**Need more help?** See `RAILWAY_DB_CONFIG.md` for detailed instructions.


# 🔧 Railway Database Configuration

## Your Railway MySQL Connection String
```
mysql://root:LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq@ballast.proxy.rlwy.net:35007/railway
```

## Environment Variables for Backend Service

Add these environment variables in your Railway backend service:

### Database Configuration
```
DB_HOST=ballast.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq
DB_DATABASE=railway
DB_PORT=35007
```

### Server Configuration
```
PORT=5050
NODE_ENV=production
```

### JWT Secret (Generate a new one)
```
JWT_SECRET=<generate-a-long-random-string-here>
```

To generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your **backend service** (Node.js service)
3. Go to **"Variables"** tab
4. Click **"+ New Variable"**
5. Add each variable one by one:
   - `DB_HOST` = `ballast.proxy.rlwy.net`
   - `DB_USER` = `root`
   - `DB_PASSWORD` = `LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq`
   - `DB_DATABASE` = `railway`
   - `DB_PORT` = `35007`
   - `PORT` = `5050`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `<your-generated-secret>`

---

## Next Steps

1. ✅ Set all environment variables in Railway
2. ✅ Import database schema (`newsql.sql`) into Railway MySQL
3. ✅ Redeploy backend service
4. ✅ Test connection: `curl https://your-backend-url.up.railway.app/api/health`

---

## Import Database Schema

You need to import your database schema. Options:

### Option 1: Railway MySQL Console
1. Go to MySQL service → **"Data"** tab
2. Click **"Connect"** to open MySQL console
3. Copy and paste contents of `newsql.sql`

### Option 2: MySQL Workbench / Command Line
```bash
mysql -h ballast.proxy.rlwy.net -P 35007 -u root -p'LdcGoKHHqIhNATjjVxgOZWnXyccpbSqq' railway < newsql.sql
```

### Option 3: Railway CLI
```bash
railway connect mysql
# Then in MySQL prompt:
source newsql.sql
```

---

## Verify Connection

After setting variables and redeploying, check logs:
- Should see: `✅ Connected to MySQL`
- Should NOT see: `❌ MySQL Connection Failed!`

Test health endpoint:
```bash
curl https://your-backend-url.up.railway.app/api/health
```


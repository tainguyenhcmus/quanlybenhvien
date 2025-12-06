# ⚡ Railway Quick Start - Backend Deployment

## 🎯 Quick Checklist

### 1. Setup Railway Project
- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Create new project → Deploy from GitHub
- [ ] Select your repository

### 2. Add MySQL Database
- [ ] Click "+ New" → "Database" → "Add MySQL"
- [ ] Wait for provisioning
- [ ] Copy database credentials from Variables tab

### 3. Import Database
- [ ] Connect to MySQL (use Railway console or MySQL Workbench)
- [ ] Import `newsql.sql` file

### 4. Add Backend Service
- [ ] Click "+ New" → "GitHub Repo"
- [ ] **Set Root Directory to: `backend`**
- [ ] Set Start Command: `npm start`

### 5. Configure Environment Variables
Add these in your Node.js service → Variables tab:

```
PORT=5050
NODE_ENV=production
DB_HOST=<from MySQL service>
DB_USER=<from MySQL service>
DB_PASSWORD=<from MySQL service>
DB_DATABASE=<from MySQL service>
DB_PORT=<from MySQL service>
JWT_SECRET=<generate-random-32-char-string>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy & Test
- [ ] Railway auto-deploys on push
- [ ] Get your URL from Settings → Networking
- [ ] Test: `curl https://your-url.up.railway.app/api/health`

---

## 🔗 Important URLs

- **Railway Dashboard:** [railway.app](https://railway.app)
- **Full Guide:** See `RAILWAY_DEPLOY.md`

---

## ⚠️ Common Issues

**Can't connect to database?**
→ Check all DB_* variables match MySQL service variables

**Build fails?**
→ Verify Root Directory is set to `backend`

**Port error?**
→ Railway sets PORT automatically, your code should work

---

**Need detailed steps?** Read `RAILWAY_DEPLOY.md` 📖


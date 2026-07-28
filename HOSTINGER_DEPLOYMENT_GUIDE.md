# Hostinger Deployment Guide for Eco Green Energy Solutions Website

## 🔧 Bug Fixes Applied

### Issue Fixed: 404 Logo Not Found Error
- **Problem**: `logo-white.webp` was referenced in `footer.ejs` but the actual file is `logo-white.png`
- **Solution**: Updated `views/partials/footer.ejs` to use the correct filename
- **Result**: All pages now load correctly with the logo displaying

---

## 📋 Pre-Deployment Checklist

### 1. **Set Up Environment Variables**
Create a `.env` file in the project root (copy from `.env.example`):

```bash
DB_HOST=your_hostinger_mysql_host
DB_PORT=3306
DB_USER=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
DB_NAME=eco_energy_solution_db
SESSION_SECRET=generate-a-secure-random-string-here
PORT=3000
```

**Important**: Never commit `.env` to version control!

### 2. **Database Setup**
- Create MySQL database named `eco_energy_solution_db` on Hostinger
- Run the SQL migrations:
  ```sql
  -- Execute database/schema.sql
  -- Execute database/admin_users_migration.sql
  ```

### 3. **Seed Admin User** (Optional)
```bash
npm run seed:admin
```

---

## 🚀 Deployment Steps on Hostinger

### Method 1: Using Git (Recommended)
1. Push code to a Git repository (GitHub, GitLab, etc.)
2. In Hostinger control panel:
   - Go to **Hosting → Git Repositories**
   - Add your repository URL
   - Set deployment branch to `main` or `master`
   - Configure auto-deployment to trigger on push

### Method 2: Using File Manager / FTP
1. Create a new application in Hostinger Node.js section
2. Upload all project files via FTP or File Manager
3. Create `.env` file in the root directory with your database credentials
4. Run npm install and start the application

### Method 3: Using SSH (Most Control)
```bash
# Connect via SSH
ssh username@your-hostinger-domain.com

# Navigate to project directory
cd ~/public_html/nodejs

# Clone repository
git clone your-repo-url .

# Install dependencies
npm install

# Create .env file
nano .env
# (Add your environment variables)

# Test the app
npm start

# Set up as background process with PM2
npm install -g pm2
pm2 start app.js --name "eco-green-energy"
pm2 startup
pm2 save
```

---

## ⚙️ Server Configuration

### Port Configuration
- **Development**: Port 3000 (default)
- **Hostinger**: May need to configure via control panel
- The app automatically uses environment variables or falls back to defaults

### Node.js Version
- **Minimum**: Node.js 18.0.0
- **Recommended**: Node.js 18+ or 20+

### Dependencies Installed
```json
- Express 4.16.1
- EJS 3.1.10 (Template Engine)
- MySQL2 3.22.4
- Express-session 1.18.1
- Express-mysql-session 3.0.3
- Bcryptjs 2.4.3
- Morgan 1.9.1
- Cookie-parser 1.4.4
- Dotenv 16.4.5
```

---

## 🧪 Testing Your Deployment

### Health Check Endpoint
```
https://your-domain.com/health
```
Should return: "✅ Server is running!"

### Test Routes
- Homepage: `https://your-domain.com/`
- Services: `https://your-domain.com/services`
- Projects: `https://your-domain.com/projects`
- About: `https://your-domain.com/about`
- Contact Form: `https://your-domain.com/contact`
- Quote Form: `https://your-domain.com/get-a-quote`
- Admin Panel: `https://your-domain.com/admin/login`

---

## 🔍 Troubleshooting

### 404 Errors on Static Assets
- ✅ Fixed! The logo-white.webp issue has been corrected
- Check that all images exist in `/public/images/`
- Ensure static middleware is properly configured in `app.js`

### Database Connection Errors
- Verify `.env` file credentials match Hostinger MySQL settings
- Check database exists and user has proper permissions
- Test connection: `mysql -h host -u user -p database`

### Session Issues
- Ensure MySQL session store table is created (done by express-mysql-session)
- Verify SESSION_SECRET is set in `.env`

### Application Won't Start
1. Check logs: `npm run dev` for local testing
2. Verify Node.js version: `node --version` (should be 18+)
3. Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📊 Project Structure

```
.
├── app.js                 # Main Express server
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── config/
│   └── db.js            # Database connection pool
├── controllers/          # Business logic
├── models/              # Database models
├── routes/              # API routes
├── views/               # EJS templates
│   ├── partials/        # Shared components (header, footer)
│   └── admin/           # Admin panel views
├── public/              # Static assets
│   ├── css/
│   ├── images/          # ✅ Images fixed (logo-white.png)
│   ├── js/
│   └── fonts/
└── database/            # SQL migrations
```

---

## 🔐 Security Notes

1. **Environment Variables**: Store sensitive data in `.env`, never in code
2. **Session Secret**: Generate strong random string for SESSION_SECRET
3. **HTTPS**: Ensure Hostinger SSL certificate is enabled
4. **Database**: Use strong MySQL passwords
5. **Admin Panel**: Change default admin credentials after first login

---

## 📞 Support

For Hostinger-specific issues:
- Visit: https://support.hostinger.com/
- Check: Hosting → Node.js Applications documentation
- Verify your Node.js version and allocated resources

For application issues:
- Check logs in Hostinger control panel
- Test locally before deploying
- Verify `.env` configuration

---

**Last Updated**: 2026-07-28
**Status**: ✅ All critical bugs fixed and ready for deployment

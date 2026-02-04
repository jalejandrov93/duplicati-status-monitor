# Deployment Guide

This guide covers deploying the Duplicati Backup Monitor to various hosting platforms.

## Table of Contents

1. [Vercel (Recommended)](#vercel-recommended)
2. [Docker](#docker)
3. [Traditional VPS (Ubuntu/Debian)](#traditional-vps)
4. [Windows Server](#windows-server)
5. [Railway](#railway)
6. [Render](#render)

---

## Vercel (Recommended)

Vercel offers the easiest deployment with automatic HTTPS, CDN, and serverless functions.

### Prerequisites

- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account (or accessible MongoDB instance)

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/duplicati-monitor.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel dashboard, go to Settings > Environment Variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/duplicati
```

### Step 4: Deploy

Click "Deploy" and wait for deployment to complete.

Your app will be live at: `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Docker

Deploy using Docker containers for any platform.

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

For local development with MongoDB:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/duplicati
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Update `next.config.mjs`

Add for standalone build:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
};

export default nextConfig;
```

---

## Traditional VPS (Ubuntu/Debian)

Deploy to your own server with full control.

### Prerequisites

- Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name (optional)

### Step 1: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Install MongoDB

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/duplicati-monitor
cd /var/www/duplicati-monitor

# Clone repository
git clone https://github.com/yourusername/duplicati-monitor.git .

# Install dependencies
npm install

# Create environment file
sudo nano .env.local
```

Add:
```env
MONGODB_URI=mongodb://localhost:27017/duplicati
```

### Step 4: Build Application

```bash
npm run build
```

### Step 5: Setup PM2 (Process Manager)

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start npm --name "duplicati-monitor" -- start

# Enable startup script
pm2 startup systemd
pm2 save
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/duplicati-monitor
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/duplicati-monitor /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Maintenance Commands

```bash
# View logs
pm2 logs duplicati-monitor

# Restart application
pm2 restart duplicati-monitor

# Update application
cd /var/www/duplicati-monitor
git pull
npm install
npm run build
pm2 restart duplicati-monitor
```

---

## Windows Server

Deploy on Windows Server with IIS.

### Prerequisites

- Windows Server 2016+
- IIS installed
- Node.js 18+
- MongoDB installed or accessible

### Step 1: Install Node.js

Download and install from [nodejs.org](https://nodejs.org)

### Step 2: Install IISNode

Download from [GitHub](https://github.com/Azure/iisnode/releases)

### Step 3: Setup Application

```powershell
# Clone repository
cd C:\inetpub\wwwroot
git clone https://github.com/yourusername/duplicati-monitor.git

# Install dependencies
cd duplicati-monitor
npm install

# Create .env.local
notepad .env.local
```

Add:
```env
MONGODB_URI=mongodb://localhost:27017/duplicati
```

```powershell
# Build
npm run build
```

### Step 4: Configure IIS

1. Open IIS Manager
2. Add new website
3. Set physical path to `C:\inetpub\wwwroot\duplicati-monitor`
4. Set binding to port 80 or 443
5. Configure URL Rewrite for Next.js

### Step 5: Alternative - Use PM2 on Windows

```powershell
# Install PM2
npm install -g pm2
npm install -g pm2-windows-startup

# Configure startup
pm2-startup install

# Start application
pm2 start npm --name "duplicati-monitor" -- start
pm2 save
```

---

## Railway

Simple deployment with Railway.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login and Initialize

```bash
railway login
railway init
```

### Step 3: Add MongoDB

```bash
railway add --plugin mongodb
```

### Step 4: Deploy

```bash
railway up
```

Railway will automatically:
- Build your application
- Set up environment variables
- Provide a public URL

---

## Render

Deploy on Render with free tier.

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service

- **Name**: duplicati-monitor
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 3: Add Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
```

### Step 4: Deploy

Click "Create Web Service"

---

## MongoDB Atlas Setup

For all deployments, MongoDB Atlas provides a free cloud database:

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for all)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/duplicati
   ```

---

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] Application accessible via URL
- [ ] HTTPS configured (production)
- [ ] Webhook endpoint accessible from Duplicati
- [ ] Auto-refresh working
- [ ] Dark mode toggle working
- [ ] Charts rendering correctly
- [ ] CSV export functional
- [ ] Error logging configured

---

## Monitoring & Maintenance

### Application Logs

**Vercel**: View in dashboard > Logs
**Docker**: `docker-compose logs -f`
**PM2**: `pm2 logs duplicati-monitor`

### Database Backups

```bash
# MongoDB dump
mongodump --uri="mongodb://localhost:27017/duplicati" --out=/backup/$(date +%Y%m%d)

# MongoDB restore
mongorestore --uri="mongodb://localhost:27017/duplicati" /backup/20240115
```

### Updates

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart (PM2)
pm2 restart duplicati-monitor

# Restart (Docker)
docker-compose restart
```

---

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

- Verify MongoDB is running: `systemctl status mongod`
- Check connection string format
- Verify network firewall rules
- Check MongoDB Atlas IP whitelist

### Performance Issues

- Enable Redis caching
- Optimize MongoDB indexes
- Use CDN for static assets
- Enable Next.js image optimization

---

## Security Recommendations

1. **Use HTTPS**: Always in production
2. **Secure MongoDB**: Enable authentication, use strong passwords
3. **Environment Variables**: Never commit `.env` files
4. **API Keys**: Implement webhook authentication
5. **Rate Limiting**: Prevent abuse
6. **Regular Updates**: Keep dependencies updated
7. **Backup Data**: Regular MongoDB backups
8. **Monitor Logs**: Watch for suspicious activity

---

## Support

For deployment issues:
- Check application logs first
- Verify environment variables
- Test MongoDB connection
- Review platform-specific documentation

Happy deploying! 🚀

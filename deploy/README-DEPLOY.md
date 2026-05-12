# INFERA Finance AI Global - VPS Deployment Guide

## Server Details
- IP: 91.98.166.125
- Port: 4119
- Path: /var/www/platforms/infera-finance-ai-global
- Domain: www.InferaFinanceGlobal.com

## Step 1: Build the Project
```bash
npm run build
```

## Step 2: Upload to VPS
```bash
# From your local machine, upload these folders:
scp -r dist/ root@91.98.166.125:/var/www/platforms/infera-finance-ai-global/
scp -r server/ root@91.98.166.125:/var/www/platforms/infera-finance-ai-global/
scp -r shared/ root@91.98.166.125:/var/www/platforms/infera-finance-ai-global/
scp package.json root@91.98.166.125:/var/www/platforms/infera-finance-ai-global/
scp package-lock.json root@91.98.166.125:/var/www/platforms/infera-finance-ai-global/
```

## Step 3: On VPS - Install Dependencies
```bash
ssh root@91.98.166.125
cd /var/www/platforms/infera-finance-ai-global
npm install --production
```

## Step 4: Create Systemd Service
```bash
sudo nano /etc/systemd/system/infera-infera-finance-ai-global.service
```

Paste this content:
```ini
[Unit]
Description=INFERA Finance AI Global
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/platforms/infera-finance-ai-global
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=4119
Environment=DATABASE_URL=your_database_url_here

[Install]
WantedBy=multi-user.target
```

## Step 5: Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable infera-infera-finance-ai-global
sudo systemctl start infera-infera-finance-ai-global
sudo systemctl status infera-infera-finance-ai-global
```

## Step 6: Configure Nginx (Reverse Proxy)
```bash
sudo nano /etc/nginx/sites-available/inferafinanceglobal.com
```

Paste:
```nginx
server {
    listen 80;
    server_name www.InferaFinanceGlobal.com InferaFinanceGlobal.com;

    location / {
        proxy_pass http://127.0.0.1:4119;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/inferafinanceglobal.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d www.InferaFinanceGlobal.com -d InferaFinanceGlobal.com
```

## Step 8: Verify
Visit: https://www.InferaFinanceGlobal.com

#!/bin/bash
# INFERA Finance AI Global - One-Click Deploy Script
# Run this on your local machine or any machine with SSH access

SERVER="root@91.98.166.125"
APP_PATH="/var/www/platforms/infera-finance-ai-global"
PORT=4119

echo "=== INFERA Finance AI Global Deployment ==="

# Create directory on server
ssh $SERVER "mkdir -p $APP_PATH"

# Upload files
echo "Uploading files..."
rsync -avz --progress dist/ $SERVER:$APP_PATH/dist/
rsync -avz --progress server/ $SERVER:$APP_PATH/server/
rsync -avz --progress shared/ $SERVER:$APP_PATH/shared/
scp package.json package-lock.json $SERVER:$APP_PATH/

# Install and start
echo "Installing dependencies and starting service..."
ssh $SERVER << 'ENDSSH'
cd /var/www/platforms/infera-finance-ai-global
npm install --production

# Create systemd service
cat > /etc/systemd/system/infera-finance.service << 'EOF'
[Unit]
Description=INFERA Finance AI Global
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/platforms/infera-finance-ai-global
ExecStart=/usr/bin/node dist/index.cjs
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=4119

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable infera-finance
systemctl restart infera-finance

# Setup Nginx
cat > /etc/nginx/sites-available/inferafinance << 'EOF'
server {
    listen 80;
    server_name www.InferaFinanceGlobal.com InferaFinanceGlobal.com;
    location / {
        proxy_pass http://127.0.0.1:4119;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/inferafinance /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d www.InferaFinanceGlobal.com -d InferaFinanceGlobal.com --non-interactive --agree-tos -m admin@inferafinanceglobal.com || true

echo "=== Deployment Complete! ==="
echo "Visit: https://www.InferaFinanceGlobal.com"
ENDSSH

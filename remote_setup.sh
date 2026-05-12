#!/bin/bash
cd /var/www/platforms/infera-finance-ai-global

# Install deps
npm i --omit=dev

# Create service
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

# Nginx config
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

echo "=== DEPLOYMENT COMPLETE ==="
systemctl status infera-finance --no-pager

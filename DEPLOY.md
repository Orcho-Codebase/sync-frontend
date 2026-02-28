# Deploying sync-frontend to Google Cloud VM

This guide covers deploying the app to your GCP VM (Ubuntu 24.04, Nginx, static IP `136.113.80.118`).

## Architecture

- **Frontend**: React SPA built with Vite, served as static files
- **Backend**: Express 5 API on port 5000
- **Database**: PostgreSQL (required)
- **Reverse proxy**: Nginx on ports 80/443

## 1. Database Setup

You need PostgreSQL. Two options:

### Option A: Cloud SQL (recommended)

1. In GCP Console → SQL → Create Instance → PostgreSQL
2. Choose a region near your VM
3. Create a database and user
4. Note the connection string: `postgresql://user:password@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE`
5. For VM access, use the public IP of the Cloud SQL instance or configure Private IP

### Option B: PostgreSQL on the same VM

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser -P daniel   # set a password
sudo -u postgres createdb -O daniel sync_db
```

Connection string: `postgresql://daniel:YOUR_PASSWORD@localhost:5432/sync_db`

## 2. VM Setup

SSH into your VM:

```bash
ssh daniel@136.113.80.118
```

### Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should show v20.x
```

### Clone and build

```bash
cd /home/daniel
git clone <your-repo-url> sync-frontend
cd sync-frontend
```

### Environment

```bash
cp .env.example .env
nano .env   # or vim
```

Set at minimum:

```
DATABASE_URL=postgresql://user:password@localhost:5432/sync_db
PORT=5000
NODE_ENV=production
```

### Build and run migrations

```bash
npm ci
npm run build
DATABASE_URL="your-url" npm run db:push
```

### Install and enable systemd service

```bash
sudo cp deploy/sync-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sync-frontend
sudo systemctl start sync-frontend
sudo systemctl status sync-frontend
```

## 3. Nginx Configuration

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/sync-frontend
# Edit server_name if you have a domain:
# sudo nano /etc/nginx/sites-available/sync-frontend
sudo ln -sf /etc/nginx/sites-available/sync-frontend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Verify

- Open `http://136.113.80.118` in a browser
- API: `http://136.113.80.118/api/integrations`

## 5. HTTPS (optional)

If you have a domain pointing to `136.113.80.118`:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 6. Updating the app

```bash
cd /home/daniel/sync-frontend
git pull
npm ci
npm run build
npm run db:push   # if schema changed
sudo systemctl restart sync-frontend
```

## Troubleshooting

| Issue | Check |
|-------|------|
| 502 Bad Gateway | `sudo systemctl status sync-frontend` — is the app running? |
| Database errors | Verify `DATABASE_URL` in `.env` and that PostgreSQL is running |
| Port in use | `sudo lsof -i :5000` |
| Logs | `journalctl -u sync-frontend -f` |

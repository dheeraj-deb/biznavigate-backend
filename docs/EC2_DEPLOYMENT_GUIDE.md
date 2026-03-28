# BizNavigate Backend — AWS EC2 Deployment Guide (PM2 + Docker Kafka)

> **Approach:** NestJS runs directly on the host with PM2 (no Docker build = no disk space issues).
> Kafka + Zookeeper run via Docker Compose using pre-built images (no build step).

---

## Architecture Overview

```
EC2 Instance
├── NestJS app  ──  managed by PM2  (port 3000)
├── Nginx        ──  reverse proxy   (port 80 / 443)
└── Docker
    ├── Kafka        (localhost:9093)
    ├── Zookeeper
    └── Kafka UI     (port 8082)

External:
├── PostgreSQL  (RDS / Supabase / Neon)
├── MongoDB     (Atlas / DocDB)
└── Redis       (ElastiCache / Upstash)
```

---

## Prerequisites

EC2 Security Group — inbound rules needed:

| Port | Source | Purpose |
|------|--------|---------|
| 22 | Your IP only | SSH |
| 80 | 0.0.0.0/0 | HTTP (Nginx) |
| 443 | 0.0.0.0/0 | HTTPS |
| 8082 | Your IP only | Kafka UI (optional) |

---

## Step 1 — Connect to EC2

```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 2 — Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # should print v20.x.x
npm -v
```

---

## Step 3 — Install Yarn and PM2

```bash
sudo npm install -g yarn pm2
```

---

## Step 4 — Install Docker (for Kafka only)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt install -y docker-compose-plugin
```

---

## Step 5 — Clone Your Repository

```bash
git clone https://github.com/your-org/biznavigate-backend.git
cd biznavigate-backend
```

> **Or copy from your local machine:**
> ```bash
> # Run on YOUR local machine
> scp -i your-key.pem -r ./biznavigate-backend ubuntu@<ec2-ip>:~/
> ```

---

## Step 6 — Set Up Environment Variables

```bash
cp .env.example .env
nano .env
```

Key values to fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `MONGODB_URI` — your MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET`, `ENCRYPTION_KEY`
- `KAFKA_BROKERS=localhost:9093`  ← Kafka runs on the same host
- WhatsApp, Facebook, AWS S3, Gemini credentials

---

## Step 7 — Install Dependencies and Build

```bash
# Install all packages
yarn install --frozen-lockfile

# Generate Prisma client
npx prisma generate

# Build the NestJS app
yarn build

# Run DB migrations
npx prisma migrate deploy
```

---

## Step 8 — Start Kafka with Docker Compose

```bash
# Start Kafka + Zookeeper + Kafka UI (pulls pre-built images, no build)
docker compose up -d

# Check they're running
docker compose ps

# Tail Kafka logs to confirm it's ready
docker compose logs -f kafka
```

Wait until you see `[KafkaServer] started` in the Kafka logs, then press `Ctrl+C`.

---

## Step 9 — Start the App with PM2

```bash
# Create logs directory
mkdir -p logs

# Start the app using the ecosystem config
pm2 start ecosystem.config.js --env production

# Save the PM2 process list so it survives reboots
pm2 save

# Register PM2 as a system service (run the command it prints)
pm2 startup
# → It will print a command like: sudo env PATH=... pm2 startup systemd ...
# → Copy and run that command
```

**Check the app is running:**

```bash
pm2 status
pm2 logs biznavigate --lines 50
```

---

## Step 10 — Set Up Nginx as Reverse Proxy

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/biznavigate
```

Paste this config (replace `your-domain.com` with your domain or EC2 IP):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/biznavigate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
```

---

## Step 11 — Enable HTTPS (if you have a domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Step 12 — Verify

```bash
# App health check
curl http://localhost:3000/api/docs

# Via Nginx
curl http://your-domain.com/api/docs
```

Open in browser:
- **Swagger:** `https://your-domain.com/api/docs`
- **Kafka UI:** `http://<ec2-ip>:8082`

---

## Updating the App

```bash
cd ~/biznavigate-backend

# Pull latest code
git pull origin main

# Install any new packages
yarn install --frozen-lockfile

# Rebuild
yarn build

# Apply any new migrations
npx prisma migrate deploy

# Reload PM2 (zero-downtime restart)
pm2 reload biznavigate
```

---

## Useful Commands

```bash
# PM2
pm2 status                        # View all running processes
pm2 logs biznavigate              # Tail app logs
pm2 logs biznavigate --lines 100  # Last 100 lines
pm2 restart biznavigate           # Restart app
pm2 stop biznavigate              # Stop app
pm2 delete biznavigate            # Remove from PM2

# Kafka (Docker)
docker compose ps                 # Check container status
docker compose logs -f kafka      # Kafka logs
docker compose restart kafka      # Restart Kafka
docker compose down               # Stop Kafka stack
docker compose up -d              # Start Kafka stack

# Prisma
npx prisma migrate deploy         # Run pending migrations
npx prisma studio                 # Open DB GUI (runs on port 5555)
```

---

## Troubleshooting

**App won't start — check logs:**
```bash
pm2 logs biznavigate --lines 100
```

**`Cannot find module` errors after build:**
```bash
# Rebuild with fresh install
rm -rf dist node_modules
yarn install --frozen-lockfile
yarn build
pm2 restart biznavigate
```

**Kafka connection refused:**
- Make sure Docker Compose is running: `docker compose ps`
- Make sure `KAFKA_BROKERS=localhost:9093` is in your `.env`
- Wait ~30 seconds after starting Kafka before starting the app

**Port 3000 already in use:**
```bash
sudo lsof -i :3000
# Kill the process or change PORT in .env, then restart PM2
```

**Out of disk space:**
```bash
# Clean up unused Docker images
docker system prune -a
# Check disk usage
df -h
```

---

## Production Checklist

- [ ] `NODE_ENV=production` in `.env`
- [ ] `KAFKA_BROKERS=localhost:9093` in `.env`
- [ ] `ALLOWED_ORIGINS` set to your actual frontend URL(s)
- [ ] HTTPS enabled via Certbot
- [ ] `pm2 save` and `pm2 startup` done (survives reboots)
- [ ] `docker compose up -d` runs on reboot (Docker auto-restarts containers with `restart: unless-stopped`)
- [ ] Port 8082 (Kafka UI) restricted to your IP in EC2 Security Group
- [ ] `private.pem` and `public.pem` present in project root
- [ ] `.env` is NOT committed to Git

---

*Generated for BizNavigate Backend — March 2026*

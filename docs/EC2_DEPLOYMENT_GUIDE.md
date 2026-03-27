# BizNavigate Backend — AWS EC2 Deployment Guide

> **Stack:** NestJS · PostgreSQL (external) · MongoDB (external) · Redis (external) · Kafka (Docker) · AWS S3
> **Method:** Docker Compose on EC2 (recommended for this stack)

---

## Prerequisites

Before starting, make sure you have:

- An EC2 instance running **Ubuntu 22.04 LTS** (t3.medium or larger recommended)
- SSH access to the instance (your `.pem` key)
- Security Group with the following **inbound rules** open:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP only | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (Nginx) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (Nginx + SSL) |
| 3000 | TCP | 0.0.0.0/0 | NestJS app (or keep closed and use Nginx) |
| 9093 | TCP | Your IP only | Kafka (optional, for external tools) |
| 8082 | TCP | Your IP only | Kafka UI (optional) |

- Your external database connection strings ready (PostgreSQL, MongoDB, Redis)

---

## Step 1 — Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 2 — Install Docker & Docker Compose

Run the following on your EC2 instance:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need sudo each time)
sudo usermod -aG docker $USER

# Apply group change without logout
newgrp docker

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify both are installed
docker --version
docker compose version
```

---

## Step 3 — Install Git and Clone Your Repo

```bash
sudo apt install -y git

# Clone your repository
git clone https://github.com/your-org/biznavigate-backend.git
cd biznavigate-backend
```

> **Alternative:** If you want to copy files directly from your local machine instead of using Git:
>
> ```bash
> # Run this on your LOCAL machine (not EC2)
> scp -i your-key.pem -r ./biznavigate-backend ubuntu@<ec2-ip>:~/biznavigate-backend
> ```

---

## Step 4 — Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit it with your actual values
nano .env
```

Fill in all the required values — especially:
- `DATABASE_URL` (your PostgreSQL connection string)
- `MONGODB_URI` (your MongoDB connection string)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET`, `ENCRYPTION_KEY`
- WhatsApp, Facebook, and AWS credentials

**⚠️ Important:** Make sure `KAFKA_BROKERS` is NOT set in `.env` (or set to `localhost:9093`). The `docker-compose.yml` automatically overrides it to `kafka:29092` for internal Docker networking.

---

## Step 5 — Verify RSA Key Files

Your app uses RSA keys for JWT. Make sure these files exist in the project root:

```bash
ls -la private.pem public.pem
```

If they're missing, generate new ones:

```bash
# Generate RSA private key
openssl genpkey -algorithm RSA -out private.pem -pkcs8 -pkeyopt rsa_keygen_bits:2048

# Extract public key
openssl rsa -pubout -in private.pem -out public.pem
```

---

## Step 6 — Build and Start the Application

```bash
# Build the Docker image and start all services
docker compose up -d --build

# Watch logs to verify everything starts correctly
docker compose logs -f app
```

The first startup may take 2–3 minutes as Docker builds the NestJS image and Kafka initializes.

**Check that everything is running:**

```bash
docker compose ps
```

You should see all containers with status `Up`:
- `biznavigate-app`
- `biznavigate-kafka`
- `biznavigate-zookeeper`
- `biznavigate-kafka-ui`

---

## Step 7 — Run Database Migrations

Migrations run automatically on startup (see the `CMD` in `Dockerfile`). To run them manually:

```bash
docker compose exec app npx prisma migrate deploy
```

---

## Step 8 — Set Up Nginx as a Reverse Proxy (Recommended)

Nginx handles HTTPS termination and routes traffic to your NestJS app.

```bash
# Install Nginx
sudo apt install -y nginx

# Create site config
sudo nano /etc/nginx/sites-available/biznavigate
```

Paste the following (replace `your-domain.com` with your actual domain or EC2 IP):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase body size limit for file uploads (matches NestJS 50mb limit)
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
# Enable the site
sudo ln -s /etc/nginx/sites-available/biznavigate /etc/nginx/sites-enabled/

# Test the config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## Step 9 — Enable HTTPS with Let's Encrypt (Recommended)

> Skip this step if you don't have a domain name yet. You can use your EC2 public IP for testing.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot auto-renews — verify the timer is active
sudo systemctl status certbot.timer
```

---

## Step 10 — Verify the Deployment

```bash
# Check app is responding
curl http://localhost:3000/api/docs

# Check via Nginx (using domain or EC2 public IP)
curl http://your-domain.com/api/docs
```

Open in browser:
- **Swagger API Docs:** `https://your-domain.com/api/docs`
- **Kafka UI:** `http://<ec2-ip>:8082` (keep this behind a VPN or IP whitelist in production)

---

## Useful Commands

```bash
# View logs for the app
docker compose logs -f app

# View logs for Kafka
docker compose logs -f kafka

# Restart only the app (e.g. after a config change)
docker compose restart app

# Stop everything
docker compose down

# Stop and remove all volumes (⚠️ deletes Kafka data)
docker compose down -v

# Open a shell inside the running app container
docker compose exec app sh

# Run Prisma Studio (database GUI)
docker compose exec app npx prisma studio
```

---

## Updating the Application

When you push new code and want to redeploy:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart only the app container (Kafka keeps running)
docker compose up -d --build app

# Check logs
docker compose logs -f app
```

---

## Troubleshooting

**App container keeps restarting:**
```bash
docker compose logs app --tail=50
```
Usually this means a missing env variable or a database connection issue.

**Kafka connection errors:**
Make sure the app container has `KAFKA_BROKERS=kafka:29092` (the Docker Compose file sets this automatically). The app should NOT try to connect to `localhost:9093` from inside Docker.

**Prisma migration fails:**
```bash
docker compose exec app npx prisma migrate status
docker compose exec app npx prisma migrate deploy
```

**Port 3000 already in use:**
```bash
sudo lsof -i :3000
# Kill the conflicting process or change PORT in .env
```

**Out of disk space (common with Docker):**
```bash
# Remove unused images and containers
docker system prune -a
```

---

## Production Checklist

- [ ] All `.env` values filled in correctly
- [ ] `NODE_ENV=production` is set
- [ ] `ALLOWED_ORIGINS` is set to your actual frontend URL(s)
- [ ] HTTPS is enabled via Certbot
- [ ] Port 3000 is closed in EC2 Security Group (traffic goes through Nginx on 443)
- [ ] Port 8082 (Kafka UI) is restricted to your IP only
- [ ] Port 9093 (Kafka) is restricted to your IP only
- [ ] `private.pem` and `public.pem` are present and not committed to Git
- [ ] `.env` is in `.gitignore` and not committed to Git
- [ ] Automated backups configured for your external databases
- [ ] EC2 instance has at least **4GB RAM** (Kafka + NestJS is memory-heavy)

---

*Generated for BizNavigate Backend — March 2026*

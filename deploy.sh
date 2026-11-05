# 1. Buat folder ssl dan generate sertifikat SSL untuk IP 192.168.0.31
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=BNI/OU=IT/CN=192.168.0.31" \
  -addext "subjectAltName=IP:192.168.0.31,DNS:bni-monitoring"

# 2. Buat konfigurasi Nginx Reverse Proxy (HTTP to HTTPS Redirect + SSL Terminate)
cat << 'EOF' > nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;

    upstream backend_app {
        server app:3000;
        keepalive 32;
    }

    # Port 80 (HTTP) -> Otomatis Redirect ke HTTPS
    server {
        listen 80;
        server_name _;
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Port 443 (HTTPS)
    server {
        listen 443 ssl;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        client_max_body_size 50M;

        location / {
            proxy_pass http://backend_app;
            proxy_http_version 1.1;

            # Dukungan WebSocket & SSE
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

# 3. Perbarui docker-stack.yml dengan Nginx SSL Proxy
cat << 'EOF' > docker-stack.yml
version: '3.8'

services:
  # Nginx SSL Proxy (Membuka port 80 & 443)
  proxy:
    image: nginx:alpine
    ports:
      - target: 80
        published: 80
        protocol: tcp
        mode: ingress
      - target: 443
        published: 443
        protocol: tcp
        mode: ingress
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - infra-overlay-net
    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s

  # Aplikasi Backend (3 Replika High Availability)
  app:
    image: ivandhebel/core-infra-monitor-v1:latest
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - infra-overlay-net
    deploy:
      mode: replicated
      replicas: 3
      endpoint_mode: vip
      restart_policy:
        condition: on-failure
        delay: 5s

networks:
  infra-overlay-net:
    driver: overlay
    attachable: true
EOF

# 4. Perbarui Dockerfile dan pastikan file server.ts bersih dari dev vite
sed -i "s/import { createServer as createViteServer } from 'vite';//g" server.ts
sed -i "s/const vite = await createViteServer/const { createServer } = await import('vite'); const vite = await createServer/g" server.ts

cat << 'EOF' > Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm install --legacy-peer-deps react-is
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
RUN chmod -R 755 /app

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
EOF

# 5. Build image aplikasi
sudo docker build --no-cache -t ivandhebel/core-infra-monitor-v1:latest .

# 6. Buka port 80 dan 443 di Firewall (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# 7. Bersihkan stack lama dan deploy stack HTTPS baru
docker stack rm infra-v1
sleep 5
docker stack deploy -c docker-stack.yml infra-v1



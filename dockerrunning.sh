sudo cat << 'EOF' > Dockerfile
# Multi-stage production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
USER node
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
EOF


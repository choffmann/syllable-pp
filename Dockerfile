# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build arg for version
ARG VERSION=develop

# Build with version
RUN VERSION=${VERSION} pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Inline nginx config
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index taskpane.html;

    location / {
        try_files $uri $uri/ /taskpane.html;
    }

    location ~* \.wasm$ {
        types { application/wasm wasm; }
        default_type application/wasm;
    }

    location ~* \.(js|css|png|ico|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

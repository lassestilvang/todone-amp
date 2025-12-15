# Deployment Guide

Complete guide for deploying Todone to production.

## Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Performance tested
- [ ] Mobile responsiveness verified

## Environment Variables

Create `.env.production` file with:

```env
# OAuth Configuration (optional - for integrations)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
VITE_OUTLOOK_OAUTH_CLIENT_ID=your_outlook_client_id
VITE_SLACK_OAUTH_CLIENT_ID=your_slack_client_id
VITE_GITHUB_OAUTH_CLIENT_ID=your_github_client_id

# Optional: API endpoints (if using backend)
VITE_API_URL=https://api.todone.app
VITE_AUTH_URL=https://auth.todone.app
```

**Note:** Most environment variables are optional. Todone works without integrations.

## Build for Production

### Local Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

Build output in `dist/` directory:
- `index.html` - Main app file
- `assets/` - JavaScript bundles and CSS

### Build Size

Expected bundle sizes:
- **Main JS** - ~220 KB (54 KB gzipped)
- **CSS** - ~73 KB (10.8 KB gzipped)
- **Editor** - ~356 KB lazy loaded (110 KB gzipped)
- **Total gzip** - ~175 KB initial

## Deployment Platforms

### Vercel (Recommended)

Easiest deployment with optimal performance.

#### Option 1: GitHub Integration

1. Push to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Configure project settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add environment variables (if needed)
7. Click "Deploy"

#### Option 2: CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# View deployment
vercel ls
```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify

Simple deployment with continuous integration.

#### Option 1: GitHub Integration

1. Go to https://netlify.com
2. Click "New site from Git"
3. Select GitHub and your repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (if needed)
6. Click "Deploy site"

#### Option 2: CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod --dir dist
```

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Self-Hosted

#### Static Hosting (Nginx, Apache)

1. Build the app:
   ```bash
   npm run build
   ```

2. Copy `dist/` contents to web server:
   ```bash
   scp -r dist/* user@server:/var/www/todone
   ```

3. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name todone.example.com;
       root /var/www/todone;
       index index.html;

       # SPA routing - all requests go to index.html
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # No cache for HTML
       location ~* \.html$ {
           expires -1;
           add_header Cache-Control "public, must-revalidate, proxy-revalidate";
       }

       # GZIP compression
       gzip on;
       gzip_types text/plain text/css text/javascript application/javascript;
   }
   ```

4. Enable HTTPS with Let's Encrypt:
   ```bash
   certbot --nginx -d todone.example.com
   ```

#### Docker Deployment

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install simple HTTP server
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:

```bash
# Build image
docker build -t todone:latest .

# Run container
docker run -p 3000:3000 todone:latest

# Push to registry
docker tag todone:latest registry.example.com/todone:latest
docker push registry.example.com/todone:latest
```

#### Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todone
spec:
  replicas: 3
  selector:
    matchLabels:
      app: todone
  template:
    metadata:
      labels:
        app: todone
    spec:
      containers:
      - name: todone
        image: registry.example.com/todone:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: todone-service
spec:
  selector:
    app: todone
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml
```

## Post-Deployment

### Verification

1. **Check deployment status**
   - Visit your deployed URL
   - Verify app loads correctly
   - Test basic functionality

2. **Test all features**
   - Create task
   - Add subtask
   - Create project
   - Add label
   - Test quick add
   - Test keyboard shortcuts

3. **Check console for errors**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Test on mobile**
   - Use responsive design mode
   - Test on actual device if possible

### Monitoring

#### Vercel
- Dashboard: https://vercel.com/dashboard
- Automatic performance monitoring
- Real-time logs and analytics

#### Netlify
- Dashboard: https://app.netlify.com
- Deploy logs visible on dashboard
- Analytics available

#### Self-Hosted
- Set up monitoring with:
  - Google Analytics
  - Sentry for error tracking
  - New Relic for performance

### Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/react
```

In `src/main.tsx`:

```typescript
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1
  })
}
```

## Performance Optimization

### Enable Caching

#### Browser Cache Headers (Nginx)

```nginx
# Cache assets for 1 year
location ~* \.(js|css|img|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~* \.html$ {
  add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

#### Vercel/Netlify
- Automatic caching configured
- Configure in dashboard if needed

### Enable Compression

#### Nginx
```nginx
gzip on;
gzip_types text/plain text/css text/javascript 
           application/javascript application/json;
gzip_min_length 1000;
```

#### Vercel/Netlify
- Automatic GZIP compression

### Content Delivery Network (CDN)

#### Cloudflare (Recommended)

1. Sign up at https://cloudflare.com
2. Add your domain
3. Update DNS nameservers
4. Enable:
   - Automatic compression
   - Caching rules
   - Security features

#### AWS CloudFront

```bash
# Create distribution pointing to S3 or other origin
aws cloudfront create-distribution \
  --origin-domain-name todone.s3.amazonaws.com
```

## Security Checklist

- [ ] HTTPS enabled (all HTTPS, no HTTP)
- [ ] Security headers configured:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  ```
- [ ] CORS properly configured
- [ ] Environment variables not exposed
- [ ] No sensitive data in source code
- [ ] Regular security updates applied

### Configure Security Headers

#### Vercel/Netlify
Headers automatically configured.

#### Self-Hosted Nginx
```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "geolocation=(), microphone=()";
```

## Rollback Plan

### Vercel
```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel promote <deployment-url>
```

### Netlify
- Go to "Deploys" tab
- Click "Publish deploy" on previous version

### Self-Hosted
```bash
# Keep previous version
mv /var/www/todone /var/www/todone.old
mv /var/www/todone.new /var/www/todone

# Rollback if needed
rm -rf /var/www/todone
mv /var/www/todone.old /var/www/todone
```

## Database Migration (If Using Backend)

If deploying with a backend database:

```bash
# Create database backups
pg_dump todone_prod > backup_$(date +%Y%m%d).sql

# Run migrations
npm run migrate

# Verify data integrity
npm run verify-db
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm run test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@main
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Monitoring & Analytics

### Uptime Monitoring

```bash
# Using Uptime Robot or similar service
# Configure to check https://todone.app every 5 minutes
# Get alerts if site down
```

### Error Tracking

- Sentry for JavaScript errors
- LogRocket for session replays
- Google Analytics for usage metrics

### Performance Monitoring

- Vercel Analytics (automatic)
- Web Vitals monitoring
- Lighthouse CI for regression testing

## Disaster Recovery

### Backup Plan

1. **Source Code**
   - Hosted on GitHub with backups

2. **Data**
   - All user data stored locally in browser (IndexedDB)
   - Export feature for data portability
   - Optional: Regular database backups if using backend

3. **Configuration**
   - Keep `.env.production` file backed up
   - Store in secure password manager

### Recovery Steps

If deployment fails:

1. Check deployment logs for errors
2. Verify environment variables
3. Run `npm run build` locally to test
4. Rollback to previous deployment
5. Post incident review

## Cost Estimation

### Vercel
- **Hobby (Free)**: 100 GB/month bandwidth
- **Pro**: $20/month + usage
- **Enterprise**: Custom pricing

### Netlify
- **Free**: 100 GB/month bandwidth
- **Pro**: $19/month
- **Enterprise**: Custom pricing

### Self-Hosted (Cheapest)
- **Minimal**: $5-10/month VPS
- **Small App**: $20-50/month
- **Large App**: $100+/month

## Troubleshooting

### Build Fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Timeout

- Increase build timeout in platform settings
- Optimize build process
- Consider larger machine

### Assets Not Loading

- Check CSP headers
- Verify asset paths in `vite.config.ts`
- Clear CDN cache

### App Runs Slow

- Check bundle size: `npm run build`
- Enable GZIP compression
- Enable browser caching
- Use CDN

## Support

- Vercel Support: https://vercel.com/support
- Netlify Support: https://www.netlify.com/support/
- GitHub Issues: For bug reports
- Documentation: See [README.md](../README.md)

---

**Questions?** See [ARCHITECTURE.md](./ARCHITECTURE.md) or open an issue on GitHub.

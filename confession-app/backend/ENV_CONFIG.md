# Environment Configuration Guide

This project uses environment-specific configuration files to manage different deployment scenarios.

## Available Environments

| Environment | File | Purpose |
|------------|------|---------|
| **Development** | `.env.development` | Local development with hot reload |
| **Local** | `.env.local` | Personal overrides for development |
| **Test** | `.env.test` | Testing environment |
| **Staging** | `.env.staging` | Pre-production testing |
| **Production** | `.env.production` | Live production deployment |

## File Priority

Environment files are loaded in this order (later files override earlier ones):

1. `.env` (base fallback)
2. `.env.{NODE_ENV}` (environment-specific)
3. `.env.local` (only in development, for personal overrides)

## Setup Instructions

### 1. Initial Setup

```bash
# Copy example files to create your environment files
cp .env.example .env.development
cp .env.example .env.production
cp .env.example .env.staging
cp .env.example .env.test
```

### 2. Configure Each Environment

Edit each file with appropriate values:

#### `.env.development`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/confessionDB_dev
FRONTEND_URL=http://localhost:3000
DEVICE_ID_SECRET=dev-secret-key
ADMIN_KEY=dev-admin-key
CLOUDINARY_URL=cloudinary://key:secret@cloud
```

#### `.env.production`
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/confessionDB_prod
FRONTEND_URL=https://yourapp.com
DEVICE_ID_SECRET=strong-random-secret-32-chars-minimum
ADMIN_KEY=strong-admin-key-32-chars-minimum
CLOUDINARY_URL=cloudinary://prod_key:prod_secret@prod_cloud
```

### 3. Personal Development Overrides (Optional)

Create `.env.local` for personal settings that won't be committed:

```bash
cp .env.development .env.local
# Edit .env.local with your personal database, ports, etc.
```

## Running the Application

### Backend Only

```bash
cd confession-app/backend

# Development (with nodemon hot reload)
npm run dev

# Development (without hot reload)
npm run dev:local

# Production
npm run start:production

# Staging
npm run start:staging

# Test
npm run start:test
```

### Full Stack (Root Directory)

```bash
# Development (both frontend and backend)
npm run dev

# Backend only - development
npm run dev:backend

# Backend only - production
npm run start:backend:production

# Backend only - staging
npm run start:backend:staging
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `development`, `production`, `staging`, `test` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/confessionDB` |
| `FRONTEND_URL` | Allowed frontend origins (comma-separated) | `http://localhost:3000,https://app.com` |
| `DEVICE_ID_SECRET` | Secret for hashing device IDs | 32+ character random string |
| `ADMIN_KEY` | Admin API authentication key | 32+ character random string |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_URL` | Cloudinary connection URL | `cloudinary://key:secret@cloud` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (alternative) | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (alternative) | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (alternative) | `abc123xyz` |
| `LOG_LEVEL` | Logging level | `info`, `debug`, `error` |

## Security Best Practices

### 🔒 Never Commit

- ❌ `.env.development`
- ❌ `.env.production`
- ❌ `.env.staging`
- ❌ `.env.test`
- ❌ `.env.local`
- ❌ Any file with actual credentials

### ✅ Safe to Commit

- ✅ `.env.example` (template without real values)
- ✅ This README
- ✅ Configuration documentation

### Production Security

1. **Use Strong Secrets**: Generate 32+ character random strings
   ```bash
   # Generate a secure random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Different Secrets Per Environment**: Never reuse secrets between dev/staging/production

3. **Environment Variables in Deployment**: Use platform environment variables instead of `.env` files in production (e.g., Heroku Config Vars, AWS Systems Manager, Docker secrets)

4. **Rotate Secrets Regularly**: Change secrets periodically, especially after team member changes

## Troubleshooting

### "Cannot find module" errors
Make sure you're in the correct directory and have run `npm install`.

### Environment not loading
Check that `NODE_ENV` is set correctly:
```bash
echo $NODE_ENV  # Should show: development, production, etc.
```

### Wrong database connecting
Verify which `.env` file is being loaded:
```bash
# Add to server.js temporarily for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI?.replace(/\/\/.*@/, '//***@'));  // Hides password
```

### CORS errors
Make sure `FRONTEND_URL` in your backend environment matches your frontend URL exactly.

## CI/CD Integration

### GitHub Actions Example

```yaml
env:
  NODE_ENV: production
  MONGO_URI: ${{ secrets.MONGO_URI }}
  DEVICE_ID_SECRET: ${{ secrets.DEVICE_ID_SECRET }}
  ADMIN_KEY: ${{ secrets.ADMIN_KEY }}
  CLOUDINARY_URL: ${{ secrets.CLOUDINARY_URL }}
```

### Docker Example

```dockerfile
# Dockerfile
ENV NODE_ENV=production
# Pass other env vars at runtime with docker run -e or docker-compose
```

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - DEVICE_ID_SECRET=${DEVICE_ID_SECRET}
```

## Need Help?

- Check `.env.example` for all required variables
- Ensure all secrets are at least 32 characters
- Use different MongoDB databases for each environment
- Test in staging before deploying to production

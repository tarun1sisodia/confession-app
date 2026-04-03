# Cron Job Setup Guide

## Overview
This guide explains how to set up a cron job to keep your Render service alive by calling the health endpoint periodically.

## Step 1: Fix Render Deployment

### Changes Made:
1. **Dockerfile** - Changed from `CMD ["npm", "start"]` to `CMD ["node", "src/server.js"]`
   - Prevents duplicate NODE_ENV setting which caused SIGTERM
   - Directly runs the server without npm wrapper

2. **Health Endpoint** - Added authentication with HEALTH_SECRET
   - Prevents unauthorized health checks
   - Accepts secret via header or query parameter

3. **render.yaml** - Added HEALTH_SECRET environment variable

## Step 2: Deploy to Render

1. Push your changes to Git:
   ```bash
   git add .
   git commit -m "Fix Dockerfile and add secure health endpoint"
   git push
   ```

2. In Render Dashboard:
   - Go to your service settings
   - Find the `HEALTH_SECRET` environment variable (auto-generated)
   - **Copy this value** - you'll need it for the cron job

   If it wasn't auto-generated:
   - Click "Add Environment Variable"
   - Key: `HEALTH_SECRET`
   - Value: Generate a random secure string (e.g., use https://randomkeygen.com/)
   - Click "Save Changes"

3. Wait for deployment to complete

4. Note your service URL (e.g., `https://confession-backend.onrender.com`)

## Step 3: Set Up Cron Job at cron-job.org

1. Go to https://console.cron-job.org/dashboard

2. Click "Create cron job"

3. Configure the cron job:

   **Basic Settings:**
   - **Title**: `Render Health Check - Confession App`
   - **Address (URL)**: `https://your-app-name.onrender.com/health`
     - Replace `your-app-name` with your actual Render service URL

   **Schedule:**
   - **Execution**: Every 10 minutes (or your preference)
   - Render's free tier services sleep after 15 minutes of inactivity
   - Recommended: Every 10-14 minutes to keep it alive

   **Request Configuration:**
   - **Method**: GET
   - **Headers**: Click "Add header"
     - **Key**: `X-Health-Secret`
     - **Value**: `<paste-your-HEALTH_SECRET-from-render>`
   
   **Advanced (Optional):**
   - **Timeout**: 30 seconds
   - **Expected response**: 200
   - **Email notifications**: Enable to get alerts if health check fails

4. Click "Create" or "Save"

## Step 4: Test the Setup

### Test 1: Without Secret (Should Fail)
```bash
curl https://your-app-name.onrender.com/health
```
Expected response:
```json
{
  "status": "unauthorized",
  "message": "Invalid or missing health secret"
}
```

### Test 2: With Secret in Header (Should Succeed)
```bash
curl -H "X-Health-Secret: YOUR_HEALTH_SECRET" \
     https://your-app-name.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T13:15:00.000Z"
}
```

### Test 3: With Secret in Query Parameter (Alternative)
```bash
curl https://your-app-name.onrender.com/health?secret=YOUR_HEALTH_SECRET
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T13:15:00.000Z"
}
```

## Cron Job Configuration Summary

**Where to add HEALTH_SECRET:**
- ✅ **Recommended**: As a custom header `X-Health-Secret`
- ✅ **Alternative**: As a query parameter `?secret=YOUR_SECRET`
- ❌ **NOT in body** - GET requests don't typically have bodies

**Why use header instead of query parameter:**
- More secure (not visible in URL logs)
- Standard practice for API authentication
- Query parameters may be logged by proxies/load balancers

## Monitoring

1. In cron-job.org dashboard:
   - Check "History" tab to see execution logs
   - Verify 200 status codes
   - Set up email alerts for failures

2. In Render dashboard:
   - Check "Logs" to see incoming health checks
   - Monitor service uptime

## Troubleshooting

### Service still gets SIGTERM:
- Check Render logs for the exact error
- Ensure all environment variables are set
- Verify MongoDB connection is working

### Cron job returns 401:
- Double-check HEALTH_SECRET matches between Render and cron-job.org
- Ensure header name is exactly `X-Health-Secret`
- No extra spaces in the secret value

### Service still sleeps:
- Verify cron job is running (check execution history)
- Reduce interval to every 10 minutes
- Check if cron-job.org is hitting the correct URL

## Alternative Cron Services

If you prefer other services:
- **UptimeRobot** (https://uptimerobot.com/) - Free monitoring with alerts
- **Cron-job.org** (https://cron-job.org/) - What we're using
- **EasyCron** (https://www.easycron.com/) - Simple cron service
- **GitHub Actions** - Self-hosted cron with workflows

All of them support custom headers for authentication.

## Security Notes

- Never commit HEALTH_SECRET to Git
- Use environment variables in Render
- Rotate the secret periodically
- Monitor failed authentication attempts in logs

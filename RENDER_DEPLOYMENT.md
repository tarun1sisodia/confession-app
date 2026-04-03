# Render Deployment Guide

## 🚀 Quick Deploy to Render

### Option 1: Using Render Dashboard (Recommended)

1. **Connect your GitHub repository** to Render

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select the repository

3. **Configure the service:**
   ```
   Name: confession-backend
   Region: Choose closest to your users
   Branch: main
   
   Build & Deploy:
   - Root Directory: (leave empty - Dockerfile is at root now)
   - Environment: Docker
   - Dockerfile Path: ./Dockerfile
   
   Instance Type: Free or Starter ($7/month)
   ```

4. **Add Environment Variables:**
   
   Click "Advanced" → "Add Environment Variable"
   
   **Required:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FRONTEND_URL=https://your-frontend-url.com
   DEVICE_ID_SECRET=generate_random_32_chars
   ADMIN_KEY=generate_random_32_chars
   ```
   
   **Optional (for image uploads):**
   ```
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```

5. **Health Check:**
   ```
   Health Check Path: /health
   ```

6. **Click "Create Web Service"** 🎉

---

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Update `render.yaml`** with your values:
   - Update `FRONTEND_URL` with your actual frontend URL
   - Add secrets in Render dashboard

2. **In Render Dashboard:**
   - Go to "Blueprint" → "New Blueprint Instance"
   - Connect your repo
   - Select `render.yaml`
   - Fill in the secret environment variables

3. **Deploy!**

---

## 🔐 Environment Variables Setup

### Generate Secure Secrets

```bash
# Generate DEVICE_ID_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ADMIN_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB URI Format

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster.mongodb.net/confessionDB_prod?retryWrites=true&w=majority
```

**Important:** Replace `username`, `password`, and `cluster` with your actual values.

### Frontend URL

Multiple URLs (comma-separated):
```
FRONTEND_URL=https://yourapp.com,https://www.yourapp.com
```

---

## 📋 Deployment Checklist

- [ ] MongoDB database created and accessible
- [ ] Environment variables added in Render
- [ ] Secrets are strong (32+ characters)
- [ ] Frontend URL is correct (for CORS)
- [ ] Cloudinary configured (if using image uploads)
- [ ] Health check path set to `/health`
- [ ] Branch set to `main` (or your default branch)

---

## 🔍 Testing Your Deployment

Once deployed, your API will be at:
```
https://your-service-name.onrender.com
```

Test the health endpoint:
```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T11:00:00.000Z"
}
```

---

## 🐛 Troubleshooting

### "Application failed to respond"
- Check logs in Render dashboard
- Verify `PORT` environment variable is set to `5000`
- Ensure MongoDB connection string is correct

### "Cannot connect to MongoDB"
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check MongoDB username/password are correct
- Ensure database name exists

### CORS errors
- Verify `FRONTEND_URL` includes your frontend domain
- Check no trailing slashes in URLs
- Ensure protocol is included (`https://`)

### Build fails
- Check Dockerfile syntax
- Verify `package.json` exists in backend folder
- Check build logs for specific errors

---

## 🔄 Auto-Deploy on Push

Render automatically deploys when you push to your main branch!

To disable:
- Go to service settings
- Under "Deploy" → uncheck "Auto-Deploy"

---

## 💰 Render Pricing

- **Free Tier:** Available (spins down after inactivity)
- **Starter:** $7/month (always on, better performance)
- **Standard:** $25/month (more resources)

---

## 📱 Connecting Your Android App

Update your frontend/Android app API base URL to:
```
https://your-service-name.onrender.com
```

Make sure to update in your frontend environment config!

---

## 🎯 Next Steps

1. ✅ Deploy backend to Render
2. Get your backend URL: `https://your-service-name.onrender.com`
3. Update frontend to use this URL
4. Deploy frontend (Netlify/Vercel)
5. Update `FRONTEND_URL` environment variable in Render
6. Test the complete flow!

---

## 📞 Need Help?

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check Render logs for detailed error messages

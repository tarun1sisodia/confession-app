# Environment-specific Backend URLs

## Production Backend
https://confession-app-a9eu.onrender.com

## API Endpoints
Base URL: https://confession-app-a9eu.onrender.com/api

### Test Health Check
```bash
curl https://confession-app-a9eu.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T11:17:00.000Z"
}
```

---

## Frontend Configuration

The frontend uses proxy/rewrites to call the backend:

### For Netlify (`_redirects`)
```
/api/*  https://confession-app-a9eu.onrender.com/api/:splat  200!
```

### For Vercel (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://confession-app-a9eu.onrender.com/api/:path*"
    }
  ]
}
```

### For Direct API Calls (Environment Variable)
If you need to bypass proxies:
```env
NEXT_PUBLIC_API_BASE_URL=https://confession-app-a9eu.onrender.com/api
```

---

## Backend CORS Configuration

Make sure to update your backend's `FRONTEND_URL` environment variable in Render:

```env
FRONTEND_URL=https://your-netlify-app.netlify.app,https://your-vercel-app.vercel.app
```

Example:
```env
FRONTEND_URL=https://confessly.netlify.app,https://confessly.vercel.app,http://localhost:3000
```

---

## Android App Configuration

For the Android app, you can:

1. **Use the Netlify/Vercel domain** (recommended for production):
   - The app will call your frontend domain
   - Frontend proxies to backend via `_redirects` or `vercel.json`
   
2. **Call backend directly**:
   - Point directly to: `https://confession-app-a9eu.onrender.com/api`
   - Make sure backend's `FRONTEND_URL` includes your Android app domain

---

## Testing

### Test from browser:
```javascript
fetch('/api/confessions?page=1&limit=10')
  .then(r => r.json())
  .then(console.log)
```

### Test from Android/direct:
```javascript
fetch('https://confession-app-a9eu.onrender.com/api/confessions?page=1&limit=10')
  .then(r => r.json())
  .then(console.log)
```

---

## Updated Files

✅ `_redirects` - Netlify proxy configuration
✅ `vercel.json` - Vercel rewrite configuration

Both now point to: **https://confession-app-a9eu.onrender.com**

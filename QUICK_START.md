# Quick Reference: Running the App

## 🚀 Development

```bash
# Root directory - run both frontend & backend
npm run dev

# Backend only
npm run dev:backend
# or
cd confession-app/backend && npm run dev
```

## 🏭 Production

```bash
# Backend production
npm run start:backend:production
# or
cd confession-app/backend && npm run start:production
```

## 🧪 Testing

```bash
npm run start:backend:test
# or
cd confession-app/backend && npm run start:test
```

## 📦 Staging

```bash
npm run start:backend:staging
# or
cd confession-app/backend && npm run start:staging
```

## 📱 Android Build

```bash
npm run android:sync       # Build and sync
npm run android:open       # Open Android Studio
npm run android:bundle     # Create release bundle
```

## 🔧 Setup (First Time)

```bash
npm run setup              # Install all dependencies
```

---

## Environment Files

- `.env.development` - Development
- `.env.local` - Personal dev overrides
- `.env.test` - Testing
- `.env.staging` - Staging
- `.env.production` - Production

See `backend/ENV_CONFIG.md` for full documentation.

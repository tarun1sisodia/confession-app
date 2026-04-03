# Confession App 🎭

> A modern, anonymous, and interactive confession platform built for authentic expression.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🌟 Overview

The Confession App is a full-stack web & App application designed to provide a safe space for users to share their thoughts, secrets, and feelings anonymously. Featuring a premium, fluid UI with a focus on privacy and community engagement, it allows users to post confessions, react with emotions, and participate in discussions without the need for traditional accounts.

**Live Demo**: []

## ✨ Key Features

- 🎭 **Anonymous Posting**: Share your truth without a profile. Supports text and image uploads (up to 5MB).
- 🔐 **Device-Based Ownership**: Manage your own posts (edit/delete) securely without logging in, thanks to persistent device tracking.
- 💬 **Interactive Reactions**: Express how you feel about others' confessions with likes, dislikes, and specific emotional reactions (funny, sad, relatable).
- 💭 **Threaded Discussions**: Engage in anonymous community discussions via a dedicated comment system.
- 🛡️ **Smart Moderation**: Community-driven reporting system that automatically hides inappropriate content after reaching a threshold.
- 🔥 **Trending & Search**: Discover what's hot in the community or search for specific topics using the built-in full-text search engine.
- 👁️ **Privacy First**: Built-in blur/reveal mechanism for sensitive content.
- 📱 **Progressive Web App**: Installable on mobile and desktop with offline support.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Vanilla CSS with custom design system
- **State Management**: React Hooks
- **Mobile**: Capacitor (Android support)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Image Storage**: Cloudinary
- **Validation**: Zod schemas
- **Security**: Rate limiting, CORS, Device-ID hashing

### DevOps
- **Deployment**: Render (Backend), Netlify (Frontend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Health check endpoints

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn
- Cloudinary account (for image uploads)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/confession-app.git
   cd confession-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd confession-app/backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cd ../backend
   cp .env.example .env.local
   # Edit .env.local with your configuration

   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd confession-app/backend
   npm run dev

   # Terminal 2 - Frontend
   cd confession-app/frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Backend Environment Variables

Create `.env.local` in `confession-app/backend/`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/confessionDB

# Frontend URL (comma-separated for multiple origins)
FRONTEND_URL=http://localhost:3000

# Security
DEVICE_ID_SECRET=your-secret-key-here
ADMIN_KEY=your-admin-key-here

# Cloudinary (choose one method)
# Method 1: Single URL
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Method 2: Separate credentials
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Optional
HEALTH_SECRET=your-health-check-secret
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `.env.local` in `confession-app/frontend/`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api
```

## 🔧 Development

### Backend Scripts

```bash
npm run dev         # Start development server with nodemon
npm start           # Start production server
npm test            # Run tests
```

### Frontend Scripts

```bash
npm run dev         # Start Next.js development server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Comment complex logic
- Write tests for new features

## 📦 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd confession-app/backend && npm install`
   - **Start Command**: `cd confession-app/backend && npm start`
   - **Environment**: Add all environment variables from `.env.production`

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

### Frontend Deployment (Netlify)

1. Connect your GitHub repository to Netlify
2. Configure:
   - **Build Command**: `cd confession-app/frontend && npm run build`
   - **Publish Directory**: `confession-app/frontend/out`
   - **Environment**: Add `NEXT_PUBLIC_API_BASE_URL`

### Android App Deployment

See [PLAY_STORE_ANDROID_GUIDE.md](PLAY_STORE_ANDROID_GUIDE.md) for building and publishing the Android app.

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

### Endpoints

#### Confessions
- `GET /confessions` - Get all confessions (paginated)
- `GET /confessions/trending` - Get trending confessions
- `GET /confessions/search?q=query` - Search confessions
- `GET /confessions/my-posts` - Get user's own posts
- `POST /confessions/add` - Create a new confession
- `POST /confessions/upload` - Upload an image
- `PATCH /confessions/:id` - Update a confession
- `DELETE /confessions/:id` - Delete a confession
- `POST /confessions/vote/:id` - Vote on a confession
- `POST /confessions/report/:id` - Report a confession

#### Comments
- `GET /confessions/:id/comments` - Get confession comments
- `POST /confessions/:id/comments` - Add a comment
- `POST /confessions/:id/comments/:commentId/vote` - Vote on a comment

#### Settings
- `GET /settings` - Get theme settings
- `POST /settings` - Update theme settings

See the [API Documentation](confession-app/backend/docs/API.md) for detailed request/response schemas.

## 📁 Project Structure

```
confession-app/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── api/            # API routes and controllers
│   │   │   ├── confession/ # Confession-related endpoints
│   │   │   └── theme/      # Theme settings endpoints
│   │   ├── config/         # Configuration files
│   │   ├── middlewares/    # Express middlewares
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
│
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/               # Utility functions and API client
│   ├── public/            # Static assets
│   ├── .env.example       # Environment variables template
│   └── package.json       # Frontend dependencies
│
├── README.md              # This file
├── CONTRIBUTING.md        # Contribution guidelines
├── CODE_OF_CONDUCT.md     # Code of conduct
└── LICENSE                # MIT License
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- How to submit issues
- How to propose new features
- Code style guidelines
- Pull request process

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please email [your-email@example.com] instead of using the issue tracker.

### Security Features

- Device-ID hashing for anonymous user tracking
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS configuration
- Content security headers
- Automatic moderation system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and Express
- Styled with custom CSS design system
- Icons from Lucide
- Image hosting by Cloudinary
- Database powered by MongoDB

## 📞 Support

- **Documentation**: Check our [docs](confession-app/backend/docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/confession-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/confession-app/discussions)

## 🗺️ Roadmap

- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] User profiles (optional, maintaining anonymity)
- [ ] Content moderation dashboard
- [ ] Analytics and insights
- [ ] Multi-language support
- [ ] iOS app support

## 📊 Status

- **Backend**: ✅ Stable
- **Frontend**: ✅ Stable
- **Android App**: ✅ Available
- **iOS App**: 🚧 In Progress

---

## 📖 Synopsis

In an era of curated social presence, the Confession App brings back raw, honest human connection. By removing the identity layer and focusing on the content, it creates a unique "pulse" of the community's collective consciousness. From "deep" secrets to "chaotic" funny moments, every confession is a window into someone else's reality.

---

**Built with ❤️ for authentic expression.**

*Star ⭐ this repo if you find it useful!*
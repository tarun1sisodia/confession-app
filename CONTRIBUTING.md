# Contributing to Confession App 🎭

First off, thank you for considering contributing to the Confession App! It's people like you that make this a great tool for authentic expression.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com].

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Git
- A GitHub account
- Basic knowledge of JavaScript, React, and Node.js

### Setting Up Your Development Environment

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/confession-app.git
   cd confession-app
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/confession-app.git
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd confession-app/backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Configure environment**
   ```bash
   # Copy example env files and configure them
   cd confession-app/backend
   cp .env.example .env.local

   cd ../frontend
   cp .env.example .env.local
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd confession-app/backend
   npm run dev

   # Terminal 2 - Frontend
   cd confession-app/frontend
   npm run dev
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 98, Firefox 95]
- Node version: [e.g., 18.0.0]
- App version: [e.g., 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Would you like to work on this?**
[ ] Yes, I'd like to implement this
[ ] No, just suggesting
```

### Your First Code Contribution 🎉

Unsure where to begin? You can start by looking through these issues:

- **Good First Issue** - Issues labeled as `good first issue` are great for beginners
- **Help Wanted** - Issues labeled as `help wanted` need attention

### Pull Requests 🔀

1. Follow the [Development Process](#development-process)
2. Follow the [Style Guidelines](#style-guidelines)
3. Follow the [Commit Guidelines](#commit-guidelines)
4. Follow the [Pull Request Process](#pull-request-process)

## 🔄 Development Process

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Working on an Issue

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the style guidelines
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   # Backend tests
   cd confession-app/backend
   npm test

   # Frontend tests
   cd confession-app/frontend
   npm test

   # Manual testing
   # - Test in multiple browsers
   # - Test on mobile devices
   # - Check console for errors
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎨 Style Guidelines

### JavaScript/React Code Style

- **Use ES6+ features** (arrow functions, destructuring, etc.)
- **Use meaningful variable names**
  ```javascript
  // Bad
  const x = getUserData();
  
  // Good
  const userData = getUserData();
  ```

- **Use async/await** instead of promises when possible
  ```javascript
  // Preferred
  async function fetchData() {
    const response = await fetch(url);
    return response.json();
  }
  ```

- **Comment complex logic**
  ```javascript
  // Calculate engagement score based on likes, comments, and age
  const engagementScore = (likes * 2) + (comments * 3) - (ageInHours * 0.1);
  ```

- **Keep functions small and focused**
  - One function should do one thing
  - Max 30 lines per function (guideline, not hard rule)

- **Use consistent naming conventions**
  - `camelCase` for variables and functions
  - `PascalCase` for components and classes
  - `UPPER_SNAKE_CASE` for constants

### CSS Style Guidelines

- **Use meaningful class names**
  ```css
  /* Bad */
  .btn-1 { }
  
  /* Good */
  .primary-button { }
  ```

- **Follow mobile-first approach**
  ```css
  .container {
    width: 100%;
  }
  
  @media (min-width: 768px) {
    .container {
      width: 750px;
    }
  }
  ```

- **Group related properties**
  ```css
  .element {
    /* Positioning */
    position: relative;
    top: 0;
    
    /* Box model */
    display: flex;
    width: 100%;
    padding: 1rem;
    
    /* Typography */
    font-size: 1rem;
    color: #333;
  }
  ```

### File Organization

- **Backend structure**
  ```
  backend/src/
  ├── api/
  │   └── [feature]/
  │       ├── [feature].controller.js
  │       ├── [feature].service.js
  │       ├── [feature].model.js
  │       ├── [feature].routes.js
  │       └── [feature].validation.js
  ├── middlewares/
  ├── utils/
  └── config/
  ```

- **Frontend structure**
  ```
  frontend/
  ├── app/              # Next.js pages
  ├── components/       # Reusable components
  ├── lib/             # Utilities and helpers
  └── public/          # Static assets
  ```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (white-space, formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```bash
# Feature
git commit -m "feat(auth): add device-based authentication"

# Bug fix
git commit -m "fix(upload): handle files larger than 5MB"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): change confession endpoint structure

BREAKING CHANGE: The /api/confessions endpoint now returns paginated results"
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Changes tested locally

### PR Template

When you create a PR, use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated checks** must pass (if configured)
2. **At least one maintainer** must review and approve
3. **All conversations** must be resolved
4. **No merge conflicts** with main branch

### After Your PR is Merged

1. Delete your branch (optional)
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your local main
   ```bash
   git checkout main
   git pull upstream main
   ```

## 🎯 Areas Needing Contributions

We especially welcome contributions in these areas:

### High Priority
- 🐛 Bug fixes and stability improvements
- 📱 Mobile responsiveness issues
- ♿ Accessibility improvements
- 🔒 Security enhancements
- 📝 Documentation improvements

### Feature Requests
- 🔔 Real-time notifications
- 🌍 Internationalization (i18n)
- 🎨 Theme customization options
- 📊 Analytics dashboard
- 🤖 Better content moderation tools

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussions
- **Pull Requests**: Code contributions

### Getting Help

If you need help:

1. Check the [README.md](README.md) documentation
2. Search existing GitHub issues
3. Ask in GitHub Discussions
4. Review the code - it's well-commented!

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

## ❓ Questions?

Don't hesitate to ask questions! We're here to help:

- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Reach out to maintainers

---

Thank you for contributing! 🎉

*Remember: Every contribution, no matter how small, is valuable and appreciated.*

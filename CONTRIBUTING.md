# Contributing to Coloki

We're excited that you want to contribute to Coloki! This document provides guidelines to help make the contribution process smooth and effective.

## Code of Conduct

- Treat all community members with respect
- No discrimination or harassment
- Focus on constructive feedback
- Questions are always welcomed

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/coloki.git
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit:
   ```bash
   git commit -m "Add: Description of your changes"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** with detailed description

## Commit Message Guidelines

- Start with type: `Add:`, `Fix:`, `Refactor:`, `Docs:`, `Test:`
- Write clear, descriptive messages
- Reference issue numbers: `Fix: #123`

Example:
```
Add: KYC verification endpoint
- Implement ID verification logic
- Add document upload validation
- Update user model with verification status
Fixes #456
```

## Code Style

- Use TypeScript for backend code
- Follow ESLint and Prettier rules
- Use consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write unit tests for new features
- Maintain 80%+ code coverage
- Run tests before submitting PR:
  ```bash
  npm test
  ```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
6. Squash commits before merge

## Security

- Never commit secrets or credentials
- Use environment variables for config
- Report security vulnerabilities privately to security@coloki.com
- Follow OWASP guidelines

## Documentation

- Update README.md for new features
- Document API endpoints
- Add JSDoc comments to functions
- Keep docs up to date

## Development Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

### Website
```bash
# Static site - open in browser
```

## Reporting Issues

- Search existing issues first
- Provide clear reproduction steps
- Include screenshots/logs
- Specify your environment
- Be descriptive but concise

## License

By contributing, you agree that your contributions will be licensed under Coloki's proprietary license.

## Questions?

- Open an issue for questions
- Join our community discussions
- Email: dev@coloki.com

Thank you for contributing to Coloki! 🚀

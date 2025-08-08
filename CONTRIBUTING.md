# Contributing to Intranet Starter

## Welcome Contributors!

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

### 1. Fork & Create a Branch

1. Fork the repository
2. Create a branch from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 2. Code Style & Guidelines

#### Backend (.NET)
- Follow Microsoft C# Coding Conventions
- Use nullable reference types
- Write unit tests for new code
- Use dependency injection

#### Frontend (React)
- Use TypeScript
- Follow React hooks best practices
- Write component tests
- Use functional components

### 3. Commit Messages

Use the following format:
```
<type>(<scope>): <subject>

# Types: 
# - feat (new feature)
# - fix (bug fix)
# - docs (documentation)
# - style (formatting)
# - refactor (code restructure)
# - test (test related)
# - chore (maintenance)

# Example
feat(auth): add Google OAuth login
```

### 4. Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Make sure code passes linting
4. Request review from maintainers

### 5. Code Review Process

- All submissions require review
- Use GitHub's review features
- Be respectful and constructive
- Focus on code quality, not personal preferences

## Reporting Bugs

### Great Bug Reports Include:

- A quick summary and background
- Steps to reproduce
- Expected behavior
- Actual results
- Notes (possible reasons, suggested fix)

## Feature Requests

1. Check existing issues
2. Provide clear use case
3. Detailed description
4. Potential implementation ideas

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Gracefully accept constructive criticism
- Focus on what is best for the community

### Unacceptable Behavior

- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Help

- Open GitHub Issues
- Community Slack/Discord
- Email support channels

## Security Vulnerabilities

Please do NOT open Issues for security vulnerabilities. Email security@yourcompany.com directly.

## Setup Development Environment

Refer to [SETUP.md](docs/SETUP.md) for comprehensive setup instructions.

## Testing

### Running Tests

```bash
# Backend tests
dotnet test

# Frontend tests
npm test

# Integration tests
docker-compose -f docker-compose.test.yml up
```

## Performance Considerations

- Profile your code
- Minimize external dependencies
- Use async/await appropriately
- Implement caching strategies

## Documentation

Keep documentation updated with code changes. Use XML/JSDoc comments.

## Questions?

Open an issue with the "question" label. Community and maintainers will help you!
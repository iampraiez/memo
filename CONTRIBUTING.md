# Contributing to Memory Lane

Thank you for your interest in contributing to Memory Lane! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/yourusername/memory-lane.git
   cd memory-lane
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/memory-lane.git
   ```
4. **Install dependencies**
   ```bash
   pnpm install
   ```
5. **Set up environment** - Copy `.env.example` to `.env` and configure

## 🔄 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm dev        # Test locally
   pnpm build      # Verify build works
   pnpm lint       # Check for linting errors
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass locally
- [ ] Build completes without errors
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow conventional commits
- [ ] No merge conflicts with main branch

### PR Description Should Include

- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Technical approach (if complex)
- **Screenshots**: For UI changes
- **Breaking Changes**: If any

### Example PR Title

```
feat(auth): add passwordless authentication with magic links
```

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface Memory {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// Avoid
const data: any = {};
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  onClick,
  children 
}) => {
  // Component logic
};
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `MemoryCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `use*.ts` (e.g., `useMemories.ts`)
- Types: `types.ts` or `*.types.ts`

## 🧪 Testing

Currently, the project doesn't have a comprehensive test suite. Contributions to add tests are highly welcome!

When tests are added, ensure:
- All new features have tests
- Bug fixes include regression tests
- Tests are clear and well-documented

## 📚 Documentation

- Update README.md for major features
- Add JSDoc comments for complex functions
- Update API documentation if changing endpoints
- Include examples in documentation

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node version
6. **Screenshots**: If applicable
7. **Error Messages**: Full error stack trace

## 💡 Feature Requests

When requesting features:

1. **Use Case**: Describe the problem it solves
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@memorylane.app
3. Include detailed description
4. We'll respond within 48 hours

## 📋 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(auth): add Google OAuth integration

- Added Google OAuth provider configuration
- Updated auth page with Google sign-in button
- Added environment variables for Google credentials

Closes #123
```

## 🎯 Areas for Contribution

We especially welcome contributions in:

- 🧪 **Testing**: Unit tests, integration tests, E2E tests
- 📱 **Mobile**: PWA improvements, mobile UX
- ♿ **Accessibility**: ARIA labels, keyboard navigation
- 🌍 **i18n**: Internationalization support
- 📊 **Performance**: Optimization, caching strategies
- 🎨 **UI/UX**: Design improvements, animations
- 📖 **Documentation**: Guides, tutorials, examples

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the application (for major contributions)

## ❓ Questions?

- Open a [Discussion](https://github.com/yourusername/memory-lane/discussions)
- Join our [Discord](https://discord.gg/memorylane) (if available)
- Email: contribute@memorylane.app

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Memory Lane! 🎉**

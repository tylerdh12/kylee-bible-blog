# Contributing to Kylee's Bible Blog

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for semantic versioning:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples
```
feat(auth): add JWT secret validation
fix(mobile): implement hamburger menu navigation
docs(readme): update installation instructions
test(api): add input validation tests
```

## Branching Strategy

### Branch Naming Convention
- Feature branches: `feature/JSS-XX-short-description`
- Bug fixes: `fix/JSS-XX-short-description`
- Hotfixes: `hotfix/JSS-XX-short-description`

### Workflow
1. Create branch from `main` for each Linear issue
2. Make commits with conventional commit messages
3. Create PR with Linear issue reference
4. Merge without squashing to preserve commit history
5. Delete feature branch after merge

### Version Bumping
- **BREAKING CHANGE**: Major version (1.0.0 → 2.0.0)
- **feat**: Minor version (1.0.0 → 1.1.0)
- **fix**: Patch version (1.0.0 → 1.0.1)

## Pull Request Process

1. Reference Linear issue in PR title: `[JSS-XX] Description`
2. Ensure all tests pass
3. Update documentation if needed
4. Request review from team members
5. Merge without squashing to maintain commit history
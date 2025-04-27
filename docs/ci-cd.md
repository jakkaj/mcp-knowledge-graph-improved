# CI/CD Workflows Documentation

This document explains the Continuous Integration (CI) and Continuous Deployment (CD) workflows implemented in this repository using GitHub Actions.

## CI Workflow

The CI workflow (`ci.yml`) runs automatically on every pull request targeting the `main` branch. It performs the following checks:

1. Builds the project
2. Runs unit tests
3. Builds the Docker image
4. Tests the MCP functionality in Docker

### Branch Protection

The `main` branch is protected by branch protection rules that require the CI workflow to pass before merging a pull request. This ensures that only code that passes all tests can be merged into the main branch.

## CD Workflow (Automated Releases)

The CD workflow (`release.yml`) runs automatically when changes are pushed to the `main` branch (typically via merged pull requests). It uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning based on [Conventional Commits](https://www.conventionalcommits.org/).

### Release Process

1. When commits are pushed to `main`, semantic-release analyzes the commit messages
2. If a release-triggering commit is found, a new version is determined based on the commit type:
   - `fix:` → patch release (e.g., 1.0.0 → 1.0.1)
   - `feat:` → minor release (e.g., 1.0.0 → 1.1.0)
   - `feat:` with `BREAKING CHANGE:` in body → major release (e.g., 1.0.0 → 2.0.0)
3. The `package.json` version is updated
4. A new Git tag is created
5. A GitHub Release is created with automatically generated release notes
6. A Docker image is built and pushed to Docker Hub with the new version tag and `latest` tag

### Conventional Commits

To trigger a release, your commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types:
- `feat`: A new feature (triggers a minor release)
- `fix`: A bug fix (triggers a patch release)
- `docs`: Documentation only changes (no release)
- `style`: Changes that do not affect code meaning (no release)
- `refactor`: Code change that neither fixes a bug nor adds a feature (no release)
- `perf`: Performance improvement (no release)
- `test`: Adding/updating tests (no release)
- `chore`: Changes to build process or auxiliary tools (no release)

Breaking changes:
- Add `BREAKING CHANGE:` in the commit body or footer
- Or append `!` after the type/scope (e.g., `feat!:`)

### Required Secrets

For the automated release workflow to function properly, the following GitHub secrets must be configured:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: A Docker Hub access token with push permissions

These can be added in the repository Settings → Secrets and variables → Actions → New repository secret.
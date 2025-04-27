# Contributing to MCP Knowledge Graph Improved

Thank you for your interest in contributing! We welcome contributions from everyone.

## Getting Started

To ensure a consistent development environment, **using the provided Dev Container is required for all development**.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Visual Studio Code](https://code.visualstudio.com/)
*   [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mcp-knowledge-graph-improved.git
    cd mcp-knowledge-graph-improved
    ```
2.  **Open in Dev Container:**
    *   Open the cloned repository folder in VS Code.
    *   VS Code should automatically detect the `.devcontainer` configuration and prompt you to "Reopen in Container". Click on it.
    *   If you don't see the prompt, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run the command `Remote-Containers: Reopen in Container`.
3.  **Build the project:**
    Once the container is built and your VS Code window has reloaded, you can build the project using the provided Makefile:
    ```bash
    make build
    ```
4.  **Run tests:**
    ```bash
    make test
    ```

## Contribution Workflow

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name` or `git checkout -b fix/your-bug-fix`).
3.  Make your changes within the Dev Container.
4.  Ensure all tests pass (`make test`).
5.  Commit your changes with clear and concise messages (following conventional commit format - see below).
6.  Push your branch to your fork (`git push origin feature/your-feature-name`).
7.  Open a Pull Request against the main repository.

## Conventional Commits and Semantic Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated version management and package publishing. The version numbers are automatically determined from the commit messages, following [Semantic Versioning](https://semver.org/) rules.

### Commit Message Format

All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

The commit type determines how the version will be incremented:

- `feat`: A new feature (triggers a MINOR version increment)
- `fix`: A bug fix (triggers a PATCH version increment)
- `docs`: Documentation changes only
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process, tooling, etc.

If the commit includes `BREAKING CHANGE:` in the footer or appends `!` after the type/scope, it will trigger a MAJOR version increment.

### Examples

```
feat(search): add fuzzy search capability

Implement fuzzy search algorithm to improve search results.
```

```
fix(server): resolve connection timeout issue

Fixes #123
```

```
chore: update dependencies
```

```
feat!: change API response format

BREAKING CHANGE: API response now returns JSON instead of XML
```

## Release Process

When code is merged to the main branch, the following automated process occurs:

1. GitHub Actions runs the release workflow
2. semantic-release determines the next version number based on commit messages
3. A new GitHub release is created with automatically generated release notes
4. A Docker image is built and published with the new version tag

There's no need to manually update version numbers or create release tags - this is all handled automatically based on your commit messages.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
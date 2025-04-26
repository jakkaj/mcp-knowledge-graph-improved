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
5.  Commit your changes with clear and concise messages (following Angular commit conventions is preferred).
6.  Push your branch to your fork (`git push origin feature/your-feature-name`).
7.  Open a Pull Request against the main repository.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
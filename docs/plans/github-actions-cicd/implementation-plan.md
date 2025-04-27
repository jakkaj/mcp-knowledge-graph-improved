https://github.com/jakkaj/mcp-knowledge-graph-improved/issues/1

# GitHub Actions CI/CD Setup Plan (Revised for Conventional Commits & Branch Protection)

**Project:** mcp-knowledge-graph-improved
**Date:** 2025-04-27
**Author:** Roo (AI Architect)
**Goal:** Implement GitHub Actions workflows for Continuous Integration (testing and Docker build validation on Pull Requests) and automated Releases (version bumping, tagging, Docker image build, and push to Docker Hub based on Conventional Commits merged to `main`). Ensure PRs cannot be merged unless CI checks pass via branch protection rules.

---

### Phase 1: CI Workflow Setup (Pull Requests)

This phase focuses on creating a workflow that automatically runs checks on every pull request targeting the `main` branch. The jobs defined here will be used as required status checks in branch protection rules.

*   **Task 1.1:** Create Workflow Directory Structure
    *   Action: Create the necessary directories: `.github/workflows/`.
    *   Success Criteria: The directory `.github/workflows/` exists in the project root.
    *   Status: `- [ ]`

*   **Task 1.2:** Create CI Workflow File
    *   Action: Create a new file named `ci.yml` inside `.github/workflows/`. Define a job within it (e.g., named `build-and-test`).
    *   Success Criteria: The file `.github/workflows/ci.yml` exists and contains a job definition.
    *   Status: `- [ ]`

*   **Task 1.3:** Define CI Workflow Triggers
    *   Action: Configure `ci.yml` to trigger on `pull_request` events targeting the `main` branch.
    *   Success Criteria: `ci.yml` contains the configuration `on: pull_request: branches: [ main ]`.
    *   Status: `- [ ]`

*   **Task 1.4:** Define CI Job Environment
    *   Action: Configure the CI job (e.g., `build-and-test`) to run on the latest Ubuntu runner (`runs-on: ubuntu-latest`).
    *   Success Criteria: The CI job in `ci.yml` specifies `runs-on: ubuntu-latest`.
    *   Status: `- [ ]`

*   **Task 1.5:** Add Code Checkout Step
    *   Action: Use the standard `actions/checkout@v4` action to check out the repository code within the CI job.
    *   Success Criteria: The CI job in `ci.yml` includes a step using `actions/checkout@v4`.
    *   Status: `- [ ]`

*   **Task 1.6:** Add Node.js Setup Step
    *   Action: Use `actions/setup-node@v4` to set up the required Node.js environment (e.g., LTS version). Include caching for `npm` dependencies.
    *   Success Criteria: The CI job includes steps for Node.js setup and npm caching.
    *   Status: `- [ ]`

*   **Task 1.7:** Add Dependency Installation Step
    *   Action: Add a step to run `npm ci`.
    *   Success Criteria: The CI job includes a step executing `npm ci`.
    *   Status: `- [ ]`

*   **Task 1.8:** Add Unit Test Step
    *   Action: Add a step to execute the unit tests using `make test`.
    *   Success Criteria: The CI job includes a step executing `make test`. The workflow job fails if tests fail.
    *   Status: `- [ ]`

*   **Task 1.9:** Add Docker Build Step
    *   Action: Add a step to build the Docker image using `make docker-build`.
    *   Success Criteria: The CI job includes a step executing `make docker-build`. The workflow job fails if the build fails.
    *   Status: `- [ ]`

*   **Task 1.10:** Add Docker MCP Test Step
    *   Action: Add a step to run `make docker-test-mcp`. Capture output and validate it contains expected patterns (e.g., `"tools": [`, `"name": "create_entities"`). Fail if the test or validation fails.
    *   Success Criteria: The CI job includes steps for `make docker-test-mcp` and output validation. The workflow job fails if the test or validation fails.
    *   Status: `- [ ]`

### Phase 2: Automated Release Workflow Setup (Push to Main)

This phase is revised for automatic release triggered by pushes to main.

*   **Task 2.1:** Create Release Workflow File
    *   Action: Create a new file named `release.yml` inside `.github/workflows/`.
    *   Success Criteria: The file `.github/workflows/release.yml` exists.
    *   Status: `- [ ]`

*   **Task 2.2:** Define Release Workflow Triggers *(Revised)*
    *   Action: Configure `release.yml` to trigger on `push` events to the `main` branch. Add path filters if needed.
    *   Success Criteria: `release.yml` contains `on: push: branches: [ main ]`.
    *   Status: `- [ ]`

*   **Task 2.3:** Define Release Job Environment and Permissions *(Revised)*
    *   Action: Configure the release job (`runs-on: ubuntu-latest`). Grant necessary permissions: `contents: write`, `issues: write`, `pull-requests: write`, `packages: write`.
    *   Success Criteria: The release job in `release.yml` specifies `runs-on: ubuntu-latest` and has the required `permissions`.
    *   Status: `- [ ]`

*   **Task 2.4:** Add Code Checkout Step (Full History)
    *   Action: Use `actions/checkout@v4` with `fetch-depth: 0`.
    *   Success Criteria: `release.yml` includes `actions/checkout@v4` with `fetch-depth: 0`.
    *   Status: `- [ ]`

*   **Task 2.5:** Add Node.js Setup Step
    *   Action: Use `actions/setup-node@v4` with caching.
    *   Success Criteria: `release.yml` includes steps for Node.js setup and npm caching.
    *   Status: `- [ ]`

*   **Task 2.6:** Add Dependency Installation Step
    *   Action: Add a step to run `npm ci`.
    *   Success Criteria: `release.yml` includes a step executing `npm ci`.
    *   Status: `- [ ]`

*   **Task 2.7:** Run Semantic Release *(New)*
    *   Action: Use an action like `cycjimmy/semantic-release-action@v4` or configure `npx semantic-release`. Configure plugins (`@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/npm`, `@semantic-release/github`). Pass necessary tokens (`GITHUB_TOKEN`).
    *   Success Criteria: `release.yml` executes semantic-release successfully, resulting in an updated `package.json`, a new Git tag, and a GitHub Release. The action outputs the new version number.
    *   Status: `- [ ]`

*   **Task 2.8:** Set up Docker Buildx
    *   Action: Use `docker/setup-buildx-action@v3`.
    *   Success Criteria: `release.yml` includes `docker/setup-buildx-action@v3`.
    *   Status: `- [ ]`

*   **Task 2.9:** Log in to Docker Hub
    *   Action: Use `docker/login-action@v3` with `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets.
    *   Success Criteria: `release.yml` includes `docker/login-action@v3` configured with repository secrets.
    *   Status: `- [ ]`

*   **Task 2.10:** Extract New Version Tag *(Revised)*
    *   Action: Add a step to get the new version tag created by semantic-release (e.g., from `github.event.release.tag_name` or action output). Store as `NEW_VERSION_TAG`.
    *   Success Criteria: `release.yml` successfully determines the new version tag (e.g., `v1.1.0`) created by semantic-release.
    *   Status: `- [ ]`

*   **Task 2.11:** Build and Push Docker Image with Tags *(Revised)*
    *   Action: Use `docker/build-push-action@v5`. Configure to build, tag image as `jakkaj/mcp-knowledge-graph:${NEW_VERSION_TAG}` and `jakkaj/mcp-knowledge-graph:latest`, and push (`push: true`).
    *   Success Criteria: `release.yml` includes `docker/build-push-action@v5` configured to build, tag correctly, and push to Docker Hub.
    *   Status: `- [ ]`

### Phase 3: Configuration, Documentation, and Secrets

*   **Task 3.1:** Configure Semantic Release *(New)*
    *   Action: Create a semantic-release configuration file (e.g., `.releaserc.json`) defining plugins and aligning with Conventional Commits.
    *   Success Criteria: A valid semantic-release configuration file exists.
    *   Status: `- [ ]`

*   **Task 3.2:** Document Workflows *(Revised)*
    *   Action: Update project documentation explaining CI checks, Conventional Commit requirement, automated releases, required secrets, and the need for branch protection.
    *   Success Criteria: Project documentation is updated and clear.
    *   Status: `- [ ]`

*   **Task 3.3:** Configure GitHub Secrets *(Revised)*
    *   Action: Add/ensure `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, and potentially `GH_TOKEN` (if default `GITHUB_TOKEN` is insufficient for semantic-release) secrets.
    *   Success Criteria: Required secrets are securely stored.
    *   Status: `- [ ]`

*   **Task 3.4:** Configure Branch Protection Rules *(New)*
    *   Action: Recommend configuring GitHub branch protection rules for the `main` branch (`Settings > Branches > Add branch protection rule`). Enable "Require status checks to pass before merging" and select the CI job (e.g., `build-and-test` from `ci.yml`) as a required check.
    *   Success Criteria: Branch protection rules for `main` are configured in GitHub settings to require the CI workflow job to pass before merging. (Manual GitHub UI step).
    *   Status: `- [ ]`

---

### Checklist

**Phase 1: CI Workflow**
- [ ] Task 1.1: Create Workflow Directory Structure
- [ ] Task 1.2: Create CI Workflow File
- [ ] Task 1.3: Define CI Workflow Triggers
- [ ] Task 1.4: Define CI Job Environment
- [ ] Task 1.5: Add Code Checkout Step
- [ ] Task 1.6: Add Node.js Setup Step
- [ ] Task 1.7: Add Dependency Installation Step
- [ ] Task 1.8: Add Unit Test Step
- [ ] Task 1.9: Add Docker Build Step
- [ ] Task 1.10: Add Docker MCP Test Step

**Phase 2: Automated Release Workflow**
- [ ] Task 2.1: Create Release Workflow File
- [ ] Task 2.2: Define Release Workflow Triggers *(Revised)*
- [ ] Task 2.3: Define Release Job Environment and Permissions *(Revised)*
- [ ] Task 2.4: Add Code Checkout Step (Full History)
- [ ] Task 2.5: Add Node.js Setup Step
- [ ] Task 2.6: Add Dependency Installation Step
- [ ] Task 2.7: Run Semantic Release *(New)*
- [ ] Task 2.8: Set up Docker Buildx
- [ ] Task 2.9: Log in to Docker Hub
- [ ] Task 2.10: Extract New Version Tag *(Revised)*
- [ ] Task 2.11: Build and Push Docker Image with Tags *(Revised)*

**Phase 3: Configuration, Documentation, and Secrets**
- [ ] Task 3.1: Configure Semantic Release *(New)*
- [ ] Task 3.2: Document Workflows *(Revised)*
- [ ] Task 3.3: Configure GitHub Secrets *(Revised)*
- [ ] Task 3.4: Configure Branch Protection Rules *(New)*

---

### Overall Success Criteria (Revised)

*   Pull requests to the `main` branch successfully trigger the `ci.yml` workflow, running all checks.
*   GitHub branch protection rules prevent merging PRs to `main` unless the required status check(s) from `ci.yml` pass.
*   Merging a pull request with Conventional Commit messages into `main` triggers the `release.yml` workflow.
*   The release workflow successfully runs semantic-release, determines version bump, updates `package.json`, creates Git tag, generates release notes, creates GitHub Release, builds Docker image, and pushes tagged image (`vX.Y.Z` and `latest`) to Docker Hub.
*   Commits without release-triggering Conventional Commit prefixes merged to `main` do not trigger a new release.
*   The process, including Conventional Commits and branch protection, is documented, and required secrets/configurations are set up.

---
# Plan: Finalize GHCR Migration (Issue #13)

> **Note:** This plan was updated on 2025-04-28 to reflect that all tasks have been completed and the migration is fully released.

This plan outlines the steps to review, test, merge, and document the migration from Docker Hub to GitHub Container Registry (GHCR) as implemented in the `update-release-pipeline` branch.

## Phase 1: Review and Testing

- [x] **Task 1.1:** Review code changes in the `update-release-pipeline` branch.
    - Verify `.github/workflows/release.yml` uses `GITHUB_TOKEN` for GHCR login and targets `ghcr.io`.
    - Verify `README.md` contains updated pull/run commands for `ghcr.io`.
- [x] **Task 1.2:** Test the release workflow.
    - Manually trigger the `release.yml` workflow on the `update-release-pipeline` branch.
    - Confirm the workflow run succeeds, specifically the login and push steps to GHCR.
- [x] **Task 1.3:** Verify the container image on GHCR.
    - Check the GHCR page for the `jakkaj/mcp-knowledge-graph-improved` repository to ensure the new image tag was pushed successfully.
- [x] **Task 1.4:** Test the published image.
    - Use the updated commands from `README.md` to pull and run the container image from GHCR locally.
    - Perform basic checks to ensure the container runs as expected.

## Phase 2: Merge and Documentation Update

- [x] **Task 2.1:** Create Pull Request.
    - Open a PR from `update-release-pipeline` to `main`.
    - Link issue #13 in the PR description.
- [x] **Task 2.2:** Verify CI Checks.
    - Ensure all automated checks pass on the PR. Address any failures.
- [x] **Task 2.3:** Merge Pull Request.
    - Once checks pass and any necessary reviews are complete, merge the PR into `main` using a **squash merge**.
- [x] **Task 2.4:** Update Contributor Documentation.
    - Review `CONTRIBUTING.md` and any other relevant developer documentation.
    - Update any sections that might still refer to Docker Hub publishing or credentials, ensuring they reflect the new GHCR process.
- [x] **Task 2.5:** Delete Branch.
    - Delete the `update-release-pipeline` branch after successful merge.

## Phase 3: Update Knowledge Graph Memory

- [x] **Task 3.1:** Record changes in memory.
    - Create/update relevant entities (`SourceFile`, `FileChange`, potentially `CI/CD Pipeline`) in the knowledge graph to reflect the migration to GHCR and the use of `GITHUB_TOKEN`. Link the `FileChange` to this plan entity.

## Success Criteria

- The `release.yml` workflow consistently pushes tagged releases to GHCR using `GITHUB_TOKEN`.
- Developers can successfully pull and run the application using the instructions in `README.md`.
- The `main` branch incorporates the GHCR migration changes.
- All relevant documentation accurately reflects the GHCR publishing process.
- The knowledge graph memory is updated to reflect the CI/CD changes.
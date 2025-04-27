# Test Results in GitHub UI

This document explains how test results are displayed in the GitHub UI for the MCP Knowledge Graph Improved project.

## Overview

The project uses GitHub Actions to run tests and display test results in a user-friendly way directly in the GitHub UI. Two types of tests are run:

1. **Unit Tests**: Mocha tests that validate the core functionality of the Knowledge Graph
2. **Docker MCP Tests**: Tests that validate the functionality of the MCP server running in a Docker container

## How to View Test Results

Test results are automatically published for both Pull Requests and Release workflows. Here's how to access them:

### For Pull Requests

1. Navigate to the Pull Request in GitHub
2. In the PR conversation tab, scroll down to the "Checks" section
3. Click on "Details" next to the "CI Checks" workflow
4. In the workflow run view, you'll see two test reports:
   - **Mocha Tests**: Results from unit tests
   - **Docker MCP Tests**: Results from Docker container tests

### For Releases

1. Navigate to the Actions tab in the GitHub repository
2. Find and click on the relevant Release workflow run
3. Similar to Pull Requests, you'll see test reports for both Mocha and Docker tests

## Understanding Test Results

### Test Summary

For each test run, GitHub provides a summary showing:
- Total number of tests
- Number of passing tests
- Number of failing tests
- Test execution time

### Test Details

Clicking on a specific test suite expands it to show:
- Individual test cases within the suite
- Test execution time for each test
- Error messages and stack traces for failing tests

### Test Artifacts

In addition to the visual reports, test results are also saved as artifacts:
- **unit-test-results**: Contains the XML report for unit tests
- **docker-test-results**: Contains the XML report for Docker tests

These artifacts can be downloaded for further analysis if needed.

## Troubleshooting Failed Tests

When tests fail, the GitHub UI provides several helpful features:

1. **Visual Indicators**: Failed tests are highlighted in red
2. **Error Messages**: The exact assertion error is displayed
3. **Stack Traces**: Shows where in the code the failure occurred
4. **Annotations**: GitHub may add annotations to the code where failures occur

## Local Test Execution

For local development, you can run tests using:

- `make test`: Runs tests and generates XML reports (same as CI)
- `make test-local`: Runs tests without generating XML reports (faster for local dev)

## Best Practices

1. **Always check test results** before merging a PR
2. **Fix failing tests** before requesting reviews
3. **Include tests** for any new functionality
4. If a test is failing in CI but passing locally, use the test reports to identify environment-specific issues
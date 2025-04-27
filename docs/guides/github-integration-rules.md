# GitHub Integration Rules


- We are using GitHub issues via the `github` MCP server tools.
- Commit messages should follow the Conventional Commits specification (see section below).
- The issue number will be provided, or it will be at the top of the plan being worked from.
- When you create a plan, first get the issue using the `github` MCP server's `get_issue` tool to ensure it is synced before updating! You must do this to avoid overwriting changes.  
  Example:  
  `<use_mcp_tool><server_name>github</server_name><tool_name>get_issue</tool_name><arguments>{"owner":"<owner>", "repo":"<repo>", "issue_number":<number>}</arguments></use_mcp_tool>`
- You may be asked to pull an issue to start working on a new plan based on it.
- Update issues using the `github` MCP server's `update_issue` tool. You may need to read the plan file content first and include it in the 'body' argument.  
  Example:  
  `<use_mcp_tool><server_name>github</server_name><tool_name>update_issue</tool_name><arguments>{"owner":"<owner>", "repo":"<repo>", "issue_number":<number>, "title":"<title>", "body":"<plan content>"}</arguments></use_mcp_tool>`
- As you work on tasks and check them off in the plan document, sync that plan to the GitHub issue.
- As you update issues in GitHub, add a comment with what the change was.
- When using `update_issue` with markdown content in the `body`, use literal newlines (`\n`) within the JSON string for correct GitHub rendering, but still escape quotes as `\\"`.
- For detailed guidance on working with GitHub workflows, PRs, and Git operations, refer to: `docs/guides/github-workflow/llm-agent-github-guide.md`

## Conventional Commits and Semantic Versioning

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated version management and release creation. All commit messages **MUST** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification to properly trigger semantic versioning.

### Commit Message Format

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

#### Breaking Changes

If the commit includes a breaking change, you must indicate this in one of two ways:

1. Append `!` after the type/scope: `feat!: change API response format`
2. Include `BREAKING CHANGE:` in the footer followed by a description

Breaking changes trigger a MAJOR version increment.

#### Scope

The scope is optional and should indicate the part of the codebase that's affected:

- `search`: Search functionality
- `server`: MCP server
- `graph`: Knowledge graph
- `cli`: CLI components
- `docs`: Documentation
- `ci`: CI/CD workflow

#### Referencing Issues

When a commit addresses a specific issue, reference it in the footer:

```
fix(server): resolve connection timeout issue

Fixes #123
```

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

```
docs(guides): update GitHub integration guidelines

Update guidelines to include conventional commits instructions.
```

### Automated Release Process

When code is merged to the main branch, the following automated process occurs:

1. GitHub Actions runs the release workflow
2. semantic-release determines the next version number based on commit messages
3. A new GitHub release is created with automatically generated release notes
4. A Docker image is built and published with the new version tag

There's no need to manually update version numbers or create release tags - this is all handled automatically based on your commit messages.
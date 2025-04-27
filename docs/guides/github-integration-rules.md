# GitHub Integration Rules

- Commit messages should be in AngularJS format.
- We are using GitHub issues via the `github` MCP server tools.
- Commit messages should be in Angular commit format.
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
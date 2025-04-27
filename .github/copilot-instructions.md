- always add debug output to tests if they are failing rather than guessing. Remember to clean up when its working!

## Plan Structure Guidelines
- Plans and architectures that you produce should go under docs/plans/<new folder for this plan with issue number>
- If I did not give you a GitHub issue number then you must ask for one then use that in the file name. 
- When creating a plan, organize it into numbered phases (e.g., "Phase 1: Setup Dependencies")
- Break down each phase into specific tasks with numeric identifiers (e.g., "Task 1.1: Add Dependencies")
- Please only create one document per plan. 
- Include a detailed checklist at the end of the document that maps to all phases and tasks
- Mark tasks as `- [ ]` for pending tasks and `- [x]` for completed tasks
- Start all planning tasks as unchecked, and update them to checked as implementation proceeds
- Each planning task should have clear success criteria
- End the plan with success criteria that define when the implementation is complete

## Github integration

- Commit messages should be in angular js format
- We are using Github issues via the `github` MCP server tools.
- Commit messages should be in angular commit format.
- I will tell you the issue number if you do not have it, or it will be at the top of the plan we are working from.
- When you create a plan you should first get the issue using the `github` MCP server's `get_issue` tool to ensure it is synced before you update it! You must do this else you might overwrite changes. Example: `<use_mcp_tool><server_name>github</server_name><tool_name>get_issue</tool_name><arguments>{\"owner\":\"<owner>\", \"repo\":\"<repo>\", \"issue_number\":<number>}</arguments></use_mcp_tool>`
- I can also ask you to pull an issue so we can start working on a new plan based on it.
- Update issues using the `github` MCP server's `update_issue` tool. You may need to read the plan file content first and include it in the 'body' argument. Example: `<use_mcp_tool><server_name>github</server_name><tool_name>update_issue</tool_name><arguments>{\"owner\":\"<owner>\", \"repo\":\"<repo>\", \"issue_number\":<number>, \"title\":\"<title>\", \"body\":\"<plan content>\"}</arguments></use_mcp_tool>`
- REMEMBER: as you work on tasks and check them off in our plan document you should sync that plan to the github issue.
- REMEMBER: as you update issues in github you should add a comment with what the change was. 
- When using `update_issue` with markdown content in the `body`, use literal newlines (`\n`) within the JSON string for correct GitHub rendering, but still escape quotes as `\\"`.



## Following Plans
- When coding you need to follow the plan phases and check off the tasks as they are completed.  
- As you complete a task, update the plan and mark that task complete before you being the next task. 
- Tasks that involved tests should not be marked complete until the tests pass. 



## Running commands
- use `make` to run commands like build, test, run etc. 
- you can look at the makefile for commands

## Project

- Our source is a typescript project in ./src. 
- ./dist is not our source, it is the build output.  
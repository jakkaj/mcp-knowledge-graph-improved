## Plan Structure Guidelines
- When creating a plan, organize it into numbered phases (e.g., "Phase 1: Setup Dependencies")
- Break down each phase into specific tasks with numeric identifiers (e.g., "Task 1.1: Add Dependencies")
- Please only create one document per plan. 
- Include a detailed checklist at the end of the document that maps to all phases and tasks
- Mark tasks as `- [ ]` for pending tasks and `- [x]` for completed tasks
- Start all planning tasks as unchecked, and update them to checked as implementation proceeds
- Each planning task should have clear success criteria
- End the plan with success criteria that define when the implementation is complete
- plans and architectures that you produce should go under docs/plans/<new folder for this plan>

## Following Plans
- When coding you need to follow the plan phases and check off the tasks as they are completed.  
- As you complete a task, update the plan and mark that task complete before you being the next task. 
- Tasks that involved tests should not be marked complete until the tests pass. 


- always add debug output to tests if they are failing rather than guessing. Remember to clean up when its working!
- Commit messages should be in angular js format

## Running commands
- use `make` to run commands like build, test, run etc. 
- you can look at the makefile for commands


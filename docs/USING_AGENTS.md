# Working with the agents

Open this repository folder as a project in the app. Start a task in that project and describe the result you want in ordinary language. The repository files hold continuity; you do not have to copy old chats into every task.

A useful starting prompt:

> Read AGENTS.md and the current project status/context and migration handoff. I want [specific outcome]. Done means [observable checks]. Make a scoped branch change, test it, use a separate reviewer agent to review the exact final revision, address findings, update the handoff and open a draft PR. Do not merge, deploy, install or change real media/settings without my approval. Tell me the result, limitations and next action.

To resume:

> Continue from the latest repository handoff. Check the actual Git state and open PRs before editing; tell me if the recorded context is stale.

To review:

> Review PR [URL] with a separate reviewer agent. Report actionable correctness, safety and test gaps against the exact commit. Do not edit production data or merge it.

Ask explicitly for a separate reviewer/subagents when you want delegation. This is an on-demand workflow, not an always-running team. A different agent can challenge the implementation, but it cannot replace the owner's decision or prove runtime behaviour with a source check. Agent activity uses account usage; no new API service is configured by these files.

When work is ready, inspect the PR summary, relevant checks and unresolved risks. Say “merge PR [URL]” only when you want it merged. A source merge and an app installation/deployment are separate outcomes; request both if both are intended. Do not use two tools to edit the same checkout concurrently. Another assistant can work on its own branch using the same handoff convention.

Each completed task should record the base/final revision, what changed, actual checks, skipped checks, review findings and next action. Keep credentials and private/client information out of public repositories. Repository instructions are process guidance; they do not enforce permissions or enable automatic synchronization of conversations.

Official references: https://learn.chatgpt.com/docs/agent-configuration/subagents and https://learn.chatgpt.com/docs/projects

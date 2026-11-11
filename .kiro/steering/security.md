# FlowPilot — Security Steering

The runner executes commands, so these rules are mandatory.

1. **Allowlist only.** The runner may execute only commands defined in a fixed allowlist (e.g. `npm run lint`, `npm test`). Never pass free-form strings from the AI or the user to a shell.
2. **Signed, validated jobs.** Every job sent to a runner carries a signature and is validated with the shared Zod schema. The runner rejects unknown, expired, or unsigned jobs.
3. **Least privilege tools.** AI tools are scoped: read-only tools by default; sensitive tools (modify file, commit, create PR) are out of MVP and, if added, must go through the Approval node.
4. **Sandbox.** Sandbox runner: non-root user, CPU/memory/time limits, no outbound network, no secrets mounted, read-only repo mount where possible.
5. **Secrets.** Never log secrets, never put them in prompts. Mask known secret patterns in run output before storing or displaying.
6. **Agent limits.** Cap the number of agent steps per run and the size of diffs sent to the model.
7. **Transparency.** Every tool call, its arguments, and its output are logged and visible in the run view.
8. **Tokens.** Runner tokens are per-runner, revocable, and stored hashed.

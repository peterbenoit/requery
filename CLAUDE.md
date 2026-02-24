# reQuery — Claude Code Instructions

@AGENTS.md

---

## Claude-Specific Guidance

### Working Style
- Implement changes directly — don't just suggest them unless the user asks for options
- When editing a file, read enough context (at least 10 lines around a change) before editing
- After editing, check for errors before reporting completion
- Prefer `multi_replace_string_in_file` for multiple edits in the same session

### What to return to the user
- Brief confirmation of what was done
- Any decisions made that deviate from the plan (explain why)
- If a phase is incomplete, say so explicitly — don't present partial work as finished

### File Editing Rules
- Never create a summary markdown file unless the user asks
- Never create a `.bak` or temp file
- When creating a new source file, also create the corresponding test file skeleton

### Prohibited Actions
- Do not run `npm install` without confirming with the user if adding a new dependency
- Do not modify `dist/` files directly — always rebuild via `npm run build`
- Do not add TypeScript types or rename files to `.ts` unless explicitly asked

# reQuery — Gemini Instructions

@./AGENTS.md

---

## Gemini-Specific Guidance

### Working Style
- Implement changes directly rather than describing them
- Use the project's existing code patterns when adding new features
- When uncertain about a design decision, check `AGENTS.md` philosophy first,
  then check existing source files for established patterns

### Suggestions Policy
- Do not suggest migrating to TypeScript
- Do not suggest replacing jQuery with a modern framework
- Do not suggest adding a build step for end users
- Do not introduce new dependencies without user approval

### Context Awareness
- This is a jQuery 4 plugin — jQuery is a peer dependency, not bundled
- The `$` global is jQuery — do not redefine or shadow it
- State storage uses a WeakMap — do not switch to `$.data()` or element attributes

### Code Generation
- Match existing indentation (2 spaces) and quote style (single quotes)
- Add JSDoc to any new public function
- Test files live in `test/` and mirror the `src/core/` structure

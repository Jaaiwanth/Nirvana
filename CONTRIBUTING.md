# Contributing to NIRVANA

Thank you for contributing to NIRVANA.

This document defines the standard workflow for contributing code, documentation, tests, and other changes to the repository. The goal is to keep development consistent, reviewable, and easy to integrate.

For project architecture, implementation details, and current development status, refer to:

* `IMPLEMENTATION.md` — source of truth for the current implementation and architecture.
* `PROGRESS_TRACKER.md` — source of truth for current tasks and progress.

---

## 1. Before You Start

Before working on a change:

1. Make sure your local repository is up to date.
2. Check `PROGRESS_TRACKER.md` for existing work.
3. Check open Issues and Pull Requests to avoid duplicating work.
4. For larger changes, discuss the approach before implementation.
5. Do not modify an existing architectural contract without coordinating with the relevant contributors.

If your change affects a shared interface, API contract, database model, or major architectural component, mention it clearly in the Pull Request.

---

## 2. Repository Setup

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install the required dependencies for the project.

For the backend:

```bash
cd backend
npm install
```

For the frontend:

```bash
cd frontend
npm install
```

Follow the project-specific setup instructions in `IMPLEMENTATION.md` when additional configuration is required.

### Environment Variables

Never commit secrets, API keys, credentials, tokens, or local environment files.

Use the provided environment example files where applicable:

```text
.env.example
```

Create your local `.env` file from the example and keep it untracked.

---

## 3. Branching Strategy

Do not work directly on `main`.

Create a dedicated branch for every change:

```text
feature/<short-description>
fix/<short-description>
refactor/<short-description>
docs/<short-description>
test/<short-description>
chore/<short-description>
```

Examples:

```text
feature/incident-dashboard
feature/route-visualization
fix/incident-validation
refactor/dispatch-service
docs/api-documentation
test/agent-evaluation
```

Keep branches focused on a single logical change.

---

## 4. Keeping Your Branch Updated

Before starting work, update your local `main`:

```bash
git checkout main
git pull origin main
```

Create your feature branch:

```bash
git checkout -b feature/<short-description>
```

Before opening a Pull Request, make sure your branch is up to date with `main`.

```bash
git fetch origin
git rebase origin/main
```

Resolve conflicts locally and verify that the project still builds and tests successfully.

---

## 5. Code Quality Guidelines

Contributions should prioritize:

* Readability
* Maintainability
* Clear separation of responsibilities
* Consistent naming
* Strong typing
* Reusable components and services
* Minimal duplication
* Explicit error handling
* Appropriate validation
* Testability

Avoid introducing unnecessary complexity.

Do not make unrelated changes in the same Pull Request.

For example, a feature PR should not also contain unrelated formatting changes, dependency upgrades, or large-scale refactoring unless they are required for the feature.

---

## 6. TypeScript Guidelines

Use TypeScript types wherever possible.

Prefer explicit interfaces or types for shared contracts and structured data.

Avoid unnecessary use of:

```typescript
any
```

Use runtime validation where external or untrusted data enters the application.

When modifying shared types or interfaces, consider all consumers before making the change.

---

## 7. Commit Guidelines

Use Conventional Commits.

Format:

```text
<type>(<scope>): <description>
```

Common types:

```text
feat
fix
refactor
test
docs
chore
perf
build
```

Examples:

```text
feat: add incident creation endpoint
feat(frontend): add emergency status panel
fix(backend): handle invalid incident coordinates
refactor: simplify dispatch service
test: add incident validation tests
docs: update API documentation
chore: update dependencies
```

Keep commit messages:

* Short and descriptive
* Written in the imperative mood
* Focused on one logical change

Avoid commits such as:

```text
update
changes
fixed stuff
final
final-final
working
```

---

## 8. Testing

Every contribution should be tested before opening a Pull Request.

At minimum:

* Verify the affected functionality manually where appropriate.
* Run the relevant test suite.
* Run the project build.
* Run linting and formatting checks if configured.

Typical checks include:

```bash
npm run build
npm run lint
npm test
```

Only run commands that are defined by the relevant project package.

If a change cannot reasonably be tested automatically, explain the manual verification performed in the Pull Request.

---

## 9. Pull Request Guidelines

Open a Pull Request against:

```text
main
```

A Pull Request should contain:

### Title

Use a clear, concise description.

Examples:

```text
feat: add emergency incident workflow
fix: handle invalid dispatch coordinates
refactor: simplify resource repository
```

### Description

Include:

* What changed
* Why the change was needed
* How it was implemented
* How it was tested
* Any relevant limitations or follow-up work

Example:

```markdown
## Summary

- Added incident creation workflow
- Added request validation
- Added error handling for invalid coordinates

## Testing

- npm run lint
- npm run build
- npm test

## Notes

No existing API contracts were modified.
```

---

## 10. Pull Request Checklist

Before requesting review, verify:

* [ ] The branch is based on the latest `main`.
* [ ] The change is limited to the intended scope.
* [ ] TypeScript/build checks pass.
* [ ] Linting passes.
* [ ] Relevant tests pass.
* [ ] New functionality has appropriate tests.
* [ ] No secrets or credentials are committed.
* [ ] No unnecessary dependencies were added.
* [ ] Documentation was updated if required.
* [ ] Shared interfaces or contracts were reviewed for compatibility.
* [ ] The corresponding task/issue is referenced where applicable.

---

## 11. Code Review

All changes should go through Pull Request review before being merged into `main`.

Reviewers should focus on:

* Correctness
* Security
* Maintainability
* Architecture
* Error handling
* Performance where relevant
* Test coverage
* API/interface compatibility
* Unnecessary complexity

Contributors should address review comments or explicitly discuss disagreements before merging.

Do not take review comments personally. The goal of review is to improve the codebase, not to evaluate the contributor.

---

## 12. Merge Requirements

A Pull Request should be merged only when:

1. Required reviews have been completed.
2. CI checks are passing.
3. Merge conflicts are resolved.
4. Review comments have been addressed.
5. The implementation satisfies the associated requirement or issue.
6. No secrets or unintended files are included.

Prefer **squash merging** when appropriate to keep the `main` history clean.

---

## 13. Issues and Feature Requests

When opening an Issue, provide enough information for another contributor to understand the problem.

### Bug Reports

Include:

* Description of the problem
* Steps to reproduce
* Expected behavior
* Actual behavior
* Relevant logs or screenshots
* Environment information
* Related Issue or Pull Request, if applicable

### Feature Requests

Include:

* Problem being solved
* Proposed behavior
* Expected outcome
* Relevant context
* Potential impact on existing functionality

Avoid opening duplicate Issues. Search existing Issues first.

---

## 14. Documentation Contributions

Documentation changes are welcome.

Keep documentation:

* Accurate
* Concise
* Easy to follow
* Consistent with the current implementation

When implementation changes invalidate existing documentation, update the relevant documentation in the same Pull Request whenever practical.

---

## 15. Security

Never commit:

* API keys
* Passwords
* Access tokens
* Private keys
* `.env` files containing secrets
* Credentials
* Personally sensitive data

If you discover a security vulnerability, **do not disclose sensitive details in a public Issue**.

Report security issues through the repository's designated private security reporting mechanism.

---

## 16. Dependency Changes

Do not add a dependency unless it provides a clear benefit.

Before adding a dependency, consider:

* Whether the functionality can be implemented using existing dependencies.
* Maintenance and community support.
* Security implications.
* Bundle/runtime impact.
* License compatibility.
* Whether the dependency is necessary for production.

Dependency upgrades should be isolated from unrelated feature changes whenever possible.

---

## 17. Keeping Changes Focused

Small, focused Pull Requests are preferred.

Good:

```text
PR #42 — Add incident validation
```

Avoid combining:

```text
Add incident validation
+
Rewrite dispatch service
+
Update dependencies
+
Reformat entire project
+
Change README
```

unless those changes are genuinely required together.

Focused changes are easier to review, test, revert, and maintain.

---

## 18. Contribution Workflow

The standard workflow is:

```text
1. Check Issues / PROGRESS_TRACKER.md
              ↓
2. Update local main
              ↓
3. Create feature branch
              ↓
4. Implement change
              ↓
5. Write/update tests
              ↓
6. Run build + lint + tests
              ↓
7. Commit using Conventional Commits
              ↓
8. Push branch
              ↓
9. Open Pull Request
              ↓
10. Address review feedback
              ↓
11. CI + approval
              ↓
12. Merge into main
```

---

## 19. General Principles

When contributing to NIRVANA:

> **Keep it simple. Keep it typed. Keep it tested.**

Prioritize correctness and maintainability over short-term implementation speed.

If you are unsure about an architectural decision, API contract, or significant implementation change, discuss it with the team before introducing it into the codebase.

Thank you for contributing to NIRVANA.

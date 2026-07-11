# Git Skill

## Purpose
Standardized git workflow for Scout AI — Conventional Commits, branch from main, squash-merge PRs.

## When to Use
- Starting new work
- Committing changes
- Creating or reviewing pull requests
- Resolving merge conflicts

## Workflow
1. Pull latest `main` and branch from it: `git checkout -b feat/my-feature`
2. Make atomic commits with Conventional Commits format
3. Push branch and open a pull request
4. Squash-merge PR into main — one clean commit per feature
5. Delete branch after merge

## Commit Format
```
<type>: <short description>

<optional body>
```

Types: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `perf:`

## Checklist
- [ ] Branch created from latest `main`
- [ ] Commits follow Conventional Commits format
- [ ] Commits are atomic — one logical change per commit
- [ ] No `.env` files or secrets committed
- [ ] No force push
- [ ] PR squash-merged into main
- [ ] Branch deleted after merge

## Best Practices
- One commit per logical change — makes review and revert easier
- Write commit messages that explain *why*, not just *what*
- Squash-merge PRs to keep main history clean
- Branch from main, not from other feature branches
- Use `git status` and `git diff` before committing

## Common Mistakes
- Force pushing to shared branches
- Committing `.env` files or secrets
- Writing vague commit messages ("fix stuff", "update")
- Merging without squashing — cluttered history
- Branching from feature branches instead of main

## Exit Criteria
- [ ] Branch created from latest `main`
- [ ] Commits follow Conventional Commits format
- [ ] No `.env` files or secrets in commit
- [ ] PR squash-merged into main
- [ ] Branch deleted after merge

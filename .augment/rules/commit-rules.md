---
type: "always_apply"
---

# Git Commit Message Rules

To keep the commit history clean and meaningful, follow these rules for all commit messages:

## Commit Message Structure

```
<prefix>(optional scope): <short summary>

[optional body]
[optional footer]
```

### Prefixes
- **feat**: A new feature
- **fix**: A bug fix
- **chore**: Maintenance, build process, or auxiliary tool changes
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **ci**: Changes to CI configuration files and scripts

### Examples
- `feat: add user login functionality`
- `fix(auth): handle expired token error`
- `chore: update dependencies`
- `docs: add API usage section to README`
- `style: reformat About page code`
- `refactor: simplify video player logic`
- `perf: optimize image loading`
- `test: add tests for watchlist service`
- `ci: update GitHub Actions workflow`

## Additional Guidelines
- Use the imperative mood in the subject line (e.g., "add" not "added" or "adds").
- Limit the subject line to 72 characters.
- Capitalize the subject line.
- Do not end the subject line with a period.
- Use the body to explain what and why vs. how, if necessary.
- Reference issues and PRs in the footer if applicable.

---

Following these rules helps everyone understand the history and purpose of changes in the project.

# Contributing to FlowPilot

Thank you for your interest in contributing to **FlowPilot**! To maintain code quality, consistency, and clear communication across the team, please adhere to the following guidelines.

---

## 1. Branch Naming Conventions

All branches should branch off the `main` branch (or target development branch) and use the following prefix convention:

- `feature/<short-description>`: New features or functional additions.
- `bugfix/<short-description>`: Bug fixes and issue patches.
- `docs/<short-description>`: Documentation changes or additions.
- `refactor/<short-description>`: Code changes that neither fix a bug nor add a feature.
- `chore/<short-description>`: Routine tasks, repository configurations, or dependency maintenance.

**Examples:**
- `feature/workflow-dag-schema`
- `bugfix/runner-timeout-handling`
- `docs/add-architecture-diagram`

---

## 2. Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (formatting, white-space).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to build process, tooling, or auxiliary files.

### Commit Guidelines
- Use the imperative present tense: "add workflow validator", not "added workflow validator".
- Keep the summary line concise (72 characters or fewer).
- Reference relevant issue numbers when applicable (e.g., `fix(runner): handle socket reconnect (#42)`).

---

## 3. Pull Request Guidelines

1. **Keep PRs Focused**: A single pull request should address a single concern or feature. Avoid large, multi-purpose PRs.
2. **Follow the Template**: Complete all sections in the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
3. **Link Associated Issues**: Reference related issues in the PR description (e.g., `Closes #12`).
4. **Pass Automated Checks**: Ensure all linting, formatting, and test suites pass before requesting review.
5. **Request Review**: Tag appropriate maintainers for review. Address all feedback promptly.

---

## 4. Documentation Standards

- Keep documentation synchronized with code changes. If a PR alters behavior, APIs, or configuration, update the relevant files in `docs/` or `README.md`.
- Write clear, concise, and professional English.
- Use GitHub Flavored Markdown (GFM) formatting consistently.
- Mark tentative or unconfirmed technical sections clearly as `TBD` or `Draft`.

---

## 5. Code Quality Expectations

- **Formatting & Linting**: Maintain uniform formatting according to `.editorconfig` and future linting configurations.
- **Type Safety**: Write strict TypeScript with descriptive types and interfaces; avoid `any` whenever possible.
- **Testing**: Accompany new features and bug fixes with corresponding unit and integration tests.
- **No Dead Code**: Remove commented-out code, debug statements, and temporary scratch files before opening a PR.
- **Security Consciousness**: Never commit credentials, secrets, private keys, or personal environment files (`.env`).

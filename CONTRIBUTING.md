# Contributing to ASAP Client

Thank you for your interest in contributing to the ASAP frontend. This guide covers everything you need to get started.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation
- **ESLint** with TypeScript and React rules

## Prerequisites

- Node.js 20+
- Yarn

## Local Setup

```bash
# 1. Fork and clone the repo
git clone https://github.com/asap-open/asap-client.git
cd asap-client

# 2. Install dependencies
yarn install

# 3. Copy and configure environment
cp .env.example .env
# Set VITE_API_URL to your backend URL (e.g. http://localhost:3000)

# 4. Start the dev server
yarn dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start Vite dev server with HMR |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | Run ESLint across all source files |

## Project Structure

```
src/
  components/     # Feature-grouped UI components
    dashboard/    # Dashboard views (exercises, home, progress)
    profile/      # Profile management
    session/      # Active session tracking
    settings/     # App settings
    ui/           # Shared/primitive UI components
  context/        # React context providers (Auth, Theme)
  layouts/        # Page layout wrappers
  pages/          # Top-level route pages
  services/       # API service modules (routines, sessions)
  utils/          # Helpers (api client, cache, SWR, etc.)
```

## Contribution Guidelines

### Branching

Use descriptive branch names:

```
feat/add-exercise-filters
fix/session-timer-reset
refactor/profile-form-validation
```

### Code Style

- Follow existing patterns within each component/utility
- Use TypeScript — avoid `any`; type all props and return values
- Use Tailwind utility classes for all styling; avoid inline `style` props
- Prefer named exports over default exports for components
- Keep components focused — extract logic into hooks or utils when it grows large

### Commits

Write clear commit messages in the imperative mood:

```
feat: add muscle group filter to exercise search
fix: prevent double-submit on session save
refactor: extract useSessionTimer into custom hook
```

### Pull Requests

1. Fork the repository
2. Create a feature branch off `main`
3. Make your changes with appropriate commits
4. Run `yarn lint` and fix any issues
5. Run `yarn build` to confirm no TypeScript errors
6. Open a PR with a clear description of what changed and why

## What We Welcome

- Bug fixes with a clear description of the issue
- UI/UX improvements with before/after context
- New components that follow existing patterns
- Performance improvements
- Accessibility improvements
- Test coverage additions

## Questions

Open an issue if you're unsure about something before starting a large change — it saves time for everyone.

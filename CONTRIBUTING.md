# Contributing to React Smart Image

Thanks for taking the time to contribute! This project is a zero-dependency, TypeScript-first React component, so we try to keep contributions lightweight and focused.

## Getting Started

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/react-smart-image.git
   cd react-smart-image
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a branch for your change:

   ```bash
   git checkout -b fix/short-description
   ```

## Development Workflow

| Command | Purpose |
| --- | --- |
| `npm run dev` | Builds the library in watch mode |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run typecheck` | Type-checks the project without emitting output |
| `npm run build` | Produces the production build in `dist/` |

Source code lives in [src/](src/):

- [SmartImage.tsx](src/SmartImage.tsx) — the main component
- [SmartImageProvider.tsx](src/SmartImageProvider.tsx) — context provider for global config/presets
- [Lightbox.tsx](src/Lightbox.tsx) / [ZoomMagnifier.tsx](src/ZoomMagnifier.tsx) — click-to-zoom UI
- [hooks/](src/hooks/) — intersection observer, image loading, and responsive width hooks
- [cache.ts](src/cache.ts) — image load/prefetch cache
- [__tests__/](src/__tests__/) — Vitest + Testing Library tests

## Before Opening a Pull Request

- **Add or update tests** for any behavior change. New features should ship with test coverage in [src/__tests__/](src/__tests__/).
- **Run the full check locally:**

  ```bash
  npm run typecheck && npm test
  ```

- **Update the README** if you add, rename, or remove a prop, hook, or exported API.
- **Keep changes focused.** Prefer several small, reviewable PRs over one large PR that mixes unrelated fixes and features.
- **Follow existing code style** — no linter is enforced yet, so match the conventions already used in the surrounding file (naming, formatting, no unnecessary comments).
- Since this package has **zero runtime dependencies**, avoid introducing new ones unless there's no reasonable way to implement the feature without them. Discuss it in an issue first if you think one is needed.

## Reporting Bugs

Open an issue at [github.com/concatstring-account/react-smart-image/issues](https://github.com/concatstring-account/react-smart-image/issues) and include:

- A minimal reproduction (code sandbox, snippet, or repo)
- Expected vs. actual behavior
- React version and browser/environment details

## Suggesting Features

Open an issue describing the use case before submitting a large PR — this helps avoid wasted effort if the feature doesn't fit the library's scope (a dependency-free `<img>` replacement).

## Pull Request Process

1. Ensure `npm run typecheck` and `npm test` pass.
2. Fill out the PR description: what changed and why.
3. Link any related issue.
4. A maintainer will review and may request changes before merging.

## Code of Conduct

Be respectful and constructive. Assume good intent, and keep discussions focused on the code and the problem at hand.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

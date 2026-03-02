# TDD Development Guidelines

**All code changes MUST follow Test-Driven Development (TDD):**

1. **Red** — Write a failing test that describes the desired behavior
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Clean up while keeping tests green

## Rules

- Never push code without corresponding tests
- Write tests BEFORE implementation code
- Each bug fix must start with a test that reproduces the bug
- Each new feature must start with a test that describes the expected behavior
- Run `npm test` before every commit

## Project

- **Stack**: React 19, TypeScript, Vite, Tailwind CSS, Dexie (IndexedDB), Anthropic SDK
- **Test framework**: Vitest + React Testing Library + fake-indexeddb
- **Test command**: `npm test` (runs `vitest run`)
- **Lint command**: `npm run lint`
- **Build command**: `npm run build`

## Test Conventions

- Test files live next to source files: `Foo.tsx` → `Foo.test.tsx`
- Use factory helpers from `src/test/helpers.tsx` (`makePlan`, `makeRoutine`, etc.)
- Call `resetDb()` in `beforeEach` for database tests
- Use `renderWithRouter()` for component tests needing routing
- Mock external APIs (Anthropic SDK) with `vi.mock()`

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks:

### Pre-commit Hook

- Uses [lint-staged](https://github.com/okonet/lint-staged) to run linters only on staged files
- Runs ESLint with auto-fix on TypeScript/JavaScript files
- Runs Prettier formatting on JSON, CSS, and Markdown files
- Ensures code quality and consistent formatting before commits

### Pre-push Hook

- Runs TypeScript compilation and build process
- Ensures the project builds successfully before pushing

### Commit Message Hook

- Uses [@commitlint/cli](https://commitlint.js.org/) with conventional config
- Validates commit messages follow conventional commit format
- Expected format: `type(scope): description`
- Allowed types: feat, fix, docs, style, refactor, test, chore, ci, build, perf, revert
- Example: `feat(auth): add login functionality`

### Available Scripts

- `npm run lint` - Run ESLint on all files
- `npm run lint:fix` - Run ESLint with auto-fix on all files
- `npm run lint-staged` - Run lint-staged manually
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted correctly
- `npm run build` - Build the project
- `npm run dev` - Start development server

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

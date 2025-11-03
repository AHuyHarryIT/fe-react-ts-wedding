# Wedding Planner - Full Stack Application

This is a full-stack wedding planning application with a React TypeScript frontend and NestJS backend. The frontend provides a modern user interface with Ant Design 5, Tailwind CSS v4, and React Icons, while the backend offers RESTful CRUD APIs powered by NestJS and Prisma.

## 🏗️ Project Structure

- **Frontend** (`/`) - React + TypeScript + Vite application
- **Backend** (`/backend`) - NestJS + Prisma API server

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with TypeScript support
- **Vite** - Fast build tool and development server
- **Ant Design 5** - Enterprise-class UI components
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Icons** - Popular icon library with multiple icon sets
- **Zustand** - Lightweight state management library
- **Immer** - Immutable state updates for complex state
- **Day.js** - Date manipulation library for Ant Design DatePicker
- **Husky** - Git hooks for code quality
- **lint-staged** - Run linters on staged files only
- **Prettier** - Code formatting
- **ESLint** - Code linting

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern ORM for database access
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe development

## 📦 Installation

### Frontend
```bash
npm install
```

### Backend
```bash
cd backend
npm install
npx prisma generate
```

## 🛠️ Development

### Frontend
```bash
npm run dev
```

### Backend
```bash
cd backend
npm run start:dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000`.

## 🏗️ Build

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend
npm run build
```

## 🎨 Features

### Dark Mode Support
- **System Preference Detection**: Automatically detects user's system dark mode preference
- **Manual Toggle**: Users can manually switch between light and dark modes
- **Persistent Settings**: Dark mode preference is saved in localStorage
- **Seamless Integration**: Both Ant Design and Tailwind CSS components adapt to dark mode
- **Smooth Transitions**: All color changes are animated with CSS transitions

### Ant Design + Tailwind CSS Integration
- Seamless integration between Ant Design components and Tailwind utilities
- Custom theme configuration for Ant Design with dark mode algorithm
- Tailwind config optimized to work with Ant Design (preflight disabled)
- No style conflicts between the two frameworks

### React Icons Integration
- Uses React Icons instead of Ant Design icons for better flexibility
- Includes icons from Font Awesome (fa), Simple Icons (si), Material Design (md)
- Consistent icon styling with Tailwind classes

### Code Quality Tools
- Pre-commit hooks that run linters and formatters
- Conventional commit message validation
- TypeScript strict mode enabled

## 🌙 Dark Mode Implementation

The dark mode feature is implemented using a combination of:

1. **React Context**: `ThemeContext` manages the global dark mode state
2. **Ant Design Dark Algorithm**: Uses `theme.darkAlgorithm` for consistent dark theming
3. **Tailwind CSS Dark Mode**: Class-based dark mode with `dark:` prefixes
4. **Persistent Storage**: User preference saved in localStorage
5. **System Preference**: Automatically detects `prefers-color-scheme: dark`

### Key Files:
- `src/contexts/ThemeContext.tsx` - Theme state management
- `src/hooks/useTheme.ts` - Theme hook for components
- `src/config/antd-theme.ts` - Ant Design theme configurations
- `src/providers/AntdProvider.tsx` - Ant Design theme provider

### Usage Example:
```tsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

## 🎯 State Management with Zustand

This project uses **Zustand** as a modern alternative to React Context and Redux for state management. Zustand provides a simple, lightweight, and TypeScript-friendly solution.

### Features:
- **Minimal Boilerplate**: Simple store creation without providers
- **TypeScript Support**: Full type safety with excellent TypeScript integration
- **Persistence**: Built-in localStorage persistence with selective state saving
- **Immutable Updates**: Uses Immer middleware for complex state mutations
- **DevTools**: Compatible with Redux DevTools for debugging
- **Performance**: Automatic subscription optimization, no unnecessary re-renders

### Store Architecture:

#### 1. Theme Store (`src/stores/themeStore.ts`)
Manages dark mode theme state with persistence:
```tsx
const { darkMode, toggleDarkMode, setDarkMode, initializeTheme } = useTheme();
```

#### 2. Notification Store (`src/stores/notificationStore.ts`)
Handles application notifications:
```tsx
const { notifications, addNotification, removeNotification, clearAllNotifications } = useNotifications();
```

#### 3. Wedding Form Store (`src/stores/weddingFormStore.ts`)
Complex form state with validation and async operations:
```tsx
const { 
  formData, 
  updateBride, 
  updateGroom, 
  updateWedding, 
  saveForm, 
  isLoading, 
  errors 
} = useWeddingForm();
```

### Key Store Features:

#### Persistence
```tsx
persist(
  (set) => ({ /* store logic */ }),
  {
    name: 'theme-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ darkMode: state.darkMode }), // Only persist specific fields
  }
)
```

#### Immer Integration
```tsx
immer((set) => ({
  updateBride: (data) => set((state) => {
    state.formData.bride = { ...state.formData.bride, ...data };
  }),
}))
```

#### Async Actions
```tsx
saveForm: async () => {
  set((state) => { state.isLoading = true; });
  try {
    await apiCall();
    set((state) => { state.isLoading = false; });
  } catch (error) {
    set((state) => { state.isLoading = false; });
  }
}
```

### Usage Patterns:

#### Basic Store Usage
```tsx
import { useThemeStore } from '../stores';

// Use entire store
const themeStore = useThemeStore();

// Use specific selectors (optimized)
const darkMode = useThemeStore(state => state.darkMode);
const toggleDarkMode = useThemeStore(state => state.toggleDarkMode);
```

#### Custom Hooks (Recommended)
```tsx
// src/hooks/useTheme.ts
import { useThemeStore } from '../stores';

export const useTheme = () => {
  return useThemeStore();
};
```

#### Centralized Exports
```tsx
// src/stores/index.ts
export { useThemeStore, type ThemeState } from './themeStore';
export { useNotificationStore, type NotificationState } from './notificationStore';

// src/hooks/index.ts
export { useTheme } from './useTheme';
export { useNotifications } from './useNotifications';
```

### Benefits over React Context:
- **No Provider Wrapping**: Stores are directly accessible without context providers
- **Better Performance**: Automatic subscription optimization
- **TypeScript Integration**: Better type inference and safety
- **Persistence**: Built-in localStorage integration
- **DevTools**: Native Redux DevTools support
- **Code Splitting**: Stores can be lazy-loaded
- **Testing**: Easier to test store logic in isolation

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

## 🔌 Backend API

The backend provides RESTful CRUD APIs for all wedding-related entities. See the [Backend README](./backend/README.md) for detailed API documentation.

### Available Endpoints

- **Users** - `/users` - User management and authentication
- **Weddings** - `/weddings` - Wedding event management
- **Guests** - `/guests` - Guest list and RSVP management
- **Vendors** - `/vendors` - Vendor management (catering, photography, etc.)
- **Tasks** - `/tasks` - Wedding planning task management

### Database Schema

The Prisma schema includes:
- User model with role-based access
- Wedding model with bride, groom, date, venue, and budget
- Guest model with RSVP status and dietary restrictions
- Vendor model with categorization and payment tracking
- Task model with priority levels and due dates

For more details, see the [Prisma schema](./backend/prisma/schema.prisma).

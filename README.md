# Wedding Planner - React + TypeScript + Vite

This template provides a modern setup for building wedding planning applications with React, TypeScript, and Vite. It includes Ant Design 5 for UI components, Tailwind CSS v4 for styling, and React Icons for iconography.

## 🚀 Tech Stack

- **React 19** - Latest React with TypeScript support
- **Vite** - Fast build tool and development server
- **TanStack Router** - Type-safe routing with file-based routes
- **TanStack Query** - Powerful data synchronization and caching
- **Ant Design 5** - Enterprise-class UI components
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Icons** - Popular icon library with multiple icon sets
- **Zustand** - Lightweight state management library
- **Axios** - Promise-based HTTP client
- **Immer** - Immutable state updates for complex state
- **Motion (Framer Motion)** - Production-ready animations
- **Day.js** - Date manipulation library for Ant Design DatePicker
- **Husky** - Git hooks for code quality
- **lint-staged** - Run linters on staged files only
- **Prettier** - Code formatting
- **ESLint** - Code linting

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🎨 Features

### Admin Authentication System
- **Admin Login Page**: Beautiful login UI with glassmorphism effects (`/admin/login`)
- **TanStack Query Integration**: Efficient API state management
- **Zustand Auth Store**: Persistent authentication state
- **JWT Token Management**: Automatic token refresh and validation
- **Protected Routes**: Route guards for admin pages
- **Error Handling**: User-friendly error messages
- See [ADMIN_LOGIN.md](./ADMIN_LOGIN.md) for detailed documentation

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

# Wedding Landing Page - Dreams

A beautiful, modern wedding landing page built with React 19, TypeScript, Ant Design v5, and Tailwind CSS v4. This project showcases a professional wedding planning website with elegant design, smooth animations, and responsive layout.

## 🌟 Features

### ✨ Modern Design
- **Hero Section**: Stunning full-screen hero with background image and compelling CTA
- **Services Section**: Professional service cards with icons and descriptions
- **Portfolio Gallery**: Image gallery showcasing wedding photography and events
- **Statistics Section**: Impressive numbers with parallax background
- **Contact Form**: Complete contact form with validation
- **Blog Section**: Latest blog posts and articles
- **Footer**: Comprehensive footer with links and social media

### 🎨 UI/UX Excellence
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop layouts
- **Dark Mode**: Complete dark/light theme support with smooth transitions
- **Smooth Animations**: CSS animations and Ant Design transitions
- **Modern Typography**: Beautiful font hierarchy and spacing
- **Color Scheme**: Elegant pink/rose gradient theme
- **Custom Scrollbar**: Branded scrollbar design

### 🛠 Technical Features
- **React 19**: Latest React with TypeScript
- **Ant Design v5**: Enterprise-grade UI components
- **Tailwind CSS v4**: Utility-first CSS framework with CSS-first configuration
- **Zustand**: Lightweight state management
- **React Icons**: Beautiful icon library
- **Vite**: Fast build tool and development server
- **ESLint & Prettier**: Code quality and formatting
- **Husky**: Git hooks for quality assurance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fe-react-ts-wedding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.tsx          # Header navigation with mobile menu
│   ├── WeddingLandingPage.tsx  # Main landing page component
│   └── ThemeInitializer.tsx    # Theme setup component
├── contexts/
│   ├── ThemeContext.tsx        # Theme context provider
│   └── theme.ts               # Theme configuration
├── hooks/
│   ├── useTheme.ts            # Theme management hook
│   ├── useNotifications.ts    # Notification management
│   └── useWeddingForm.ts      # Wedding form state
├── providers/
│   └── AntdProvider.tsx       # Ant Design theme provider
├── stores/
│   ├── themeStore.ts          # Theme Zustand store
│   ├── notificationStore.ts   # Notification store
│   └── weddingFormStore.ts    # Form data store
├── config/
│   └── antd-theme.ts          # Ant Design theme configuration
├── App.tsx                    # Main app component
├── main.tsx                   # App entry point
└── index.css                  # Global styles and Tailwind imports
```

## 🎨 Design Reference

This landing page is inspired by modern wedding planning websites with:
- **Elegant color schemes**: Pink/rose gradients with sophisticated grays
- **Professional photography**: High-quality wedding images from Unsplash
- **Modern layout patterns**: Grid systems, cards, and sections
- **Typography hierarchy**: Clear information architecture
- **Call-to-action optimization**: Strategic button placements

## 🔧 Key Components

### Navigation
- Fixed header with transparency option
- Mobile-responsive hamburger menu
- Theme toggle button
- Smooth scroll to sections

### Hero Section
- Full-screen background image
- Gradient overlay for text readability
- Compelling headline and description
- Call-to-action buttons
- Scroll indicator animation

### Services Section
- Grid layout with service cards
- Icon-based visual hierarchy
- Hover animations
- Responsive design

### Portfolio Gallery
- Masonry-style image grid
- Category labels
- Hover effects
- Modal view capability

### Contact Form
- Complete form validation
- Multiple input types
- Service selection dropdown
- Date picker integration
- Responsive layout

## 🎯 SEO & Performance

- **Semantic HTML**: Proper heading hierarchy and structure
- **Responsive Images**: Optimized loading and sizing
- **Lazy Loading**: Images load as needed
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized bundle size and loading

## 🌈 Customization

### Theme Colors
Edit `src/config/antd-theme.ts` to customize:
- Primary colors
- Secondary colors
- Component-specific styles

### Content
Update content in `src/components/WeddingLandingPage.tsx`:
- Service descriptions
- Portfolio images
- Contact information
- Blog posts

### Styling
Modify `src/index.css` for:
- Custom animations
- Additional utilities
- Component overrides

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 641px - 1024px
- **Desktop**: > 1024px

All sections are optimized for each breakpoint with appropriate spacing, typography, and layout adjustments.

## 🔗 Navigation Sections

- **Home**: Hero section with main CTA
- **Services**: Wedding planning services
- **Portfolio**: Image gallery and work showcase
- **About**: Statistics and company information
- **Blog**: Latest articles and news
- **Contact**: Contact form and information

## 💡 Best Practices Implemented

- **Component Architecture**: Modular, reusable components
- **State Management**: Proper separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized rendering and bundling
- **Accessibility**: WCAG guidelines compliance
- **Code Quality**: ESLint, Prettier, and consistent formatting

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run ts:check` - Check TypeScript types

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Ant Design** team for the amazing component library
- **Tailwind CSS** team for the utility-first framework
- **Unsplash** photographers for beautiful wedding images
- **React** team for the excellent framework

---

**Built with ❤️ by [AHuyHarryIT]**


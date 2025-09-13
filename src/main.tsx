import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeInitializer } from './components/ThemeInitializer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeInitializer>
      <App />
    </ThemeInitializer>
  </StrictMode>
);

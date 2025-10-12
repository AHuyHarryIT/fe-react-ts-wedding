import { AntdProvider } from './providers/AntdProvider';
import { useTheme } from './hooks';
import Navigation from './components/Navigation';
import WeddingLandingPage from './components/WeddingLandingPage';

function App() {
  const { darkMode } = useTheme();

  return (
    <AntdProvider darkMode={darkMode}>
      <div className="min-h-screen">
        <Navigation transparent />
        <WeddingLandingPage />
      </div>
    </AntdProvider>
  );
}

export default App;

import { AntdProvider } from '@shared/providers/AntdProvider';
import { useTheme } from '@hooks';
import Navigation from '@features/auth/components/Navigation';
import WeddingLandingPage from '@features/dashboard/components/WeddingLandingPage';

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

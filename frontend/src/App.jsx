import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import UnitConverter from './pages/UnitConverter';
import ChatWidget from './components/ChatWidget';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function NavLinks() {
  const { pathname } = useLocation();
  const linkClass = (path) => `nav-link${pathname === path ? ' ring-2 ring-sage-400' : ''}`;
  return (
    <nav className="flex flex-wrap items-center gap-2 md:gap-3">
      <Link to="/" className={linkClass('/')}>Dashboard</Link>
      <Link to="/calculator" className={linkClass('/calculator')}>Unit Calculator</Link>
      <Link to="/how-it-works" className={linkClass('/how-it-works')}>How It Works</Link>
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="app-header py-4 px-6 md:px-12 flex items-center justify-between shadow-sm gap-4">
        <Link to="/" className="brand-link shrink-0">
          <img src="/logo.png" alt="AgriMind icon" className="brand-logo w-9 h-9 rounded-full" />
          <span className="brand-text text-xl font-serif font-semibold">AgriMind</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <NavLinks />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-6xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculator" element={<UnitConverter />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </main>

      <footer className="app-footer text-center py-6 text-sm border-t mt-12">
        &copy; 2026 AgriMind Multi-Agent Ecosystem. Designed for small-holder farmers.
      </footer>

      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}

export default App;

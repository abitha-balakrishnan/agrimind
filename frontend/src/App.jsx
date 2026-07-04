import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import UnitConverter from './pages/UnitConverter';
import ChatWidget from './components/ChatWidget';

function NavLinks() {
  const { pathname } = useLocation();
  const linkClass = (path) => `nav-link${pathname === path ? ' ring-2 ring-sage-400' : ''}`;
  return (
    <nav className="flex flex-wrap gap-2 md:gap-3">
      <Link to="/" className={linkClass('/')}>Dashboard</Link>
      <Link to="/calculator" className={linkClass('/calculator')}>Unit Calculator</Link>
      <Link to="/how-it-works" className={linkClass('/how-it-works')}>System Flow</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-wheat/70 border-b border-sage/30 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm gap-4">
          <Link to="/" className="flex items-center gap-3 text-xl font-serif font-semibold text-terracotta transition-all duration-150 hover:opacity-80 active:opacity-70 active:scale-[0.98] shrink-0">
            <img src="/logo.png" alt="AgriMind icon" className="w-9 h-9 rounded-full" />
            AgriMind
          </Link>
          <NavLinks />
        </header>

        <main className="flex-grow p-6 md:p-12 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculator" element={<UnitConverter />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </main>
        
        <footer className="text-center py-6 text-sm text-charcoal/60 border-t border-sage/20 mt-12 bg-wheat/30">
          &copy; 2026 AgriMind Multi-Agent Ecosystem. Designed for small-holder farmers.
        </footer>

        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;

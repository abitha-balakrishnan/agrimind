import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-wheat/70 border-b border-sage/30 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
          <Link to="/" className="flex items-center gap-3 text-xl font-serif font-semibold text-terracotta transition-all duration-150 hover:opacity-80 active:opacity-70 active:scale-[0.98]">
            <img src="/logo.svg" alt="" className="w-9 h-9" />
            AgriMind
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/how-it-works" className="nav-link">System Flow</Link>
          </nav>
        </header>

        <main className="flex-grow p-6 md:p-12 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </main>
        
        <footer className="text-center py-6 text-sm text-charcoal/60 border-t border-sage/20 mt-12 bg-wheat/30">
          &copy; 2026 AgriMind Multi-Agent Ecosystem. Designed for small-holder farmers.
        </footer>
      </div>
    </Router>
  );
}

export default App;

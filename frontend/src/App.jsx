import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import { Sprout } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-wheat/50 border-b border-sage/20 py-4 px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-serif font-semibold text-terracotta">
            <Sprout size={28} className="text-sage" />
            AgriMind
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-charcoal/80 hover:text-terracotta transition-colors font-medium">Dashboard</Link>
            <Link to="/how-it-works" className="text-charcoal/80 hover:text-terracotta transition-colors font-medium">System Flow</Link>
          </nav>
        </header>

        <main className="flex-grow p-6 md:p-12 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </main>
        
        <footer className="text-center py-6 text-sm text-charcoal/50 border-t border-sage/10 mt-12">
          &copy; 2026 AgriMind Multi-Agent Ecosystem. Designed for small-holder farmers.
        </footer>
      </div>
    </Router>
  );
}

export default App;

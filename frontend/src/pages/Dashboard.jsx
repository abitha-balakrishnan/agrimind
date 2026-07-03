import { useState } from 'react';
import AgentTimeline from '../components/AgentTimeline';
import axios from 'axios';

export default function Dashboard() {
  const [formData, setFormData] = useState({
    location: '',
    soilType: '',
    landSize: '',
    crop: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [agentResults, setAgentResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app we'd proxy this through Vite, using full URL for simplicity if not proxied
      const res = await axios.post('http://localhost:5000/api/agent/query', formData);
      setAgentResults(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch advice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl text-terracotta">Your Intelligent Farm Advisor</h1>
        <p className="text-lg text-charcoal/80">Enter your farm details below. Our suite of 5 AI specialists will analyze your condition and orchestrate a complete advisory plan.</p>
      </section>

      <section className="bg-white rounded-organic shadow-soft p-8 max-w-3xl mx-auto border border-sage/10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Location</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Pune, Maharashtra" 
              className="w-full p-3 rounded-md bg-cream/50 border border-sage/30 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Soil Type</label>
            <select 
              required
              className="w-full p-3 rounded-md bg-cream/50 border border-sage/30 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
              value={formData.soilType}
              onChange={e => setFormData({...formData, soilType: e.target.value})}
            >
              <option value="">Select Soil...</option>
              <option value="Loamy">Loamy</option>
              <option value="Black Cotton">Black Cotton</option>
              <option value="Red/Laterite">Red / Laterite</option>
              <option value="Sandy">Sandy</option>
              <option value="Clayey">Clayey</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Land Size (Acres)</label>
            <input 
              type="number" 
              placeholder="e.g. 5" 
              className="w-full p-3 rounded-md bg-cream/50 border border-sage/30 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
              value={formData.landSize}
              onChange={e => setFormData({...formData, landSize: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Target Crop (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Tomato" 
              className="w-full p-3 rounded-md bg-cream/50 border border-sage/30 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
              value={formData.crop}
              onChange={e => setFormData({...formData, crop: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 pt-4">
            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-sage hover:bg-sage/90 text-white font-medium text-lg py-4 rounded-organic shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Agents are analyzing...' : 'Generate Advisory Plan'}
            </button>
          </div>
        </form>
      </section>

      { (isLoading || agentResults) && (
        <AgentTimeline isLoading={isLoading} results={agentResults} />
      )}
    </div>
  );
}

import { useState } from 'react';
import AgentTimeline from '../components/AgentTimeline';
import api from '../api';
import PestScanner from '../components/PestScanner';

export default function Dashboard() {
  const [formData, setFormData] = useState({
    location: '',
    soilType: '',
    landSize: '',
    crop: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [agentResults, setAgentResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/agent/query', formData);
      setAgentResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch advice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl text-terracotta">Your Intelligent Farm Advisor</h1>
        <p className="text-lg text-charcoal/80">Enter your farm details below. Four AI specialists — Weather, Crop, Fertilizer, and Irrigation — will analyze your conditions and build a tailored advisory plan. (Pest diagnosis is available separately in the scanner below.)</p>
      </section>

      <section className="card-surface p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Location</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Pune, Maharashtra" 
              className="input-field"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Soil Type</label>
            <select 
              required
              className="input-field"
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
              className="input-field"
              value={formData.landSize}
              onChange={e => setFormData({...formData, landSize: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charcoal/70 uppercase tracking-wider">Target Crop (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Tomato" 
              className="input-field"
              value={formData.crop}
              onChange={e => setFormData({...formData, crop: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 pt-4">
            {error && <p className="text-terracotta text-sm mb-3">{error}</p>}
            <button 
              disabled={isLoading}
              type="submit" 
              className="btn-primary w-full text-lg py-4"
            >
              {isLoading ? 'Agents are analyzing...' : 'Generate Advisory Plan'}
            </button>
          </div>
        </form>
      </section>

      { (isLoading || agentResults) && (
        <AgentTimeline isLoading={isLoading} results={agentResults} />
      )}
      <PestScanner crop={formData.crop} />
    </div>
  );
}

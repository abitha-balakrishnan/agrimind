import { motion } from 'framer-motion';
import { CloudRain, Sprout, TestTube, Bug, Droplet } from 'lucide-react';
import clsx from 'clsx';
import PestScanner from './PestScanner';

const AgentIcon = ({ name, status }) => {
  const icons = {
    Weather: CloudRain,
    Crop: Sprout,
    Fertilizer: TestTube,
    Pest: Bug,
    Irrigation: Droplet,
  };
  const Icon = icons[name];
  return (
    <div className={clsx(
      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
      status === 'done' ? "bg-sage border-sage text-white shadow-soft" :
      status === 'thinking' ? "bg-wheat border-terracotta text-terracotta animate-pulse" :
      "bg-cream border-sage/30 text-sage/30"
    )}>
      <Icon size={24} strokeWidth={status === 'done' ? 2 : 1.5} />
    </div>
  );
};

export default function AgentTimeline({ isLoading, results }) {
  const agents = ['Weather', 'Crop', 'Fertilizer', 'Irrigation']; // Pest is separate flow for images
  
  if (!isLoading && !results) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Horizontal Timeline Visualization */}
      <div className="bg-white p-8 rounded-organic shadow-soft border border-sage/10 hidden md:block">
        <h3 className="text-xl text-center mb-8 text-terracotta border-b border-sage/20 pb-4 inline-block justify-center font-serif">Agent Orchestration Track</h3>
        <div className="flex items-center justify-between relative px-12">
          {/* Track Line */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1 bg-sage/20 rounded-full z-0"></div>
          
          {agents.map((agent, i) => {
            const status = results ? 'done' : isLoading ? 'thinking' : 'waiting';
            return (
              <div key={agent} className="relative z-10 flex flex-col items-center gap-3">
                <AgentIcon name={agent} status={status} />
                <span className={clsx("text-sm font-semibold uppercase tracking-wider", status === 'done' ? 'text-charcoal' : 'text-charcoal/40')}>{agent}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Synthesis - Shown only when done */}
        {results?.executiveSummary && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="md:col-span-2 bg-sage/10 p-8 rounded-organic border border-sage pb-10">
            <h3 className="text-2xl text-charcoal mb-4 flex items-center gap-2">
              <Sprout className="text-sage" /> Executive Plan
            </h3>
            <p className="text-lg text-charcoal/80 leading-relaxed font-serif">{results.executiveSummary}</p>
          </motion.div>
        )}

        {/* Detailed Logs */}
        {results && (
          <>
            <AgentCard title="Weather Outlook" icon={<CloudRain/>} data={results.weather?.forecastSummary || "Checking..."} />
            <AgentCard title="Crop Strategy" icon={<Sprout/>} data={results.crop?.recommendedCrops?.[0]?.reasoning || "Checking..."} />
            <AgentCard title="Fertilizer Plan" icon={<TestTube/>} data={results.fertilizer?.recommendations?.[0]?.fertilizerType || "Checking..."} />
            <AgentCard title="Irrigation Schedule" icon={<Droplet/>} data={results.irrigation?.waterConservationTip || "Checking..."} />
          </>
        )}

      </div>
      
      {/* Standalone Pest Agent */}
      <PestScanner />

    </div>
  );
}

function AgentCard({ title, icon, data }) {
  return (
    <div className="bg-white p-6 rounded-organic shadow-sm border border-sage/10 hover:shadow-soft transition-all">
      <div className="flex items-center gap-3 mb-4 text-terracotta border-b border-sage/10 pb-3">
        {icon}
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="text-charcoal/70">{data}</p>
    </div>
  );
}

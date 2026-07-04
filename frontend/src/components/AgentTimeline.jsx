import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sprout, TestTube, Droplet } from 'lucide-react';
import clsx from 'clsx';

const AGENT_CONFIG = {
  Weather: {
    icon: CloudRain,
    title: 'Weather Outlook',
    getSummary: (r) => r?.weather?.forecastSummary,
    getExplanation: (r, q) => {
      const w = r?.weather;
      const raw = w?.raw;
      const temp = raw?.temp ? `${Math.round(raw.temp)}°C` : null;
      const condition = raw?.weather || w?.forecastSummary;
      return {
        what: `I checked the weather forecast for ${q?.location || 'your area'}.`,
        why: w?.farmingAdvice || 'No specific farming advice available.',
        detail: [
          temp && `Current temperature: ${temp}`,
          condition && `Conditions: ${condition}`,
          raw?.humidity && `Humidity: ${raw.humidity}%`,
          ...(w?.alerts || []).map(a => `Alert: ${a}`),
        ].filter(Boolean),
      };
    },
  },
  Crop: {
    icon: Sprout,
    title: 'Crop Strategy',
    getSummary: (r) => r?.crop?.recommendedCrops?.[0]?.reasoning,
    getExplanation: (r, q) => {
      const crops = r?.crop?.recommendedCrops || [];
      const top = crops[0];
      return {
        what: `I analyzed your ${q?.soilType || 'soil'} in ${q?.location || 'your region'}${q?.landSize ? ` (${q.landSize} acres)` : ''}${q?.crop ? ` for growing ${q.crop}` : ''}.`,
        why: top?.reasoning || r?.crop?.generalAdvice || 'Crop analysis complete.',
        detail: [
          top && `Top recommendation: ${top.name} (expected yield: ${top.estimatedYield || 'Moderate'})`,
          ...crops.slice(1, 3).map(c => `Also suitable: ${c.name}`),
          r?.crop?.generalAdvice && `General tip: ${r.crop.generalAdvice}`,
        ].filter(Boolean),
      };
    },
  },
  Fertilizer: {
    icon: TestTube,
    title: 'Fertilizer Plan',
    getSummary: (r) => {
      const rec = r?.fertilizer?.recommendations?.[0];
      return rec ? `${rec.fertilizerType} — ${rec.quantityPerAcre}` : null;
    },
    getExplanation: (r, q) => {
      const recs = r?.fertilizer?.recommendations || [];
      const top = recs[0];
      const organic = r?.fertilizer?.organicAlternatives || [];
      return {
        what: `Based on your ${q?.soilType || 'soil type'}${q?.crop ? ` and ${q.crop} crop` : ''}, I calculated the nutrient needs.`,
        why: r?.fertilizer?.reasoningScratchpad || (top
          ? `We recommend ${top.fertilizerType} because ${q?.soilType || 'your soil'} typically needs balanced NPK for ${q?.crop || 'this crop'}.`
          : 'Fertilizer plan generated from soil and crop data.'),
        detail: [
          ...recs.map(rec => `${rec.fertilizerType}: ${rec.quantityPerAcre} — ${rec.applicationMethod}`),
          ...organic.map(o => `Organic option: ${o}`),
        ].filter(Boolean),
      };
    },
  },
  Irrigation: {
    icon: Droplet,
    title: 'Irrigation Schedule',
    getSummary: (r) => r?.irrigation?.schedule?.[0]?.action,
    getExplanation: (r, q) => {
      const schedule = r?.irrigation?.schedule || [];
      return {
        what: `I planned your watering schedule for ${q?.crop || 'your crop'} on ${q?.soilType || 'your soil'}, factoring in local weather.`,
        why: schedule[0]?.reasoning || r?.irrigation?.waterConservationTip || 'Schedule based on crop water needs and forecast.',
        detail: [
          ...schedule.map(s => `${s.day}: ${s.action}${s.reasoning ? ` — ${s.reasoning}` : ''}`),
          r?.irrigation?.waterConservationTip && `Water-saving tip: ${r.irrigation.waterConservationTip}`,
        ].filter(Boolean),
      };
    },
  },
};

const AgentIcon = ({ name, status, selected }) => {
  const Icon = AGENT_CONFIG[name]?.icon || Sprout;
  return (
    <div className={clsx(
      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer',
      selected ? 'bg-terracotta border-terracotta text-white shadow-soft scale-110' :
      status === 'done' ? 'bg-sage border-sage text-white shadow-soft hover:scale-105' :
      status === 'thinking' ? 'bg-wheat border-terracotta text-terracotta animate-pulse' :
      'bg-cream border-sage/30 text-sage/30'
    )}>
      <Icon size={24} strokeWidth={status === 'done' || selected ? 2 : 1.5} />
    </div>
  );
};

export default function AgentTimeline({ isLoading, results }) {
  const agents = ['Weather', 'Crop', 'Fertilizer', 'Irrigation'];
  const [selectedAgent, setSelectedAgent] = useState(null);
  const farmerQuery = results?.farmerQuery;

  if (!isLoading && !results) return null;

  const activeAgent = selectedAgent || (results ? agents[0] : null);
  const explanation = activeAgent && results
    ? AGENT_CONFIG[activeAgent]?.getExplanation(results, farmerQuery)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

      <div className="card-surface p-8">
        <h3 className="text-xl text-center mb-2 text-terracotta font-serif">Agent Orchestration Track</h3>
        <p className="text-center text-sm text-charcoal/60 mb-8">
          {results
            ? 'Click each step below to see what that specialist analyzed and why.'
            : 'Weather, Crop, Fertilizer, and Irrigation specialists are analyzing your farm details…'}
        </p>

        <div className="flex items-center justify-between relative px-4 md:px-12 max-w-3xl mx-auto">
          <div className="absolute left-8 md:left-16 right-8 md:right-16 top-1/2 -translate-y-1/2 h-1 bg-sage/20 rounded-full z-0" />

          {agents.map((agent) => {
            const status = results ? 'done' : isLoading ? 'thinking' : 'waiting';
            const isSelected = activeAgent === agent;
            return (
              <button
                key={agent}
                type="button"
                disabled={!results}
                onClick={() => setSelectedAgent(agent)}
                className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg p-1"
                aria-pressed={isSelected}
                aria-label={`${agent} agent${isSelected ? ' — selected' : ''}`}
              >
                <AgentIcon name={agent} status={status} selected={isSelected && results} />
                <span className={clsx(
                  'text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors',
                  isSelected && results ? 'text-terracotta' :
                  status === 'done' ? 'text-charcoal group-hover:text-terracotta' : 'text-charcoal/40'
                )}>
                  {agent}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {explanation && (
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-8 p-6 bg-cream/60 rounded-organic border border-sage/30 max-w-3xl mx-auto"
            >
              <h4 className="font-semibold text-terracotta mb-2 flex items-center gap-2">
                {(() => { const I = AGENT_CONFIG[activeAgent]?.icon; return I ? <I size={18} /> : null; })()}
                {AGENT_CONFIG[activeAgent]?.title} — What happened?
              </h4>
              <p className="text-charcoal/90 mb-3 leading-relaxed">{explanation.what}</p>
              <p className="text-charcoal/80 mb-3 leading-relaxed">
                <span className="font-medium text-charcoal">Why this recommendation: </span>
                {explanation.why}
              </p>
              {explanation.detail.length > 0 && (
                <ul className="space-y-1.5 text-sm text-charcoal/70">
                  {explanation.detail.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-sage shrink-0">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

        {results?.executiveSummary && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-2 bg-sage/10 p-8 rounded-organic border border-sage pb-10">
            <h3 className="text-2xl text-charcoal mb-4 flex items-center gap-2">
              <Sprout className="text-sage" /> Your Complete Farm Plan
            </h3>
            <p className="text-lg text-charcoal/80 leading-relaxed font-serif">{results.executiveSummary}</p>
          </motion.div>
        )}

        {results && agents.map((agent) => {
          const Icon = AGENT_CONFIG[agent].icon;
          return (
            <AgentCard
              key={agent}
              title={AGENT_CONFIG[agent].title}
              icon={<Icon size={20} />}
              data={AGENT_CONFIG[agent].getSummary(results) || 'Analysis complete.'}
              onClick={() => setSelectedAgent(agent)}
              active={activeAgent === agent}
            />
          );
        })}

      </div>
    </div>
  );
}

function AgentCard({ title, icon, data, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'card-interactive p-6 text-left w-full transition-all',
        active && 'ring-2 ring-terracotta/50'
      )}
    >
      <div className="flex items-center gap-3 mb-4 text-terracotta border-b border-sage/10 pb-3">
        {icon}
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="text-charcoal/70">{data}</p>
      <p className="text-xs text-sage mt-3">Click for full explanation ↑</p>
    </button>
  );
}

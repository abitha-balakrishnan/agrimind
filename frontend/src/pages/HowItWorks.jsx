import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function HowItWorks() {
  const chartRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    if (chartRef.current) {
        mermaid.contentLoaded();
    }
  }, []);

  const chartDefinition = `
graph TD
    classDef client fill:#E8DCC8,stroke:#3A3A34,stroke-width:2px;
    classDef orchestrator fill:#C9846B,stroke:#fff,stroke-width:2px,color:#fff;
    classDef agent fill:#8FA88C,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#3A3A34,stroke:#fff,stroke-width:2px,color:#fff;

    UI[Farmer / Dashboard UI]:::client -->|Raw Inputs + Optional Image| Orch(Orchestrator Agent):::orchestrator
    
    Orch -->|Parallel Call| W(Weather Agent):::agent
    Orch -->|Parallel Call| C(Crop Agent):::agent
    Orch -->|Parallel Call| F(Fertilizer Agent):::agent
    Orch -->|Parallel Call| P(Pest Agent):::agent
    
    W --> I(Irrigation Agent):::agent
    
    C <-->|Query Crop Needs| VDB[(Chroma Vector DB)]:::db
    P <-->|Query Pathologies| VDB
    
    W --> Orch
    C --> Orch
    F --> Orch
    P --> Orch
    I --> Orch
    
    Orch -->|Final JSON| DB[(MongoDB)]:::db
    Orch -->|Return Summary| UI
    
    Cron((Cron Job)) -.->|Periodic Check| A(Alert Agent):::agent
    DB -.-> A
    A -.->|Twilio SMS| Phone[Farmer Phone]:::client
  `;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-terracotta border-b border-sage/20 pb-4">System Architecture</h1>
      <p className="text-charcoal/80 leading-relaxed">
        AgriMind doesn't rely on a single massive language model prompt. Instead, we use a <strong>Multi-Agent Orcherstration Pattern</strong>. 
        Each agent has a specific persona, tools, and RAG context limitations.
      </p>

      <div className="bg-white p-8 rounded-organic shadow-soft border border-sage/10 overflow-x-auto flex justify-center">
        <pre className="mermaid" ref={chartRef}>
          {chartDefinition}
        </pre>
      </div>
    </div>
  );
}

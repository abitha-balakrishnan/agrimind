import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const FLOWCHART = `graph TD
    classDef client fill:#D4C4A8,stroke:#2E2E28,stroke-width:2px;
    classDef orchestrator fill:#B86F52,stroke:#fff,stroke-width:2px,color:#fff;
    classDef agent fill:#6F8A6C,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#2E2E28,stroke:#fff,stroke-width:2px,color:#fff;

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
    A -.->|Twilio SMS| Phone[Farmer Phone]:::client`;

const USE_CASE = `flowchart LR
    Farmer((Farmer))
    Admin((System Admin))

    subgraph AgriMind["AgriMind System"]
        UC1[Get Crop Suggestion]
        UC2[Get Weather Advisory]
        UC3[Get Fertilizer Plan]
        UC4[Scan for Pest]
        UC5[Get Irrigation Schedule]
        UC6[Receive SMS Alert]
        UC7[View History]
    end

    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC7
    Farmer <--> UC6
    Admin --> UC7`;

function MermaidChart({ id, definition }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
    const render = async () => {
      ref.current.innerHTML = definition;
      try {
        await mermaid.run({ nodes: [ref.current] });
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    };
    render();
  }, [definition]);

  return <div ref={ref} className="mermaid" />;
}

export default function HowItWorks() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <h1 className="text-3xl text-terracotta border-b border-sage/30 pb-4">How AgriMind Works</h1>
      <p className="text-charcoal/80 leading-relaxed">
        AgriMind uses a <strong>Multi-Agent Orchestration Pattern</strong>. Each specialist agent has its own persona,
        prompt engineering, and RAG context — then an orchestrator synthesizes a single farmer-friendly plan.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl text-charcoal font-serif">System Flow</h2>
        <div className="card-surface p-8 overflow-x-auto flex justify-center">
          <MermaidChart id="flowchart" definition={FLOWCHART} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl text-charcoal font-serif">Use Cases</h2>
        <div className="card-surface p-8 overflow-x-auto flex justify-center">
          <MermaidChart id="usecase" definition={USE_CASE} />
        </div>
      </section>
    </div>
  );
}

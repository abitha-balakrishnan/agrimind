import { useState } from 'react';
import { ChevronDown, ChevronUp, Sprout, CloudRain, Bug, MessageCircle, Calculator } from 'lucide-react';
import MermaidChart from '../components/MermaidChart';

const FLOWCHART = `graph TD
    classDef client fill:#D4C4A8,stroke:#2E2E28,stroke-width:2px;
    classDef orchestrator fill:#B86F52,stroke:#fff,stroke-width:2px,color:#fff;
    classDef agent fill:#6F8A6C,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#2E2E28,stroke:#fff,stroke-width:2px,color:#fff;

    UI[Farmer / Dashboard UI]:::client -->|Farm Details| Orch(Orchestrator):::orchestrator
    Orch -->|Parallel| W(Weather):::agent
    Orch -->|Parallel| C(Crop):::agent
    Orch -->|Parallel| F(Fertilizer):::agent
    W --> I(Irrigation):::agent
    C <-->|Crop Data| VDB[(Knowledge Base)]:::db
    Orch -->|Advisory Plan| UI
    UI -->|Leaf Photo| P(Pest Scanner):::agent
    P <-->|Pathology Data| VDB`;

const STEPS = [
  {
    num: 1,
    icon: Sprout,
    title: 'Fill in Your Farm Details',
    intro: 'Go to the Dashboard (home page) and enter your farm information:',
    items: [
      { label: 'Location', text: 'your village, district, or city (e.g. Karur, Pune). This helps us check local weather.' },
      { label: 'Soil Type', text: 'choose the type that best matches your land (Loamy, Red/Laterite, Black Cotton, Sandy, or Clayey).' },
      { label: 'Land Size', text: 'enter your farm size in acres (optional but helpful).' },
      { label: 'Target Crop', text: 'if you already know what you want to grow, type it here (e.g. Mango, Tomato). Leave blank if you want suggestions.' },
    ],
    outro: 'Click "Generate Advisory Plan" and wait a few seconds. Four specialists — Weather, Crop, Fertilizer, and Irrigation — will analyze your details and build a plan.',
  },
  {
    num: 2,
    icon: CloudRain,
    title: 'Read Your Results',
    intro: 'After the analysis finishes, you will see your complete farm plan at the top.',
    items: [
      { label: 'Weather Outlook', text: 'what the weather looks like for your area and how it affects your farming this week.' },
      { label: 'Crop Strategy', text: 'which crops suit your soil and why.' },
      { label: 'Fertilizer Plan', text: 'what nutrients to apply and how much per acre.' },
      { label: 'Irrigation Schedule', text: 'when and how much to water.' },
    ],
    outro: 'Click any step in the "Agent Orchestration Track" bar to see a plain-language explanation of what that specialist found and why.',
  },
  {
    num: 3,
    icon: Bug,
    title: 'Use the Pest & Disease Scanner',
    intro: 'Scroll down on the Dashboard to the Pest & Disease Scanner section.',
    items: [
      { label: 'Step 1', text: 'Take a clear, close-up photo of an affected plant leaf (good lighting, leaf fills most of the frame).' },
      { label: 'Step 2', text: 'Click "Click to upload leaf photo" and select your image.' },
      { label: 'Step 3', text: 'Press "Scan Now" — the AI will analyze the photo and tell you what disease or pest it may be, how confident it is, and what treatment to try.' },
    ],
    outro: 'If you upload something that is not a plant leaf (e.g. an animal or random object), the scanner will politely ask you to upload a proper leaf photo instead.',
  },
  {
    num: 4,
    icon: MessageCircle,
    title: 'Use AgriMind Chat',
    intro: 'Click the green chat button in the bottom-right corner of any page.',
    items: [
      { label: 'Ask questions', text: 'Type your question — for example: "What crop suits red soil?" or "How to treat tomato leaf curl?"' },
      { label: 'Language', text: 'Switch language using the dropdown at the top of the chat (English, Tamil, or Hindi).' },
      { label: 'Voice input', text: 'Tap the microphone icon to ask your question by voice (works best in Chrome).' },
      { label: 'Auto-speak', text: 'Tap the speaker icon to turn read-aloud on or off.' },
    ],
    outro: 'The chatbot can answer questions about crops, fertilizer, weather, and irrigation. For pest diagnosis, use the leaf scanner instead.',
  },
  {
    num: 5,
    icon: Calculator,
    title: 'Use the Unit Converter & Price Calculator',
    intro: 'Go to "Unit Calculator" in the top navigation bar.',
    items: [
      { label: 'Categories', text: 'Choose Land Area, Weight, Volume, Fertilizer Rate, Yield, or Price Calculator.' },
      { label: 'Unit conversions', text: 'Enter a value, pick "From" and "To" units, and see the result instantly.' },
      { label: 'Price Calculator', text: 'Enter a known price (e.g. 5 kg tomato = ₹50), then enter a different quantity (e.g. 12 kg) — the calculator shows the equivalent price (₹120).' },
    ],
    outro: 'Useful when comparing market prices or estimating earnings from a different harvest weight.',
  },
];

function StepCard({ step }) {
  const Icon = step.icon;
  return (
    <article className="card-surface p-6 md:p-8 space-y-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-sage-700 text-white flex items-center justify-center font-serif font-bold">
          {step.num}
        </div>
        <div className="space-y-3 flex-1">
          <h2 className="text-xl md:text-2xl text-terracotta font-serif flex items-center gap-2">
            <Icon size={22} className="text-sage" />
            {step.title}
          </h2>
          <p className="text-charcoal/80 leading-relaxed">{step.intro}</p>
          <ul className="space-y-2 text-charcoal/80 leading-relaxed list-none">
            {step.items.map((item) => (
              <li key={item.label} className="flex gap-2">
                <span className="font-medium text-charcoal shrink-0">{item.label} —</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-charcoal/80 leading-relaxed">{step.outro}</p>
        </div>
      </div>
    </article>
  );
}

export default function HowItWorks() {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl text-terracotta border-b border-sage/30 pb-4">How to Use AgriMind</h1>
        <p className="text-lg text-charcoal/80 leading-relaxed">
          AgriMind is your personal farm advisor. Follow these simple steps to get crop advice,
          check for plant diseases, ask questions, and convert farm units — no technical knowledge needed.
        </p>
      </header>

      <div className="space-y-6">
        {STEPS.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}
      </div>

      <section className="card-surface overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnical((v) => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-sage/5 transition-colors"
          aria-expanded={showTechnical}
        >
          <span className="font-serif text-lg text-charcoal font-medium">Technical Details — System Flow</span>
          {showTechnical ? <ChevronUp size={20} className="text-sage" /> : <ChevronDown size={20} className="text-sage" />}
        </button>
        {showTechnical && (
          <div className="px-5 pb-6 border-t border-sage/20 pt-4">
            <p className="text-sm text-charcoal/60 mb-4">
              For developers and curious users — this diagram shows how AgriMind processes your farm details behind the scenes.
            </p>
            <div className="overflow-x-auto">
              <MermaidChart definition={FLOWCHART} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

import { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

const initMermaid = () => {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });
  mermaidInitialized = true;
};

export default function MermaidChart({ definition }) {
  const containerRef = useRef(null);
  const reactId = useId();
  const renderId = `mermaid-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !definition) return;

    let cancelled = false;

    const render = async () => {
      initMermaid();
      try {
        const { svg } = await mermaid.render(renderId, definition.trim());
        if (!cancelled && container) {
          container.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (!cancelled && container) {
          container.innerHTML = '<p class="text-terracotta text-sm">Could not render diagram.</p>';
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [definition, renderId]);

  return (
    <div
      ref={containerRef}
      className="mermaid-chart w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
      aria-label="System flow diagram"
    />
  );
}

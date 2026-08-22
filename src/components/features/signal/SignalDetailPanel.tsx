import { SignalDayType } from '@/lib/signal/schemas';
import { ExternalLink, X } from 'lucide-react';

type SignalNode = SignalDayType['nodes'][0];

interface SignalDetailPanelProps {
  node: SignalNode | null;
  onClose: () => void;
}

export default function SignalDetailPanel({ node, onClose }: SignalDetailPanelProps) {
  if (!node) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-12 md:left-auto md:w-80 lg:w-96 p-4 z-50 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-8 duration-300 pointer-events-none">
      
      <div className="relative pointer-events-auto flex flex-col max-h-[85vh] md:max-h-[75vh] bg-brand-neutral-900/90 backdrop-blur-md border border-brand-neutral-800 rounded-xl p-6 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-neutral-400 hover:text-brand-neutral-100 transition-colors shrink-0 z-10"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Metadata */}
        <div className="shrink-0 pr-8">
          <div className="flex items-center gap-3 mb-4 text-xs font-mono tracking-wider text-brand-neutral-400 uppercase">
            <span className="bg-brand-neutral-800 px-2 py-1 rounded-md">{node.category}</span>
            <span className="text-brand-accent/70">{node.tier}</span>
          </div>
          <h2 className="text-xl font-medium text-brand-neutral-100 mb-4 leading-snug">
            {node.title}
          </h2>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto min-h-0 mb-4 pr-2 custom-scrollbar">
          <p className="text-sm text-brand-neutral-300 leading-relaxed">
            {node.description}
          </p>
        </div>

        {/* Source Link / Action Area */}
        <div className="shrink-0 pt-3 border-t border-brand-neutral-800/50">
          {node.url ? (
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent hover:text-brand-accent/80 transition-colors group"
            >
              Visit {node.source}
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : (
            <span className="text-sm text-brand-neutral-500 italic">
              Source: {node.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

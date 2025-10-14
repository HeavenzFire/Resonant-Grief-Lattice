
import React from 'react';

interface ControlsProps {
  riteState: 'idle' | 'calibrating' | 'processing' | 'complete';
  isMicActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
}

const baseButtonClass = "px-8 py-3 text-lg font-serif tracking-wider rounded-md transition-all duration-300 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonClass = `${baseButtonClass} bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:shadow-emerald-500/50 hover:scale-105`;
const secondaryButtonClass = `${baseButtonClass} bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-500/50 hover:scale-105`;
const tertiaryButtonClass = `${baseButtonClass} bg-slate-700 text-slate-300 hover:bg-slate-600`;

export const Controls: React.FC<ControlsProps> = ({ riteState, onStart, onEnd, onReset, isMicActive }) => {
  if (riteState === 'idle') {
    return (
        <button onClick={onStart} className={primaryButtonClass}>
            Begin the Rite
        </button>
    );
  }

  if (riteState === 'calibrating') {
    return (
        <button onClick={onEnd} disabled={!isMicActive} className={secondaryButtonClass}>
            {isMicActive ? 'Seal the Glyph' : 'Initializing Aether...'}
        </button>
    );
  }
  
  if (riteState === 'processing') {
    return (
        <button disabled className={`${secondaryButtonClass} opacity-50`}>
            Processing...
        </button>
    );
  }

  if (riteState === 'complete') {
    return (
        <button onClick={onReset} className={tertiaryButtonClass}>
            Begin Anew
        </button>
    );
  }

  return null;
};

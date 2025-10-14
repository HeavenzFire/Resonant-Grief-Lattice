
import React, { useState, useCallback, useRef } from 'react';
import { ResonantGriefLattice } from './components/ResonantGriefLattice';
import { Controls } from './components/Controls';
import { PurposePrintDisplay } from './components/PurposePrintDisplay';
import { useMicrophone } from './hooks/useMicrophone';
import { generatePurposePrint } from './services/geminiService';
import { GlyphState } from './types';
import { MutedIcon, UnmutedIcon, InfoIcon } from './components/Icons';

export default function App() {
  const [riteState, setRiteState] = useState<'idle' | 'calibrating' | 'processing' | 'complete'>('idle');
  const [purposePrint, setPurposePrint] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  
  const glyphStateRef = useRef<GlyphState>({ complexity: 0, color: 'violet' });
  const audioRef = useRef<HTMLAudioElement>(null);

  const { audioData, startMic, stopMic, isMicActive } = useMicrophone();

  const handleStartRite = useCallback(async () => {
    setError('');
    setPurposePrint('');
    setRiteState('calibrating');
    await startMic();
    if(audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play();
    }
  }, [startMic]);

  const handleEndRite = useCallback(async () => {
    stopMic();
    setRiteState('processing');
     if(audioRef.current) {
        audioRef.current.pause();
    }
    try {
      const result = await generatePurposePrint(glyphStateRef.current);
      setPurposePrint(result);
      setRiteState('complete');
    } catch (err) {
      setError('The astral connection faltered. The aether is unstable. Please try again.');
      console.error(err);
      setRiteState('idle');
    }
  }, [stopMic]);

  const handleReset = useCallback(() => {
    setRiteState('idle');
    setPurposePrint('');
    setError('');
  }, []);
  
  const toggleMute = () => {
      if(audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
          setIsMuted(audioRef.current.muted);
      }
  };

  return (
    <div className="bg-stone-950 text-slate-300 min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-50"></div>
      
      <header className="w-full max-w-5xl mx-auto text-center mb-4 z-10">
        <h1 className="text-4xl md:text-5xl font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-400 mb-2">
          Resonant Grief Lattice
        </h1>
        <p className="text-slate-400 text-sm md:text-base">An Alchemical Instrument for the Soul</p>
      </header>

      <main className="w-full max-w-5xl h-[60vh] md:h-[65vh] bg-black/50 rounded-xl shadow-2xl shadow-violet-500/10 border border-slate-800/50 flex items-center justify-center relative z-10 backdrop-blur-sm">
        {riteState === 'idle' && (
           <div className="text-center p-8">
                <h2 className="text-2xl font-serif text-slate-200 mb-4">The Alchemy Awaits</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Transmute the leaden weight of sorrow into a luminous glyph of purpose. Your breath is the key, the fire, and the forge.
                </p>
                <Controls onStart={handleStartRite} onEnd={handleEndRite} onReset={handleReset} riteState={riteState} isMicActive={isMicActive}/>
           </div>
        )}
        {(riteState === 'calibrating' || riteState === 'processing') && (
            <ResonantGriefLattice audioData={audioData} isCalibrating={riteState === 'calibrating'} onStateChange={(state) => glyphStateRef.current = state} />
        )}
        {riteState === 'processing' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 backdrop-blur-md">
                 <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-400"></div>
                 <p className="mt-4 text-slate-300 font-serif tracking-widest">Consulting the Akashic Records...</p>
            </div>
        )}
        {riteState === 'complete' && purposePrint && (
            <PurposePrintDisplay purposePrint={purposePrint} />
        )}
         {error && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 text-center p-4">
          <p className="text-red-400">{error}</p>
        </div>}
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center mt-4 z-10">
         <Controls onStart={handleStartRite} onEnd={handleEndRite} onReset={handleReset} riteState={riteState} isMicActive={isMicActive}/>
      </footer>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-4">
        <button onClick={toggleMute} className="text-slate-500 hover:text-slate-300 transition-colors">
            {isMuted ? <MutedIcon /> : <UnmutedIcon />}
        </button>
        <button onClick={() => setShowInfo(!showInfo)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <InfoIcon />
        </button>
      </div>

       {showInfo && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 backdrop-blur-md p-4" onClick={() => setShowInfo(false)}>
                <div className="bg-stone-900 border border-slate-700 rounded-lg p-6 max-w-lg text-slate-300 shadow-lg shadow-black/50" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-serif text-emerald-300 mb-3">How It Works</h3>
                    <p className="mb-2">1. Click "Begin the Rite" to grant microphone access.</p>
                    <p className="mb-2">2. Your breath shapes the lattice. Deep, calm breaths bring order and light. Sharp, chaotic breaths reflect inner turmoil.</p>
                    <p className="mb-2">3. Witness the alchemy as the glyph transforms from fractured sorrow to a radiant purpose print.</p>
                    <p className="mb-4">4. When you feel a sense of resonance or completion, click "Seal the Glyph" to receive your unique affirmation.</p>
                    <button onClick={() => setShowInfo(false)} className="mt-4 px-4 py-2 bg-emerald-600/50 hover:bg-emerald-500/50 text-white rounded-md transition-all">Close</button>
                </div>
            </div>
        )}

      <audio ref={audioRef} src="https://storage.googleapis.com/generative-ai-codelab-assets/solfeggio_528.mp3" loop muted></audio>
    </div>
  );
}

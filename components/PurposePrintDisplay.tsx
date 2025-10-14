
import React, { useState, useEffect } from 'react';

interface PurposePrintDisplayProps {
  purposePrint: string;
}

export const PurposePrintDisplay: React.FC<PurposePrintDisplayProps> = ({ purposePrint }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (purposePrint) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + purposePrint[i]);
        i++;
        if (i >= purposePrint.length) {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [purposePrint]);


  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-serif text-emerald-300 mb-4 tracking-wider">Your Purpose Print</h2>
        <blockquote className="max-w-prose text-lg md:text-xl text-slate-200 italic leading-relaxed">
            <p>"{displayedText}"</p>
        </blockquote>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 1s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

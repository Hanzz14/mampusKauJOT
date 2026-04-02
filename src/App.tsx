/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  type: 'damage' | 'message';
}

const MESSAGES = [
  'website lu kayak tai',
  'gw pengen ketemu oshi gw bangsat',
  'kalo dikasih feedback itu didengerin',
  'hire developer yang bener anjing',
  'gw udah begadang goblok',
];

export default function App() {
  const [hp, setHp] = useState(100);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isPunching, setIsPunching] = useState(false);
  const [isKO, setIsKO] = useState(false);
  const nextId = useRef(0);

  const handlePunch = useCallback((e: MouseEvent) => {
    if (isKO) return;

    const damage = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
    const newHp = Math.max(0, hp - damage);
    
    setHp(newHp);
    setIsPunching(true);
    setTimeout(() => setIsPunching(false), 100);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const damageId = nextId.current++;
    const messageId = nextId.current++;

    const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const messageDuration = Math.floor(Math.random() * (12000 - 8000 + 1)) + 8000;

    // Center the message horizontally with a small random offset
    const centerX = rect.width / 2;
    const randomOffsetX = (Math.random() - 0.5) * 40;

    setFloatingTexts((prev) => [
      ...prev,
      { id: damageId, text: `-${damage}`, x, y: y - 20, type: 'damage' },
      { id: messageId, text: randomMessage, x: centerX + randomOffsetX, y: rect.height / 2, type: 'message' },
    ]);

    // Cleanup damage text quickly
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== damageId));
    }, 1000);

    // Cleanup message text after 8-12s
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== messageId));
    }, messageDuration);

    if (newHp === 0) {
      setIsKO(true);
    }
  }, [hp, isKO]);

  const resetGame = () => {
    setHp(100);
    setIsKO(false);
    setFloatingTexts([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden select-none">
      {/* Header */}
      <div className="absolute top-8 w-full max-w-md px-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter text-zinc-100 italic uppercase">JOT Puncher</h1>
          <button 
            onClick={resetGame}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        {/* HP Bar */}
        <div className="relative h-6 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-orange-500"
            initial={{ width: '100%' }}
            animate={{ width: `${hp}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest mix-blend-difference">
            HP: {hp} / 100
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative w-full max-w-lg aspect-square flex items-center justify-center cursor-crosshair"
        onClick={handlePunch}
      >
        <AnimatePresence>
          {floatingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: item.y, scale: 0.5 }}
              animate={{ 
                opacity: [1, 1, 0],
                y: item.y - 150, 
                scale: 1.2 
              }}
              transition={{ 
                duration: item.type === 'damage' ? 1 : 10,
                times: [0, 0.8, 1],
                ease: "easeOut"
              }}
              exit={{ opacity: 0 }}
              className={`absolute pointer-events-none font-black whitespace-nowrap ${
                item.type === 'damage' 
                  ? 'text-red-500 text-2xl sm:text-3xl z-50' 
                  : 'bg-white text-zinc-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base shadow-2xl border-2 border-zinc-900 z-40 -translate-x-1/2'
              }`}
              style={{ left: item.x }}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Character Container */}
        <motion.div
          animate={isPunching ? {
            x: [0, -10, 10, -5, 5, 0],
            rotate: [0, -2, 2, -1, 1, 0],
          } : {}}
          transition={{ duration: 0.1 }}
          className="relative flex flex-col items-center"
        >
          {isKO ? (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="relative z-10 flex flex-col items-center gap-8"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full animate-pulse" />
                <img 
                  src="https://i.imgur.com/pWC6gQf.jpeg" 
                  alt="KO Effect" 
                  className="w-48 sm:w-64 h-auto object-contain rounded-2xl border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] bg-zinc-900"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    // Prevent infinite loop if fallback also fails
                    if (img.src !== "https://picsum.photos/seed/ko-fallback/400/400") {
                      console.warn("User image failed to load, using placeholder");
                      img.src = "https://picsum.photos/seed/ko-fallback/400/400";
                    }
                  }}
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-black text-2xl italic uppercase tracking-tighter shadow-xl whitespace-nowrap">
                  mampus kau JOT
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
                className="bg-white text-zinc-950 px-8 py-4 rounded-full font-black text-xl uppercase tracking-tighter shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-zinc-100 transition-colors"
              >
                pukuli JOT lagi
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center scale-75 sm:scale-100">
              {/* Head */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-200 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-inner relative border-4 border-zinc-300">
                <span className={isPunching ? 'scale-110' : ''}>
                  {hp > 50 ? '😈' : hp > 20 ? '🤕' : '😵'}
                </span>
              </div>
              
              {/* Neck */}
              <div className="w-6 h-3 sm:w-8 sm:h-4 bg-zinc-300 -mt-1" />
              
              {/* Body / T-Shirt */}
              <div className="w-36 h-44 sm:w-48 sm:h-56 bg-red-600 rounded-t-[30px] sm:rounded-t-[40px] rounded-b-xl flex flex-col items-center pt-6 sm:pt-8 shadow-lg border-x-4 border-red-700 relative">
                <span className="text-white font-black text-4xl sm:text-5xl tracking-tighter italic drop-shadow-md">
                  JOT
                </span>
                
                {/* Arms */}
                <div className="absolute -left-6 sm:-left-8 top-3 sm:top-4 w-10 h-24 sm:w-12 sm:h-32 bg-zinc-200 rounded-full origin-top -rotate-12 border-2 border-zinc-300" />
                <div className="absolute -right-6 sm:-right-8 top-3 sm:top-4 w-10 h-24 sm:w-12 sm:h-32 bg-zinc-200 rounded-full origin-top rotate-12 border-2 border-zinc-300" />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-12 text-zinc-500 text-sm font-medium uppercase tracking-widest animate-pulse">
        {isKO ? 'Mampus Kau JOT!' : 'Click the character to punch'}
      </div>

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

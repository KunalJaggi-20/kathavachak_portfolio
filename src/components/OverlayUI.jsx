import React from 'react';

export default function OverlayUI({ scrollPercent, isMuted, setIsMuted }) {
  // Helper to interpolate opacity and transform based on scroll
  const getSectionStyles = (p, start, peak, end) => {
    let o = 0;
    if (p >= start && p <= peak) {
      o = (p - start) / (peak - start);
    } else if (p > peak && p <= end) {
      o = 1 - (p - peak) / (end - peak);
    }
    o = Math.max(0, Math.min(1, o));
    // Ease-in-out cubic
    o = o * o * (3 - 2 * o);
    const ty = (1 - o) * 30;
    return {
      opacity: o,
      transform: `translateY(${ty}px)`,
      pointerEvents: o > 0.1 ? 'auto' : 'none'
    };
  };

  // Intro fade out math
  const getIntroStyles = () => {
    let o = 1;
    if (scrollPercent > 0 && scrollPercent <= 0.08) {
      o = 1 - (scrollPercent / 0.08);
    } else if (scrollPercent > 0.08) {
      o = 0;
    }
    return {
      opacity: o,
      pointerEvents: o > 0.02 ? 'auto' : 'none',
      visibility: o === 0 ? 'hidden' : 'visible'
    };
  };

  // Scroll Hint fade out
  const scrollHintOpacity = Math.max(0, 1 - (scrollPercent / 0.05));

  // Determine current chapter (1 to 5)
  const currentChapter = Math.min(5, Math.floor(scrollPercent * 5) + 1);

  return (
    <>
      {/* Intro Black Screen */}
      <div 
        style={getIntroStyles()}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-400 ease"
      >
        {/* Pulsing circles */}
        <div className="absolute w-20 h-20 border border-white/30 rounded-full animate-ping [animation-duration:2.4s]"></div>
        <div className="absolute w-20 h-20 border border-white/20 rounded-full animate-ping [animation-duration:2.4s] [animation-delay:1.2s]"></div>
        
        <div className="text-center relative z-10">
          <div className="text-xs tracking-[0.4em] uppercase opacity-60 mb-6 font-sans">Chapter I · The Odyssey</div>
          <div className="font-serif italic text-5xl md:text-7xl mb-10 text-ink">Scroll to View</div>
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase opacity-70">
            <span className="w-8 h-px bg-white/50"></span>
            Begin the journey
            <span className="w-8 h-px bg-white/50"></span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        style={{ transform: `scaleX(${scrollPercent})`, transformOrigin: 'left' }}
        className="fixed top-0 left-0 h-[2px] w-full bg-gradient-to-r from-accent to-accent2 z-45 transition-transform duration-100 ease-out" 
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-7 md:px-10 md:py-7 flex justify-between items-center z-40 mix-blend-difference select-none pointer-events-auto">
        <div className="logo font-serif text-2xl tracking-wider text-ink">
          Horizon<span className="text-accent">.</span>
        </div>
        <ul className="hidden md:flex gap-9 text-[11px] tracking-[0.18em] uppercase font-sans text-ink">
          <li className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity">Work</li>
          <li className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity">Studio</li>
          <li className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity">Journal</li>
          <li className="opacity-75 hover:opacity-100 cursor-pointer transition-opacity">Contact</li>
        </ul>
        {/* Subtitle/Audio toggle on the header for extra premium feel */}
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="text-[10px] tracking-[0.2em] uppercase font-sans py-1 px-3 border border-white/20 rounded-full hover:border-[#ff5b2e] cursor-pointer opacity-70 hover:opacity-100 transition-all select-none"
        >
          {isMuted ? 'Sound Off Track' : 'Sound On Track'}
        </button>
      </nav>

      {/* Section Counter */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-30 text-[11px] tracking-[0.3em] uppercase select-none opacity-60 pointer-events-none hidden md:block">
        <div className="flex flex-col items-center gap-2" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          <span className="text-accent font-medium">{String(currentChapter).padStart(2, '0')}</span>
          <span className="opacity-40">—</span>
          <span>05</span>
        </div>
      </div>

      {/* Section Content 0 */}
      <div 
        style={getSectionStyles(scrollPercent, 0.00, 0.10, 0.20)}
        className="fixed inset-0 flex items-center justify-center text-center px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-3xl pointer-events-auto">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            <span className="w-8 h-px bg-accent"></span>
            Est. 2024 · Independent Studio
          </div>
          <h1 className="font-serif font-light text-5xl md:text-8xl leading-[0.95] tracking-tight mb-7 text-ink">
            We build<br/>worlds that <em className="text-accent italic not-italic">breathe</em>.
          </h1>
          <p className="max-w-[440px] mx-auto text-sm md:text-base leading-relaxed opacity-75 font-sans font-light mb-8">
            A design and technology studio crafting immersive digital experiences at the intersection of art, code, and motion.
          </p>
          <div className="flex justify-center gap-12 text-[10px] tracking-[0.2em] uppercase opacity-60 font-sans mt-10">
            <span>Based in<b className="block text-ink mt-1 font-medium font-sans">Reykjavík · Lisbon</b></span>
            <span>Working with<b className="block text-ink mt-1 font-medium font-sans">Global Brands</b></span>
          </div>
        </div>
      </div>

      {/* Section Content 1 */}
      <div 
        style={getSectionStyles(scrollPercent, 0.20, 0.30, 0.40)}
        className="fixed inset-0 flex items-center justify-end text-right px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto">
          <div className="flex items-center justify-end gap-3 text-xs tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            01 · Discovery
            <span className="w-8 h-px bg-accent"></span>
          </div>
          <h1 className="font-serif font-light text-5xl md:text-8xl leading-[0.95] tracking-tight mb-7 text-ink">
            Chase the<br/><em className="text-accent italic not-italic">unknown</em>.
          </h1>
          <p className="max-w-[420px] ml-auto text-sm md:text-base leading-relaxed opacity-75 font-sans font-light mb-8">
            Every great project begins with a question no one has asked yet. We follow the signal through the noise, mapping territories that don't appear on any chart.
          </p>
          <div className="flex justify-end gap-12 text-[10px] tracking-[0.2em] uppercase opacity-60 font-sans mt-10">
            <span>Phase<b className="block text-ink mt-1 font-medium font-sans">Research & Strategy</b></span>
          </div>
        </div>
      </div>

      {/* Section Content 2 */}
      <div 
        style={getSectionStyles(scrollPercent, 0.40, 0.50, 0.60)}
        className="fixed inset-0 flex items-center justify-center text-center px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            <span className="w-8 h-px bg-accent"></span>
            02 · Ascent
            <span className="w-8 h-px bg-accent"></span>
          </div>
          <h1 className="font-serif font-light text-5xl md:text-8xl leading-[0.95] tracking-tight mb-7 text-ink">
            Rise above<br/>the <em className="text-accent italic not-italic">horizon</em>.
          </h1>
          <p className="max-w-[420px] mx-auto text-sm md:text-base leading-relaxed opacity-75 font-sans font-light mb-8">
            Perspective changes everything. From altitude, patterns emerge — connections invisible from the ground become the architecture of the next idea.
          </p>
          <div className="flex justify-center gap-12 text-[10px] tracking-[0.2em] uppercase opacity-60 font-sans mt-10">
            <span>Phase<b className="block text-ink mt-1 font-medium font-sans">Concept & Direction</b></span>
          </div>
        </div>
      </div>

      {/* Section Content 3 */}
      <div 
        style={getSectionStyles(scrollPercent, 0.60, 0.70, 0.80)}
        className="fixed inset-0 flex items-center justify-start text-left px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto">
          <div className="flex items-center justify-start gap-3 text-xs tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            <span className="w-8 h-px bg-accent"></span>
            03 · Reflection
          </div>
          <h1 className="font-serif font-light text-5xl md:text-8xl leading-[0.95] tracking-tight mb-7 text-ink">
            Look <em className="text-accent italic not-italic">within</em><br/>the depths.
          </h1>
          <p className="max-w-[420px] text-sm md:text-base leading-relaxed opacity-75 font-sans font-light mb-8">
            The quietest moments carry the loudest truths. We design for stillness as much as motion — spaces where meaning has room to arrive.
          </p>
          <div className="flex justify-start gap-12 text-[10px] tracking-[0.2em] uppercase opacity-60 font-sans mt-10">
            <span>Phase<b className="block text-ink mt-1 font-medium font-sans">Craft & Detail</b></span>
          </div>
        </div>
      </div>

      {/* Section Content 4 */}
      <div 
        style={getSectionStyles(scrollPercent, 0.80, 0.90, 1.00)}
        className="fixed inset-0 flex items-center justify-center text-center px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.4em] uppercase text-accent mb-6 font-sans font-light">
            <span className="w-8 h-px bg-accent"></span>
            04 · Return
            <span className="w-8 h-px bg-accent"></span>
          </div>
          <h1 className="font-serif font-light text-5xl md:text-8xl leading-[0.95] tracking-tight mb-7 text-ink">
            Every end is<br/>a new <em className="text-accent italic not-italic">beginning</em>.
          </h1>
          <p className="max-w-[420px] mx-auto text-sm md:text-base leading-relaxed opacity-75 font-sans font-light mb-8">
            The journey loops. What you've seen is only the surface — scroll again, look closer, and the world reveals something it hid the first time.
          </p>
          <div className="flex justify-center gap-12 text-[10px] tracking-[0.2em] uppercase opacity-60 font-sans mt-10">
            <span>Let's make something<b className="block text-accent hover:text-ink mt-1 font-medium font-sans cursor-pointer transition-colors">hello@horizon.studio</b></span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div 
        style={{ opacity: scrollHintOpacity, transition: 'opacity 0.4s ease' }}
        className="fixed bottom-9 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-3 font-sans text-[10px] tracking-[0.35em] uppercase opacity-70 pointer-events-none select-none"
      >
        <span>Scroll</span>
        <div className="w-[1px] h-10 bg-linear-to-b from-transparent to-ink animate-[scrollLine_2s_ease-in-out_infinite]" />
      </div>

      {/* Footer */}
      <div className="fixed bottom-8 left-[2.5rem] z-30 text-[10px] tracking-[0.2em] uppercase opacity-50 select-none pointer-events-none hidden md:block">
        © Horizon Studio — MMXXV
      </div>

      {/* Keyframe scroll line animation */}
      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(0.3); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}

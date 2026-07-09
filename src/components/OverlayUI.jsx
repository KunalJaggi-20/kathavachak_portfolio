import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function OverlayUI({ scrollPercent, isMuted, setIsMuted }) {
  const [timecode, setTimecode] = useState("00:00:00:00");

  useEffect(() => {
    let frame = 0;
    let sec = 0;
    let min = 0;
    let hr = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame >= 24) {
        frame = 0;
        sec++;
        if (sec >= 60) {
          sec = 0;
          min++;
          if (min >= 60) {
            min = 0;
            hr++;
          }
        }
      }
      
      const format = (val) => String(val).padStart(2, '0');
      setTimecode(`${format(hr)}:${format(min)}:${format(sec)}:${format(frame)}`);
    }, 41.67); // 24 FPS approx.

    return () => clearInterval(interval);
  }, []);

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

  // Smooth scroll helper to navigate to specific sections
  const scrollToPercent = (p) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: p * maxScroll,
      behavior: 'smooth'
    });
  };

  // Determine current chapter (1 to 5)
  const currentChapter = Math.min(5, Math.floor(scrollPercent * 5) + 1);

  // Use refs for GSAP stagger effects when a section comes into view
  const sectionRefs = useRef([]);

  useEffect(() => {
    // GSAP blur, translateY, and fade in logic 
    // triggered based on scrollPercent active sections.
    // Since getSectionStyles handles overall section opacity/translate,
    // we use GSAP to animate internal text elements once a section passes a threshold.
    const activeRange = [
      { start: 0.00, end: 0.20 }, // 0: Hero
      { start: 0.20, end: 0.40 }, // 1: Production
      { start: 0.40, end: 0.60 }, // 2: Strategy
      { start: 0.60, end: 0.80 }, // 3: Scripting
      { start: 0.80, end: 0.95 }, // 4: Post Production
      { start: 0.95, end: 1.01 }, // 5: Final CTA
    ];

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;

      const elements = section.querySelectorAll('.gsap-animate');
      const range = activeRange[index] || { start: index * 0.2, end: index * 0.2 + 0.2 };
      const isActive = scrollPercent >= range.start && scrollPercent < range.end;

      // If we crossed into this section's peak visibility
      if (isActive) {
        if (!section.classList.contains('is-animated')) {
          section.classList.add('is-animated');
          gsap.fromTo(elements,
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              stagger: 0.15,
              ease: 'power3.out',
              overwrite: 'auto'
            }
          );
        }
      } else {
        if (section.classList.contains('is-animated')) {
          section.classList.remove('is-animated');
          // Reset when out of view
          gsap.set(elements, { opacity: 0, y: 30, filter: 'blur(10px)' });
        }
      }
    });
  }, [scrollPercent]);

  // Accent color overrides where tailwind classes aren't specific
  const accentColor = '#D96B3A';

  return (
    <>
      {/* Intro Black Screen */}
      <div
        style={getIntroStyles()}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-400 ease select-none"
      >
        {/* Dynamic Video Viewfinder HUD */}
        <div className="absolute inset-8 border border-white/5 pointer-events-none flex flex-col justify-between p-4 text-[9px] font-mono tracking-widest text-white/40">
          {/* Top Row: REC + 24FPS */}
          <div className="flex justify-between items-center select-none font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>REC</span>
            </div>
            <div>24 FPS</div>
          </div>
          
          {/* Bottom Row: RAW 4K + TIMECODE */}
          <div className="flex justify-between items-center select-none font-sans">
            <div>RAW 4K · ISO 400</div>
            <div>TC {timecode}</div>
          </div>
        </div>

        {/* Viewfinder Corners (thin brackets bounding the center content) */}
        <div className="absolute w-[280px] h-[180px] md:w-[420px] md:h-[260px] pointer-events-none flex flex-col justify-between opacity-30 animate-pulse-slow">
          <div className="flex justify-between w-full">
            {/* Top-left */}
            <div className="w-6 h-6 border-t border-l border-white" />
            {/* Top-right */}
            <div className="w-6 h-6 border-t border-r border-white" />
          </div>
          <div className="flex justify-between w-full">
            {/* Bottom-left */}
            <div className="w-6 h-6 border-b border-l border-white" />
            {/* Bottom-right */}
            <div className="w-6 h-6 border-b border-r border-white" />
          </div>
        </div>

        {/* Intro content */}
        <div className="text-center relative z-10 flex flex-col items-center select-none">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-50 mb-7 font-sans text-white animate-[logoLetterSpacing_4s_ease-out_forwards]">
            KATHAVACHAK
          </div>
          <div className="font-serif text-4xl md:text-6xl mb-12 text-white font-light tracking-tight hover:text-accent transition-colors duration-500 cursor-default">
            Scroll to Begin
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.2em] uppercase opacity-40 text-white font-sans">
            <span className="w-6 h-[1px] bg-white/40"></span>
            Storytelling Studio
            <span className="w-6 h-[1px] bg-white/40"></span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{ transform: `scaleX(${scrollPercent})`, transformOrigin: 'left', backgroundColor: accentColor }}
        className="fixed top-0 left-0 h-[2px] w-full z-45 transition-transform duration-100 ease-out"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-8 md:px-12 md:py-8 flex justify-between items-center z-40 select-none pointer-events-auto mix-blend-difference">
        <div 
          onClick={() => scrollToPercent(0.0)} 
          className="logo font-sans text-[12px] font-medium tracking-[0.2em] uppercase text-white cursor-pointer hover:opacity-80 transition-opacity"
        >
          KATHAVACHAK<span style={{ color: accentColor }}>.</span>
        </div>
        <ul className="hidden md:flex gap-12 text-[10px] tracking-[0.15em] uppercase font-sans text-white">
          <li onClick={() => scrollToPercent(0.30)} className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity">Work</li>
          <li onClick={() => scrollToPercent(0.50)} className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity">Studio</li>
          <li onClick={() => scrollToPercent(1.00)} className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity">Contact</li>
        </ul>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-[10px] tracking-[0.15em] uppercase font-sans py-2 px-5 border border-white/20 rounded-full cursor-pointer opacity-60 hover:opacity-100 transition-all select-none text-white hover:border-[#D96B3A]"
        >
          {isMuted ? 'Sound Off' : 'Sound On'}
        </button>
      </nav>

      {/* Section Counter */}
      <div className="fixed right-12 top-1/2 -translate-y-1/2 z-30 text-[10px] tracking-[0.25em] uppercase select-none opacity-50 pointer-events-none hidden md:block text-white mix-blend-difference">
        <div className="flex flex-col items-center gap-4" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          <span className="font-medium" style={{ color: accentColor }}>{String(currentChapter).padStart(2, '0')}</span>
          <span className="opacity-30 h-8 w-[1px] bg-white"></span>
          <span>05</span>
        </div>
      </div>

      {/* Section Content 0 - HERO */}
      <div
        style={getSectionStyles(scrollPercent, 0.00, 0.10, 0.20)}
        className="fixed inset-0 flex items-center justify-start text-left px-[10vw] z-10 pointer-events-none"
      >
        <div className="max-w-[46rem] pointer-events-auto flex flex-col items-start" ref={el => sectionRefs.current[0] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-start gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span style={{ color: accentColor }}>KATHAVACHAK · Storytelling Studio</span>
            <span className="w-8 h-[1px]" style={{ backgroundColor: accentColor }}></span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            Every Expert Has Knowledge.<br />
            Few Become <span className="italic cinematic-highlight" style={{ color: accentColor }}>Unforgettable</span>.
          </h1>
          <p className="gsap-animate opacity-0 max-w-[500px] text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white">
            We help founders, CEOs and industry leaders become trusted brands through cinematic storytelling.
          </p>
          <div className="gsap-animate opacity-0 flex justify-start gap-16 text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-white">
            <span>Strategy Before Content</span>
            <span>Built For Long-Term Authority</span>
          </div>
        </div>
      </div>

      {/* Section Content 1 - CAMERA SCENE */}
      <div
        style={getSectionStyles(scrollPercent, 0.20, 0.30, 0.40)}
        className="fixed inset-0 flex items-center justify-start text-left px-[10vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto" ref={el => sectionRefs.current[1] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-start gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span style={{ color: accentColor }}>01 • PRODUCTION</span>
            <span className="w-12 h-[1px]" style={{ backgroundColor: accentColor }}></span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            We Don't Shoot Videos.<br />
            We Capture <span className="italic cinematic-highlight" style={{ color: accentColor }}>Belief</span>.
          </h1>
          <p className="gsap-animate opacity-0 max-w-[400px] text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white">
            Every frame is designed to build trust.<br />
            People remember stories—not camera settings.
          </p>
          <div className="gsap-animate opacity-0 flex justify-start gap-12 text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-white">
            <span>Cinematography</span>
            <span>Direction</span>
            <span>Visual Identity</span>
          </div>
        </div>
      </div>

      {/* Section Content 2 - WHITEBOARD SCENE */}
      <div
        style={getSectionStyles(scrollPercent, 0.40, 0.50, 0.60)}
        className="fixed inset-0 flex items-center justify-end text-right px-[10vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto flex flex-col items-end" ref={el => sectionRefs.current[2] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-end gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span className="w-12 h-[1px]" style={{ backgroundColor: accentColor }}></span>
            <span style={{ color: accentColor }}>02 • STRATEGY</span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            Great Content<br />
            Starts With<br />
            Great <span className="italic cinematic-highlight" style={{ color: accentColor }}>Strategy</span>.
          </h1>
          <p className="gsap-animate opacity-0 max-w-[400px] text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white text-right">
            Before filming begins,<br />
            we discover your positioning, audience,<br />
            and long-term content roadmap.
          </p>
          <div className="gsap-animate opacity-0 flex justify-end gap-12 text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-white">
            <span>Research</span>
            <span>Positioning</span>
            <span>Growth Strategy</span>
          </div>
        </div>
      </div>

      {/* Section Content 3 - NOTEBOOK SCENE */}
      <div
        style={getSectionStyles(scrollPercent, 0.60, 0.70, 0.80)}
        className="fixed inset-0 flex items-center justify-end text-right px-[10vw] z-10 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto flex flex-col items-end" ref={el => sectionRefs.current[3] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-end gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span className="w-12 h-[1px]" style={{ backgroundColor: accentColor }}></span>
            <span style={{ color: accentColor }}>03 • SCRIPTING</span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            Every Viral Idea<br />
            Begins With<br />
            A <span className="italic cinematic-highlight" style={{ color: accentColor }}>Blank Page</span>.
          </h1>
          <p className="gsap-animate opacity-0 max-w-[400px] ml-auto text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white text-right">
            Hooks. Stories. Scripts.<br />
            Every word is written with intention before the camera rolls.
          </p>
          <div className="gsap-animate opacity-0 flex justify-end gap-12 text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-white">
            <span>Messaging</span>
            <span>Writing</span>
            <span>Creative Direction</span>
          </div>
        </div>
      </div>

      {/* Section Content 4 - EDITING SCENE */}
      <div
        style={getSectionStyles(scrollPercent, 0.80, 0.90, 0.95)}
        className="fixed inset-0 flex items-center justify-center text-center px-[8vw] z-10 pointer-events-none"
      >
        <div className="max-w-3xl pointer-events-auto flex flex-col items-center" ref={el => sectionRefs.current[4] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-center gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span className="w-8 h-[1px]" style={{ backgroundColor: accentColor }}></span>
            <span style={{ color: accentColor }}>04 • POST PRODUCTION</span>
            <span className="w-8 h-[1px]" style={{ backgroundColor: accentColor }}></span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            This Is Where<br />
            Stories Become <span className="italic cinematic-highlight" style={{ color: accentColor }}>Addictive</span>.
          </h1>
          <p className="gsap-animate opacity-0 max-w-[400px] mx-auto text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white">
            Editing controls emotion.<br />
            Every cut, every sound, every transition is crafted to hold attention.
          </p>
          <div className="gsap-animate opacity-0 flex justify-center gap-12 text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-white">
            <span>Editing</span>
            <span>Motion</span>
            <span>Sound Design</span>
          </div>
        </div>
      </div>

      {/* Section Content 5 - FINAL CHARACTER */}
      <div
        style={getSectionStyles(scrollPercent, 0.95, 1.00, 1.00)}
        className="fixed inset-0 flex items-center justify-start text-left px-[10vw] z-10 pointer-events-none"
      >
        <div className="max-w-3xl pointer-events-auto flex flex-col items-start" ref={el => sectionRefs.current[5] = el}>
          <div className="gsap-animate opacity-0 flex items-center justify-start gap-4 text-[10px] tracking-[0.3em] uppercase mb-10 font-sans text-white">
            <span style={{ color: accentColor }}>YOUR STORY STARTS HERE</span>
            <span className="w-8 h-[1px]" style={{ backgroundColor: accentColor }}></span>
          </div>
          <h1 className="gsap-animate opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-10 text-white font-light">
            Ready To Become<br />
            The Brand<br />
            People <span className="italic cinematic-highlight" style={{ color: accentColor }}>Remember</span>?
          </h1>
          <p className="gsap-animate opacity-0 max-w-[450px] text-sm md:text-base leading-relaxed opacity-70 font-sans font-light mb-16 text-white text-left">
            Let's build a personal brand that creates trust before you even enter the room.
          </p>
          <div className="gsap-animate opacity-0">
            <a
              href="#"
              className="inline-block text-[10px] tracking-[0.2em] uppercase font-sans py-4 px-8 border border-white/20 rounded-full hover:bg-white hover:text-black cursor-pointer transition-all duration-300 text-white select-none"
            >
              Book a Discovery Call &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div
        style={{ opacity: scrollHintOpacity, transition: 'opacity 0.4s ease' }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-4 font-sans text-[9px] tracking-[0.35em] uppercase opacity-50 pointer-events-none select-none text-white mix-blend-difference"
      >
        <span>Scroll</span>
        <div className="w-[1px] h-12 bg-linear-to-b from-transparent to-white/70 animate-[scrollLine_2s_ease-in-out_infinite]" />
      </div>

      {/* Footer */}
      <div className="fixed bottom-10 left-[3rem] z-30 text-[9px] tracking-[0.2em] uppercase opacity-40 select-none pointer-events-none hidden md:block text-white mix-blend-difference">
        © KATHAVACHAK — MMXXV
      </div>

      {/* Keyframe scroll line animation */}
      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(0.2); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
        }
        @keyframes logoLetterSpacing {
          0% { letter-spacing: 0.1em; opacity: 0; filter: blur(5px); }
          100% { letter-spacing: 0.4em; opacity: 0.5; filter: blur(0px); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.25; transform: scale(0.98); }
          50% { opacity: 0.45; transform: scale(1.02); }
        }
        .cinematic-highlight {
          position: relative;
          display: inline-block;
          text-shadow: 0 0 10px rgba(217, 107, 58, 0);
          transition: text-shadow 1s ease-out;
        }
        .is-animated .cinematic-highlight {
          text-shadow: 0 0 15px rgba(217, 107, 58, 0.6);
          animation: highlightGlow 3s ease-in-out infinite alternate;
        }
        .cinematic-highlight::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #D96B3A, #ff8855);
          box-shadow: 0 0 8px #D96B3A;
          transition: width 1.2s cubic-bezier(0.25, 1, 0.5, 1);
          transition-delay: 0.4s;
        }
        .is-animated .cinematic-highlight::after {
          width: 100%;
        }
        @keyframes highlightGlow {
          0% {
            text-shadow: 0 0 8px rgba(217, 107, 58, 0.3);
          }
          100% {
            text-shadow: 0 0 18px rgba(217, 107, 58, 0.85);
          }
        }
      `}</style>
    </>
  );
}

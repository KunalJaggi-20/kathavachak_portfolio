import React, { useState, useEffect, useRef } from 'react';
import CanvasRenderer from './components/CanvasRenderer';
import OverlayUI from './components/OverlayUI';
import CustomCursor from './components/CustomCursor';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Instantiate audio from blender-.mp4 audio track
    audioRef.current = new Audio('/blender-.mp4');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4; // 40% volume is comfortable

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn("Audio playback blocked, requires explicit user interaction:", err);
      });
    }
  }, [isMuted]);

  return (
    <main className="relative min-h-screen bg-[#05060a] text-[#f5f1e8] font-sans selection:bg-[#ff5b2e] selection:text-white overflow-hidden">
      {/* 3D Scroll Canvas */}
      <CanvasRenderer 
        onLoadingComplete={() => setIsLoaded(true)} 
        setScrollPercent={setScrollPercent} 
      />

      {/* UI Elements on top of Canvas */}
      {isLoaded && (
        <>
          <OverlayUI 
            scrollPercent={scrollPercent} 
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
          <CustomCursor />
        </>
      )}
    </main>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CanvasRenderer({ onLoadingComplete, setScrollPercent }) {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);

  const totalFrames = 480;

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    // Preload Logic
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const imagePath = `/ss1/ss1/blender-${String(i).padStart(2, "0")}.jpg`;
      img.src = imagePath;

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalFrames) * 100);
        setLoadingProgress(percent);

        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
          onLoadingComplete();
        }
      };

      img.onerror = () => {
        // Fallback or skip failed frames to prevent blocking
        loadedCount++;
        const percent = Math.floor((loadedCount / totalFrames) * 100);
        setLoadingProgress(percent);
        console.error(`Failed to load frame ${i}`);

        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
          onLoadingComplete();
        }
      };

      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
  }, [onLoadingComplete]);

  // Adjust canvas size to fit window
  useEffect(() => {
    if (!isPreloaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameObj.frame);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPreloaded]);

  // Draw Frame function
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aspect ratio math -cover style
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Setup GSAP ScrollTrigger when images are ready
  // Frame object that GSAP will tween
  const currentFrameObj = { frame: 0 };

  useEffect(() => {
    if (!isPreloaded) return;

    const ctx = gsap.context(() => {
      gsap.to(currentFrameObj, {
        frame: totalFrames - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            drawFrame(Math.floor(currentFrameObj.frame));
            setScrollPercent(self.progress);
          },
        },
      });
    }, scrollContainerRef);

    // Render initial frame
    drawFrame(0);

    return () => ctx.revert();
  }, [isPreloaded, setScrollPercent]);

  return (
    <>
      {/* Loading Overlay */}
      {!isPreloaded && (
        <div className="fixed inset-0 z-50 bg-[#05060a] flex flex-col items-center justify-center text-white">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Soft pulsing borders */}
            <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-2 border border-white/10 rounded-full animate-pulse-slow"></div>
            <span className="text-xl font-light tracking-wide font-sans">{loadingProgress}%</span>
          </div>
          <div className="mt-8 text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-white/50 block mb-2">Chapter I · The Odyssey</span>
            <span className="font-serif italic text-3xl text-accent block">Loading Cinematic Render...</span>
          </div>
        </div>
      )}

      {/* Canvas Wrap */}
      <div className="fixed inset-0 z-0 bg-[#05060a]">
        <canvas ref={canvasRef} className="block w-full h-full object-cover" />
      </div>

      {/* Vignette Overlay */}
      <div className="fixed inset-0 z-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>

      {/* Film Grain */}
      <div className="fixed inset-0 z-6 pointer-events-none opacity-[0.06] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.6%27/></svg>')]"></div>

      {/* Scroll area that drives the ScrollTrigger */}
      <div ref={scrollContainerRef} className="relative h-[600vh] w-full z-10 pointer-events-none" />
    </>
  );
}

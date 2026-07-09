import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Smooth follower ring
    let animationFrameId;
    const animateRing = () => {
      const { x: targetX, y: targetY } = mouseRef.current;
      const { x: currentX, y: currentY } = ringPosRef.current;

      const nextX = currentX + (targetX - currentX) * 0.15;
      const nextY = currentY + (targetY - currentY) * 0.15;

      ringPosRef.current = { x: nextX, y: nextY };

      if (ringRef.current) {
        ringRef.current.style.left = `${nextX}px`;
        ringRef.current.style.top = `${nextY}px`;
      }

      animationFrameId = requestAnimationFrame(animateRing);
    };

    animateRing();

    // Hover scale effects on interactive elements
    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('btn');

      if (isInteractive && ringRef.current && dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%, -50%) scale(1.5)';
        ringRef.current.style.width = '50px';
        ringRef.current.style.height = '50px';
        ringRef.current.style.borderColor = 'var(--accent)';
      }
    };

    const handleMouseOut = (e) => {
      if (ringRef.current && dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        ringRef.current.style.width = '36px';
        ringRef.current.style.height = '36px';
        ringRef.current.style.borderColor = 'rgba(255,255,255,0.4)';
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        style={{ transition: 'transform 0.15s ease' }}
        className="fixed top-0 left-0 w-2 h-2 bg-accent rounded-full pointer-events-none z-100 -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block" 
      />
      <div 
        ref={ringRef} 
        style={{ transition: 'transform 0.25s ease, width 0.25s, height 0.25s' }}
        className="fixed top-0 left-0 w-9 h-9 border border-white/40 rounded-full pointer-events-none z-[99] -translate-x-1/2 -translate-y-1/2 hidden md:block" 
      />
    </>
  );
}

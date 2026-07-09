import React, { useRef, useEffect } from 'react';

export default function AmbientParticles({ scrollPercent }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      
      // Calculate responsive counts based on screen size (target counts are for ~1080p)
      const scaleFactor = (width * height) / (1920 * 1080);
      const numTiny = Math.floor(450 * scaleFactor);
      const numSoft = Math.floor(150 * scaleFactor);
      const numBokeh = Math.floor(20 * scaleFactor);

      const addParticle = (type) => {
        let radius, blur, depth, opacityBase, opacityRange, color, stretch;
        
        if (type === 'tiny') {
          // Layer 1 - Tiny Dust (70%)
          radius = 0.5 + Math.random() * 1.5; // 0.5 to 2
          blur = 0;
          depth = Math.random() * 0.2;
          opacityBase = 0.08;
          opacityRange = 0.10; // 0.08 to 0.18
          color = '255, 246, 229'; // #FFF6E5 Warm white
          stretch = 1 + Math.random() * 0.2; // Slightly irregular
        } else if (type === 'soft') {
          // Layer 2 - Soft Dust (25%)
          radius = 1.0 + Math.random() * 1.5; // Will be scaled up
          blur = 2 + Math.random() * 2;
          depth = 0.3 + Math.random() * 0.4;
          opacityBase = 0.15;
          opacityRange = 0.20; // 0.15 to 0.35
          color = '255, 208, 138'; // Soft warm amber
          stretch = 1 + Math.random() * 0.5; // More irregular
        } else {
          // Layer 3 - Cinematic Bokeh (5%)
          radius = 4.0 + Math.random() * 6.0; // 8 to 20 total size
          blur = 10 + Math.random() * 10;
          depth = 0.8 + Math.random() * 0.2;
          opacityBase = 0.05;
          opacityRange = 0.07; // 0.05 to 0.12
          color = '255, 218, 168'; // Warm orange/cream
          stretch = 1 + Math.random() * 0.4;
        }

        particles.push({
          type,
          x: Math.random() * width,
          y: Math.random() * height,
          originX: Math.random() * width,
          originY: Math.random() * height,
          radius,
          baseRadius: radius,
          stretch,
          color,
          depth,
          blur,
          opacityBase,
          opacityRange,
          // Frequencies for pseudo-noise movement
          noiseX1: Math.random() * 1000,
          noiseX2: Math.random() * 1000,
          noiseY1: Math.random() * 1000,
          noiseY2: Math.random() * 1000,
          // Base drift speeds
          driftX: (Math.random() - 0.5) * 0.1 * (1 + depth),
          driftY: (Math.random() - 0.5) * 0.1 * (1 + depth),
          // Pulsing
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.002 + Math.random() * 0.005,
          breathingOffset: Math.random() * Math.PI * 2,
          breathingSpeed: 0.005 + Math.random() * 0.01,
        });
      };

      for (let i = 0; i < numTiny; i++) addParticle('tiny');
      for (let i = 0; i < numSoft; i++) addParticle('soft');
      for (let i = 0; i < numBokeh; i++) addParticle('bokeh');
    };

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Continuous drift
        p.originX += p.driftX;
        p.originY += p.driftY;

        // Wrap around seamlessly
        if (p.originX < -100) p.originX = width + 100;
        if (p.originX > width + 100) p.originX = -100;
        if (p.originY < -100) p.originY = height + 100;
        if (p.originY > height + 100) p.originY = -100;

        // Pseudo-Simplex Noise via stacked incommensurable sine waves
        // This creates highly organic, non-repeating curved paths
        const t = time * 0.002;
        const noiseX = Math.sin(t + p.noiseX1) * Math.cos(t * 0.8 + p.noiseX2) * 30 * (1 + p.depth);
        const noiseY = Math.cos(t + p.noiseY1) * Math.sin(t * 0.9 + p.noiseY2) * 30 * (1 + p.depth);
        
        // Scroll Parallax + Mouse Parallax
        const scrollOffset = (scrollPercent || 0) * height * 1.2;
        const parallaxX = (mouse.x - width / 2) * (p.depth * 0.03);
        const parallaxY = ((mouse.y - height / 2) * (p.depth * 0.03)) - (scrollOffset * p.depth);

        p.x = p.originX + noiseX + parallaxX;
        p.y = p.originY + noiseY + parallaxY;

        // Organic opacity pulsing
        const alphaPhase = Math.sin(time * p.pulseSpeed + p.pulseOffset);
        const normAlpha = (alphaPhase + 1) / 2; // 0 to 1
        const opacity = p.opacityBase + (normAlpha * p.opacityRange);

        // Breathing (scale)
        const scalePhase = Math.sin(time * p.breathingSpeed + p.breathingOffset);
        const normScale = (scalePhase + 1) / 2;
        const currentRadius = p.baseRadius * (0.85 + normScale * 0.3);

        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Slight rotation for irregular shapes
        ctx.rotate(time * 0.001 + p.noiseX1);
        
        // Stretch context slightly to avoid perfect circles and make it look like organic dust
        ctx.scale(p.stretch, 1);

        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        
        if (p.type === 'bokeh') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = p.blur;
          ctx.shadowColor = `rgba(${p.color}, ${opacity})`;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          if (p.blur > 0) {
            ctx.shadowBlur = p.blur;
            ctx.shadowColor = `rgba(${p.color}, ${opacity})`;
          } else {
            ctx.shadowBlur = 0;
          }
        }

        ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollPercent]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
    />
  );
}

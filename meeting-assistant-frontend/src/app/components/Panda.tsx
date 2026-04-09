'use client';

import { useEffect, useState } from 'react';

interface PandaProps {
  success?: boolean; // happy if true
  className?: string; // optional CSS class for styling/positioning
}

export default function Panda({ success = false, className = '' }: PandaProps) {
  const [blink, setBlink] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Ensure window-dependent code runs only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blink every 3-5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // Track mouse position only if mounted
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  // Calculate pupil position based on mouse
  const calcPupil = () => {
    if (!mounted) return { transform: 'translate(0px, 0px)' };
    const offsetX = (mousePos.x / window.innerWidth - 0.5) * 6;
    const offsetY = (mousePos.y / window.innerHeight - 0.5) * 6;
    return { transform: `translate(${offsetX}px, ${offsetY}px)` };
  };

  if (!mounted) return null; // Don't render until client

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Ears */}
      <div className="absolute top-0 left-2 w-6 h-6 bg-black rounded-full"></div>
      <div className="absolute top-0 right-2 w-6 h-6 bg-black rounded-full"></div>

      {/* Face */}
      <div className="relative bg-white w-full h-full rounded-full flex items-center justify-center">
        {/* Blush */}
        {success && (
          <>
            <div className="absolute bottom-4 left-6 w-3 h-3 bg-pink-400 rounded-full opacity-80"></div>
            <div className="absolute bottom-4 right-6 w-3 h-3 bg-pink-400 rounded-full opacity-80"></div>
          </>
        )}

        {/* Eyes */}
        <div className="absolute flex justify-between w-2/3 top-1/3">
          {/* Left Eye */}
          <div className="relative w-6 h-6 bg-black rounded-full overflow-hidden">
            <div
              className="absolute w-3 h-3 bg-white rounded-full top-1.5 left-1.5 transition-transform duration-100"
              style={calcPupil()}
            ></div>
          </div>

          {/* Right Eye */}
          <div className="relative w-6 h-6 bg-black rounded-full overflow-hidden">
            <div
              className="absolute w-3 h-3 bg-white rounded-full top-1.5 left-1.5 transition-transform duration-100"
              style={calcPupil()}
            ></div>
          </div>
        </div>

        {/* Eyelid (blink) */}
        {blink && <div className="absolute w-1/2 h-2 bg-white top-1/3 left-1/4 rounded-full"></div>}

        {/* Nose */}
        <div className="absolute w-2 h-2 bg-black rounded-full bottom-1/3"></div>

        {/* Mouth */}
        <div
          className={`absolute w-6 h-2 bottom-10 left-1/2 transform -translate-x-1/2 border-b-2 rounded-b-full ${
            success ? 'border-pink-400' : 'border-black'
          }`}
        ></div>
      </div>
    </div>
  );
}

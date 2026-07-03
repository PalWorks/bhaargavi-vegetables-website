import React, { useEffect, useRef, useState } from 'react';

const ScrollVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);

  useEffect(() => {
    // Check for slow connection or data saver to prevent loading 10MB video
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.saveData === true || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
        setShouldLoadVideo(false);
        return; // Skip animation loop
      }
    }

    let animationFrameId: number;
    let targetFraction = 0;
    let currentFraction = 0;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
      }
    };

    const renderLoop = () => {
      // Lerp (smooth interpolation) from current to target
      currentFraction += (targetFraction - currentFraction) * 0.08;

      if (videoRef.current && videoRef.current.duration) {
        const targetTime = videoRef.current.duration * currentFraction;
        // Only update if difference is noticeable, to prevent micro-stutters
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
          videoRef.current.currentTime = targetTime;
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start loop and initial position
    handleScroll();
    renderLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-cover bg-center transition-opacity duration-1000"
      style={{ backgroundImage: "url('/hero-poster.jpg')" }}
    >
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video-smooth.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default ScrollVideoBackground;

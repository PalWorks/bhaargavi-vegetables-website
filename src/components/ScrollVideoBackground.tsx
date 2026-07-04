import React, { useEffect, useRef, useState } from 'react';

const ScrollVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Check for slow connection or data saver to prevent loading 10MB video
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.saveData === true || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
        setShouldLoadVideo(false);
        return; // Skip animation loop
      }
    }
    
    // Force metadata load and unlock video for strict browsers / incognito mode
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          videoRef.current?.pause();
        }).catch(() => {
          // Play might be rejected, but the attempt forces metadata to load
        });
      }
    }

    let animationFrameId: number;
    let targetFraction = 0;
    let currentFraction = 0;
    let hasSetInitialFrame = false;

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

      if (videoRef.current && !Number.isNaN(videoRef.current.duration)) {
        const targetTime = videoRef.current.duration * currentFraction;
        // Only update if difference is noticeable, to prevent micro-stutters
        // Also force exactly once to ensure the first frame is painted
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05 || !hasSetInitialFrame) {
          videoRef.current.currentTime = targetTime || 0.001;
          hasSetInitialFrame = true;
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
          disablePictureInPicture
          disableRemotePlayback
          onCanPlay={() => setIsVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/hero-video-smooth.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default ScrollVideoBackground;

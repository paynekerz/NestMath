import { useState, useEffect, useRef } from 'react';

export function HeroVideo() {
  const [isLight, setIsLight] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLight(document.documentElement.dataset.theme === 'light');

    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.dataset.theme === 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRef.current?.load();
  }, [isLight]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          mixBlendMode: isLight ? 'multiply' : 'screen',
          opacity: isLight ? 0.85 : 0.65,
        }}
      >
        <source src={isLight ? '/hero-bg-light.mp4' : '/hero-bg.mp4'} type="video/mp4" />
      </video>
    </div>
  );
}

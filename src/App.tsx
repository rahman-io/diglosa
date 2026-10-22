import React, { useEffect, useRef } from 'react';

export const App: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Automatically focus the game iframe so keyboard controls work immediately
    const handleFocus = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.focus();
      }
    };

    handleFocus();
    window.addEventListener('click', handleFocus);
    window.addEventListener('keydown', handleFocus);

    return () => {
      window.removeEventListener('click', handleFocus);
      window.removeEventListener('keydown', handleFocus);
    };
  }, []);

  return (
    <main className="fixed inset-0 w-full h-full bg-[#11051f] overflow-hidden select-none m-0 p-0 border-0">
      <iframe
        ref={iframeRef}
        id="diglosa-game"
        src="/diglosa.html"
        title="Diglosa: Petualangan Kata"
        className="w-full h-full border-0 block fixed inset-0 m-0 p-0"
        allow="autoplay; fullscreen; microphone; clipboard-write"
      />
    </main>
  );
};

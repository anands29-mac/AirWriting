import React, { useEffect } from 'react';
import './css/CanvasArea.css';

export default function CanvasArea({ 
  theme, 
  canvasRef, 
  overlayRef, 
  selectedNote, 
  showOverlay 
}) {
  // Set canvas background based on theme
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set background color based on theme
      if (theme === 'dark') {
        canvas.style.background = '#2d2d2d';
      } else {
        canvas.style.background = '#ffffff';
      }
    }
  }, [theme, canvasRef]);

  return (
    <div className={`canvas-area ${theme}`}>
      <canvas 
        ref={canvasRef}
        className={`main-canvas ${theme}`}
        width={720}
        height={540}
      />
      {showOverlay && (
        <canvas 
          ref={overlayRef}
          className="overlay-canvas"
          width={720}
          height={540}
        />
      )}
      
      {!selectedNote && (
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <h2>Welcome to AirWrite</h2>
            <p>Create a new note or select an existing one to start drawing with hand gestures</p>
            <div className="placeholder-hint">
              <span>✋</span>
              <p>Use pinch gestures to draw in the air</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
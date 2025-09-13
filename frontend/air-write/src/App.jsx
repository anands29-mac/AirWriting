import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WebcamView from './components/WebcamView';
import CanvasArea from './components/CanvasArea';
import StatusBar from './components/StatusBar';
import './App.css';

export default function App() {
  // Theme and UI state
  const [theme, setTheme] = useState('light');
  const [showWebcam, setShowWebcam] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Notes management
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Hand tracking state (your original code)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const currentStroke = useRef([]);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const emaPos = useRef({ x: 0, y: 0, z: 0 });

  // MediaPipe initialization (your original code)
  useEffect(() => {
    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });
    hands.onResults(onResults);
    handsRef.current = hands;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        await hands.send({ image: videoEl });
      },
      width: 720,
      height: 540,
    });
    cameraRef.current = camera;

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  // Your original functions
  function start() {
    cameraRef.current?.start();
    setRunning(true);
  }

  function stop() {
    cameraRef.current?.stop();
    setRunning(false);
  }

  function clearCanvas() {
    if (!canvasRef.current || !overlayRef.current) return;
    
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    currentStroke.current = [];
    setStrokes([]);
    
    const o = overlayRef.current;
    const octx = o.getContext('2d');
    octx.clearRect(0, 0, o.width, o.height);
    
    // Update selected note stroke count
    if (selectedNote) {
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id 
          ? { ...note, strokes: 0, lastModified: new Date().toLocaleDateString() }
          : note
      ));
    }
  }

  function exportImage() {
    const c = canvasRef.current;
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote?.title || 'airwrite'}.png`;
    a.click();
  }

  function distance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2);
  }

  function onResults(results) {
    const overlay = overlayRef.current;
    const octx = overlay.getContext('2d');
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      if (showOverlay) {
        drawConnectors(octx, landmarks, Hands.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(octx, landmarks, { color: '#FF0000', lineWidth: 1 });
      }

      const tip = landmarks[8];
      const rawX = tip.x * overlay.width;
      const rawY = tip.y * overlay.height;
      const rawZ = tip.z || 0;

      const alpha = 0.1;
      emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y;
      emaPos.current.z = alpha * rawZ + (1 - alpha) * emaPos.current.z;

      const x = emaPos.current.x;
      const y = emaPos.current.y;

      const isPinched = (distance(landmarks[8], landmarks[4]) < 0.04);
      const isDown = isPinched;

      if (showOverlay) {
        octx.fillStyle = 'rgba(255,0,0,0.8)';
        octx.beginPath(); 
        octx.arc(x, y, 6, 0, Math.PI * 2); 
        octx.fill();
      }

      if (isDown && selectedNote) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cx = 720 - x;
        const cy = y;
        
        if (currentStroke.current.length === 0) {
          currentStroke.current.push({ x: cx, y: cy });
        } else {
          const last = currentStroke.current[currentStroke.current.length - 1];
          ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          currentStroke.current.push({ x: cx, y: cy });
        }
      } else {
        if (currentStroke.current.length > 0) {
          const newStrokes = [...strokes, currentStroke.current.slice()];
          setStrokes(newStrokes);
          currentStroke.current = [];
          
          // Update note stroke count
          if (selectedNote) {
            setNotes(prev => prev.map(note => 
              note.id === selectedNote.id 
                ? { ...note, strokes: newStrokes.length, lastModified: new Date().toLocaleDateString() }
                : note
            ));
          }
        }
      }
    } else {
      if (currentStroke.current.length > 0) {
        const newStrokes = [...strokes, currentStroke.current.slice()];
        setStrokes(newStrokes);
        currentStroke.current = [];
        
        if (selectedNote) {
          setNotes(prev => prev.map(note => 
            note.id === selectedNote.id 
              ? { ...note, strokes: newStrokes.length, lastModified: new Date().toLocaleDateString() }
              : note
          ));
        }
      }
    }
  }

  // Canvas resize effect
  useEffect(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    const o = overlayRef.current;
    if (!v || !c || !o) return;
    v.width = 720; v.height = 540;
    c.width = 720; c.height = 540;
    o.width = 720; o.height = 540;
  }, []);

  // Theme and UI handlers
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleRunning = () => {
    running ? stop() : start();
  };

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      strokes: 0,
      lastModified: new Date().toLocaleDateString(),
      canvasData: null
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    // Clear canvas for new note
    clearCanvas();
  };

  const handleSelectNote = (note) => {
    if (selectedNote?.id !== note.id) {
      // Save current canvas state if needed
      setSelectedNote(note);
      clearCanvas(); // Clear for now, you can implement canvas state saving later
      setStrokes([]); // Reset strokes for new note
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      clearCanvas();
    }
  };

  return (
    <div className={`app ${theme}`}>
      <Navbar 
        running={running}
        onToggleRunning={handleToggleRunning}
        onClearCanvas={clearCanvas}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onExport={exportImage}
        selectedNote={selectedNote}
      />
      
      <div className="app-layout">
        <Sidebar 
          theme={theme}
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
        
        <main className={`main-content ${theme}`}>
          <WebcamView 
            theme={theme}
            videoRef={videoRef}
            showWebcam={showWebcam}
            onToggleWebcam={() => setShowWebcam(prev => !prev)}
            showOverlay={showOverlay}
            onToggleOverlay={() => setShowOverlay(prev => !prev)}
            running={running}
          />
          
          <CanvasArea 
            theme={theme}
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            selectedNote={selectedNote}
            showOverlay={showOverlay}
          />
          
          <StatusBar 
            theme={theme}
            running={running}
            selectedNote={selectedNote}
            strokes={strokes}
            currentStroke={currentStroke}
            showWebcam={showWebcam}
            onToggleWebcam={() => setShowWebcam(prev => !prev)}
          />
        </main>
      </div>
    </div>
  );
}
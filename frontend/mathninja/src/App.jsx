import React, { useEffect, useRef, useState, useCallback } from 'react';

// Game Components
function LoginScreen({ onLogin, theme }) {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className={`login-screen ${theme}`}>
      <div className="login-container">
        <h1 className="game-title">🥷 Math Fruit Ninja</h1>
        <p className="game-subtitle">Cut the right answers with your hands!</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            autoFocus
          />
          <button type="submit" className="login-btn">
            Start Game 🎮
          </button>
        </form>
      </div>
    </div>
  );
}

function GameScreen({ 
  videoRef, 
  overlayRef, 
  running, 
  onToggleRunning, 
  gameState, 
  onCutFruit,
  theme,
  currentProblem,
  score,
  lives,
  timeLeft,
  onBackToMenu,
  slashEffects,
  showWebcam,
  onToggleWebcam
}) {
  return (
    <div className={`game-screen ${theme}`}>
      {/* Game Header */}
      <div className="game-header">
        <div className="game-stats">
          <span className="stat">Score: {score}</span>
          <span className="stat">Lives: {'❤️'.repeat(lives)}</span>
          <span className="stat">Time: {timeLeft}s</span>
        </div>
        <button className="back-btn" onClick={onBackToMenu}>
          ← Menu
        </button>
      </div>

      <div className="game-layout">
        {/* Left Panel - Webcam Toggle & Math Problem */}
        <div className="problem-panel">
          {/* Webcam Toggle Section */}
          <div className="webcam-section">
            <div className="webcam-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showWebcam}
                  onChange={onToggleWebcam}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider"></span>
                Show Webcam
              </label>
            </div>
            
            {showWebcam && (
              <div className="webcam-container">
                <video 
                  ref={videoRef} 
                  className="webcam-display"
                  playsInline
                  muted
                />
                <canvas 
                  ref={overlayRef}
                  className="webcam-overlay"
                  width="200"
                  height="150"
                />
              </div>
            )}
          </div>

          <h2>Solve This:</h2>
          <div className="math-problem">
            {currentProblem ? (
              <span className="problem-text">{currentProblem.question} = ?</span>
            ) : (
              <span className="problem-text">Loading...</span>
            )}
          </div>
          <div className="instructions">
            <p>✋ Use hand gestures to cut the fruit with the correct answer!</p>
            <button 
              className={`tracking-btn ${running ? 'stop' : 'start'}`}
              onClick={onToggleRunning}
            >
              {running ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="game-area">
          {/* Background Image */}
          <div className="game-background" style={{
            backgroundImage: `url('../../download.jpg')`
          }}></div>
          
          {/* Hidden video for hand tracking */}
          {!showWebcam && (
            <video 
              ref={videoRef} 
              className="game-video-hidden"
              playsInline
              muted
            />
          )}
          
          {/* Game canvas for hand tracking visualization */}
          <canvas 
            ref={overlayRef}
            className="game-canvas"
            width="800"
            height="600"
          />
          
          {/* Slash Effects */}
          {slashEffects.map(slash => (
            <div
              key={slash.id}
              className="slash-effect"
              style={{
                left: `${slash.x}px`,
                top: `${slash.y}px`,
              }}
            >
              <div 
                className="slash-line"
                style={{
                  width: `${slash.width}px`,
                  transform: `rotate(${slash.rotation}deg)`
                }}
              />
            </div>
          ))}
          
          {/* Falling Fruits */}
          <div className="fruits-container">
            {gameState.fruits.map(fruit => (
              <div
                key={fruit.id}
                className={`fruit ${fruit.type} ${fruit.cut ? 'cut' : ''}`}
                style={{
                  left: `${fruit.x}px`,
                  top: `${fruit.y}px`,
                  transform: `rotate(${fruit.rotation}deg)`
                }}
                onClick={() => onCutFruit(fruit.id)}
              >
                {/* Fruit Image */}
                <div 
                  className="fruit-image"
                  style={{
                    backgroundImage: `url('../../${fruit.type}.png')`
                  }}
                ></div>
                <span className="fruit-number">{fruit.number}</span>
                
                {/* Fruit pieces for breaking effect */}
                {fruit.cut && (
                  <>
                    <div className="fruit-piece piece-1"></div>
                    <div className="fruit-piece piece-2"></div>
                    <div className="fruit-piece piece-3"></div>
                    <div className="fruit-piece piece-4"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuScreen({ onStartGame, onShowLeaderboard, theme, username }) {
  return (
    <div className={`menu-screen ${theme}`}>
      <div className="menu-container">
        <h1 className="game-title">🥷 Math Fruit Ninja</h1>
        <p className="welcome-text">Welcome back, {username}!</p>
        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={onStartGame}>
            🎮 Start Game
          </button>
          <button className="menu-btn secondary" onClick={onShowLeaderboard}>
            🏆 Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaderboardScreen({ onBack, theme, scores }) {
  return (
    <div className={`leaderboard-screen ${theme}`}>
      <div className="leaderboard-container">
        <h1>🏆 Leaderboard</h1>
        <div className="scores-list">
          {scores.length === 0 ? (
            <p className="no-scores">No scores yet! Be the first to play!</p>
          ) : (
            scores.map((score, index) => (
              <div key={index} className="score-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{score.username}</span>
                <span className="points">{score.score}</span>
              </div>
            ))
          )}
        </div>
        <button className="back-btn" onClick={onBack}>← Back to Menu</button>
      </div>
    </div>
  );
}

function GameOverScreen({ score, onRestart, onBackToMenu, theme, isNewHighScore }) {
  return (
    <div className={`game-over-screen ${theme}`}>
      <div className="game-over-container">
        <h1>Game Over!</h1>
        {isNewHighScore && <p className="new-high-score">🎉 New High Score!</p>}
        <p className="final-score">Final Score: {score}</p>
        <div className="game-over-buttons">
          <button className="game-over-btn primary" onClick={onRestart}>
            🔄 Play Again
          </button>
          <button className="game-over-btn secondary" onClick={onBackToMenu}>
            📋 Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function MathFruitNinja() {
  // Game state management
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('light');
  const [scores, setScores] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [flash, setFlash] = useState(null);

  // Game mechanics
  const [gameState, setGameState] = useState({
    fruits: [],
    score: 0,
    lives: 3,
    level: 1,
    timeLeft: 60
  });
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameTimer, setGameTimer] = useState(null);
  const [fruitSpawnTimer, setFruitSpawnTimer] = useState(null);
  const [slashEffects, setSlashEffects] = useState([]);

  // Hand tracking
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const emaPos = useRef({ x: 0, y: 0 });
  const tracingPath = useRef([]);

  // Load MediaPipe scripts
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // Load MediaPipe scripts
        if (!window.Hands) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        if (!window.Camera) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        console.info('[MathFruitNinja] MediaPipe scripts loaded');
        setHandsLoaded(true);
      } catch (error) {
        console.error('Failed to load MediaPipe:', error);
      }
    };
    
    loadMediaPipe();
  }, []);

  // Math problems generator
  const generateProblem = useCallback(() => {
    const operations = ['+', '-', '*', '/', 'decimal', 'algebra'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer, question;

    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
        question = `${a} + ${b}`;
        break;

      case '-':
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * a); // ensure non-negative result
        answer = a - b;
        question = `${a} - ${b}`;
        break;

      case '*':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        question = `${a} × ${b}`;
        break;

      case '/':
        b = Math.floor(Math.random() * 12) + 1; // divisor
        answer = Math.floor(Math.random() * 12) + 1; // quotient
        a = b * answer; // dividend = divisor × quotient
        question = `${a} ÷ ${b}`;
        break;

      case 'decimal':
        a = (Math.random() * 20).toFixed(1);
        b = (Math.random() * 20).toFixed(1);
        answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
        question = `${a} + ${b}`;
        break;

      case 'algebra':
        // Form: x + b = c
        b = Math.floor(Math.random() * 20) + 1;
        answer = Math.floor(Math.random() * 20) + 1; // x value
        a = answer + b; // result
        question = `x + ${b} = ${a}`;
        break;

      default:
        a = 5;
        b = 3;
        answer = 8;
        question = `${a} + ${b}`;
    }

    return { question, answer };
  }, []);

  // Fruit generation
  const spawnFruit = useCallback(() => {
    if (!currentProblem) return;

    const fruitTypes = ['Apple', 'Pomegranate', 'Pineapple', 'Watermelon'];
    const isCorrectAnswer = Math.random() < 0.3;

    const baseAnswer = Number(currentProblem.answer);
    const isDecimal = !Number.isInteger(baseAnswer);

    let number;
    if (isCorrectAnswer) {
      number = baseAnswer;
    } else {
      // Generate a wrong candidate that is not equal to the correct answer.
      let candidate;
      let attempts = 0;
      do {
        attempts++;
        // offset from -10..10 but avoid 0
        let offset = Math.floor(Math.random() * 21) - 10;
        if (offset === 0) offset = 5;

        candidate = baseAnswer + offset;

        // If candidate ended up < 1, try to make it reasonably positive instead of clamping to 1
        if (candidate < 1) {
          // push it positive so it doesn't collapse to the correct 1 when baseAnswer is small
          candidate = baseAnswer + Math.abs(offset) + 1;
        }

        // round / format for decimals
        if (isDecimal) {
          candidate = Number(candidate.toFixed(1));
        } else {
          candidate = Math.round(candidate);
        }

        // safety break: avoid infinite loop
        if (attempts > 12 && candidate === baseAnswer) {
          candidate = isDecimal ? Number((baseAnswer + 1).toFixed(1)) : baseAnswer + 1;
        }
      } while (candidate === baseAnswer);

      number = candidate;
    }

    // Randomize fruit speed: 60% normal (2-4), 40% fast (4-6)
    let speed;
    if (Math.random() < 0.4) {
      speed = 4 + Math.random() * 2; // fast: 4-6
    } else {
      speed = 2 + Math.random() * 2; // normal: 2-4
    }

    const newFruit = {
      id: Date.now() + Math.random(),
      x: Math.random() * 600,
      y: -80,
      number,
      type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
      isCorrect: isCorrectAnswer,
      cut: false,
      rotation: Math.random() * 360,
      speed
    };

    setGameState(prev => ({
      ...prev,
      fruits: [...prev.fruits, newFruit]
    }));
  }, [currentProblem]);


  // Initialize MediaPipe AND auto-start camera when entering the game screen
  useEffect(() => {
    // We only initialize/auto-start when MediaPipe is loaded AND player is on the game screen
    if (!handsLoaded || !window.Hands || !window.Camera) return;
    if (currentScreen !== 'game') return;
    if (cameraRef.current) return; // already created

    console.info('[MathFruitNinja] Initializing Hands + Camera');

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });
    
    // register callback (onResults is declared later in file and hoisted)
    hands.onResults(onResults);
    handsRef.current = hands;

    const videoEl = videoRef.current;
    const overlay = overlayRef.current;
    if (!videoEl) {
      console.warn('[MathFruitNinja] video element not ready');
      return;
    }

    // create camera; don't gate frames by `running` here, control start/stop via camera.start/stop
    const camera = new window.Camera(videoEl, {
      onFrame: async () => {
        try {
          await hands.send({ image: videoEl });
        } catch (error) {
          console.error('[MathFruitNinja] hands.send error', error);
        }
      },
      width: showWebcam ? 200 : 800,
      height: showWebcam ? 150 : 600,
    });
    cameraRef.current = camera;

    // Try to start immediately. This triggers getUserMedia prompt. If user denies, we'll see an error in console.
    (async () => {
      try {
        // ensure the video element allows autoplay and won't be blocked
        videoEl.playsInline = true;
        videoEl.muted = true;

        await camera.start();
        console.info('[MathFruitNinja] Camera started');
        setRunning(true);

        // resize overlay canvas to match actual video resolution if possible
        const vw = showWebcam ? 200 : (videoEl.videoWidth || 800);
        const vh = showWebcam ? 150 : (videoEl.videoHeight || 600);
        if (overlay) {
          overlay.width = vw;
          overlay.height = vh;
          overlay.style.width = `${vw}px`;
          overlay.style.height = `${vh}px`;
        }
      } catch (error) {
        console.error('[MathFruitNinja] Failed to start camera', error);
      }
    })();

    return () => {
      try {
        if (cameraRef.current && cameraRef.current.stop) {
          cameraRef.current.stop();
        }
      } catch (e) {
        console.warn('[MathFruitNinja] camera stop error', e);
      }

      try {
        if (handsRef.current && handsRef.current.close) {
          handsRef.current.close();
        }
      } catch (e) {
        console.warn('[MathFruitNinja] hands close error', e);
      }

      cameraRef.current = null;
      handsRef.current = null;
      setRunning(false);
      tracingPath.current = [];
      console.info('[MathFruitNinja] Camera + Hands cleaned up');
    };
  }, [handsLoaded, currentScreen, showWebcam]);

  // Hand tracking results
  function onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
    const landmarks = results.multiHandLandmarks[0];
    const tip = landmarks[8];

    if (showWebcam) {
      const overlay = document.querySelector('.webcam-overlay');
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Draw skeleton overlaying the webcam
      drawHandSkeleton(ctx, landmarks, overlay.width, overlay.height);

      // Convert tip coordinates to game area (800x600)
      const rawX = (1 - tip.x) * 800;
      const rawY = tip.y * 600;

      // Apply smoothing (same as fullscreen mode)
      const alpha = 0.3;
      emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y;

      // Use smoothed coordinates
      checkFruitCollisions(emaPos.current.x, emaPos.current.y);
      drawTrackingOnGameCanvas(emaPos.current.x, emaPos.current.y);
    } else {
      // Fullscreen mode → use the main game canvas
      if (!overlayRef.current) return;
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

      // Convert tip coordinates to match game canvas size
      const gameX = (1 - tip.x) * overlayRef.current.width;
      const gameY = tip.y * overlayRef.current.height;

      // Smooth finger position
      const alpha = 0.3;
      emaPos.current.x = alpha * gameX + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * gameY + (1 - alpha) * emaPos.current.y;

      // Add to tracing path
      tracingPath.current.push({
        x: emaPos.current.x,
        y: emaPos.current.y,
        timestamp: Date.now()
      });

      // Keep only the last 1 second of points
      const now = Date.now();
      tracingPath.current = tracingPath.current.filter(
        point => now - point.timestamp < 1000
      );

      // Draw slash trail
      if (tracingPath.current.length > 1) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.8;

        ctx.beginPath();
        ctx.moveTo(tracingPath.current[0].x, tracingPath.current[0].y);

        for (let i = 1; i < tracingPath.current.length; i++) {
          const point = tracingPath.current[i];
          const age = (now - point.timestamp) / 1000;
          ctx.globalAlpha = Math.max(0.1, 0.8 - age);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        }
      }

      // Draw fingertip marker
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(emaPos.current.x, emaPos.current.y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(emaPos.current.x, emaPos.current.y, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Check fruit collisions
      checkFruitCollisions(emaPos.current.x, emaPos.current.y);
    }
  }


  // Draw tracking elements on the main game canvas when webcam is shown
  function drawTrackingOnGameCanvas(gameX, gameY) {
    // Find the main game canvas (we need to create a separate canvas overlay for the main game area)
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    let mainCanvas = gameArea.querySelector('.main-tracking-canvas');
    if (!mainCanvas) {
      mainCanvas = document.createElement('canvas');
      mainCanvas.className = 'main-tracking-canvas';
      mainCanvas.width = 800;
      mainCanvas.height = 600;
      mainCanvas.style.position = 'absolute';
      mainCanvas.style.top = '0';
      mainCanvas.style.left = '0';
      mainCanvas.style.pointerEvents = 'none';
      mainCanvas.style.zIndex = '15';
      gameArea.appendChild(mainCanvas);
    }
    
    const ctx = mainCanvas.getContext('2d');
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Add current position to tracing path
    tracingPath.current.push({ 
      x: gameX, 
      y: gameY, 
      timestamp: Date.now() 
    });
    
    // Keep only recent points (last 1 second)
    const now = Date.now();
    tracingPath.current = tracingPath.current.filter(point => now - point.timestamp < 1000);

    // Draw tracing line
    if (tracingPath.current.length > 1) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      ctx.moveTo(tracingPath.current[0].x, tracingPath.current[0].y);
      
      for (let i = 1; i < tracingPath.current.length; i++) {
        const point = tracingPath.current[i];
        // Fade older points
        const age = (now - point.timestamp) / 1000;
        ctx.globalAlpha = Math.max(0.1, 0.8 - age);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    }

    // Draw current finger position
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(gameX, gameY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(gameX, gameY, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Draw hand skeleton
  function drawHandSkeleton(ctx, landmarks, width, height) {
    ctx.save();
    ctx.scale(-1, 1);            // flip horizontally
    ctx.translate(-width, 0);    // shift back into view

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index finger
      [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
      [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
      [0, 17], [17, 18], [18, 19], [19, 20], // pinky
      [5, 9], [9, 13], [13, 17] // palm connections
    ];

    // Draw connections (green)
    ctx.strokeStyle = '#00FF00'; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      const s = landmarks[start];
      const e = landmarks[end];
      ctx.moveTo(s.x * width, s.y * height);
      ctx.lineTo(e.x * width, e.y * height);
    });
    ctx.stroke();

    // Draw landmarks (yellow)
    ctx.fillStyle = '#FFFF00'; 
    landmarks.forEach(lm => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }


  // Create slash effect
  const createSlashEffect = (x, y) => {
    const slashId = Date.now() + Math.random();
    const angle = Math.random() * 360;
    const length = 80 + Math.random() * 40;
    
    const newSlash = {
      id: slashId,
      x: x - length / 2,
      y: y - 2,
      width: length,
      rotation: angle
    };
    
    setSlashEffects(prev => [...prev, newSlash]);
    
    // Create sparks
    for (let i = 0; i < 6; i++) {
      const sparkId = Date.now() + Math.random() + i;
      const sparkAngle = (Math.random() * 360) * Math.PI / 180;
      const sparkDistance = 30 + Math.random() * 30;
      const sparkX = Math.cos(sparkAngle) * sparkDistance;
      const sparkY = Math.sin(sparkAngle) * sparkDistance;
      
      const spark = {
        id: sparkId,
        x: x - 3,
        y: y - 3,
        sparkX,
        sparkY
      };
      
      setTimeout(() => {
        const sparkElement = document.createElement('div');
        sparkElement.className = 'slash-sparks';
        sparkElement.style.left = spark.x + 'px';
        sparkElement.style.top = spark.y + 'px';
        sparkElement.style.setProperty('--spark-x', spark.sparkX + 'px');
        sparkElement.style.setProperty('--spark-y', spark.sparkY + 'px');
        
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
          gameArea.appendChild(sparkElement);
          setTimeout(() => sparkElement.remove(), 400);
        }
      }, 50);
    }
    
    // Remove slash effect after animation
    setTimeout(() => {
      setSlashEffects(prev => prev.filter(s => s.id !== slashId));
    }, 300);
  };

  // Explosion effect when fruit is cut
  const createFruitExplosion = (x, y) => {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'fruit-explosion';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const angle = Math.random() * 2 * Math.PI;
      const distance = 50 + Math.random() * 50;
      particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      
      const gameArea = document.querySelector('.game-area');
      if (gameArea) {
        gameArea.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
      }
    }
  };

  // Fruit juice splash effect
  const createJuiceSplash = (x, y, fruitType) => {
    const colors = {
      apple: '#ff4b4b',
      orange: '#ffa500',
      banana: '#ffe135',
      watermelon: '#4caf50'
    };

    const splashColor = colors[fruitType] || '#FFD700';
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;

    for (let i = 0; i < 8; i++) {
      const splash = document.createElement('div');
      splash.className = 'juice-splash';
      splash.style.left = `${x}px`;
      splash.style.top = `${y}px`;
      splash.style.background = splashColor;

      // Random direction/size
      const angle = Math.random() * 2 * Math.PI;
      const distance = 60 + Math.random() * 40;
      splash.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      splash.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      splash.style.setProperty('--scale', 1 + Math.random() * 0.5);

      gameArea.appendChild(splash);
      setTimeout(() => splash.remove(), 600);
    }
  };

  // Check if hand position collides with fruits
  function checkFruitCollisions(handX, handY) {
    setGameState(prev => {
      let hasChanges = false;
      const updatedFruits = prev.fruits.map(fruit => {
        if (fruit.cut) return fruit;
        
        const distance = Math.sqrt(
          Math.pow(handX - (fruit.x + 40), 2) + 
          Math.pow(handY - (fruit.y + 40), 2)
        );
        
        if (distance < 50) {
          hasChanges = true;
          // Create slash effect at fruit position
          createSlashEffect(fruit.x + 40, fruit.y + 40);
          createFruitExplosion(fruit.x + 40, fruit.y + 40);
          createJuiceSplash(fruit.x + 40, fruit.y + 40, fruit.type);
          return { ...fruit, cut: true };
        }
        return fruit;
      });
      
      if (!hasChanges) return prev;
      
      const newlyCut = updatedFruits.filter(fruit => 
        fruit.cut && !prev.fruits.find(f => f.id === fruit.id)?.cut
      );
      
      let newScore = prev.score;
      let newLives = prev.lives;
      let shouldGenerateNewProblem = false;
      
      newlyCut.forEach(fruit => {
        if (fruit.isCorrect) {
          newScore += 10;
          shouldGenerateNewProblem = true;
          setFlash('positive');
          setTimeout(() => setFlash(null), 300);
        } else {
          newLives = Math.max(0, newLives - 1);
          setFlash('negative');
          setTimeout(() => setFlash(null), 300);
        }
      });
      
      if (shouldGenerateNewProblem) {
        setTimeout(() => setCurrentProblem(generateProblem()), 500);
      }
      
      return {
        ...prev,
        fruits: updatedFruits,
        score: newScore,
        lives: newLives
      };
    });
  }

  // Game loop - move fruits and check boundaries
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const updatedFruits = prev.fruits
          .map(fruit => ({
            ...fruit,
            y: fruit.y + fruit.speed,
            rotation: fruit.rotation + 2
          }))
          .filter(fruit => fruit.cut || fruit.y < 700);
        
        const missedFruits = prev.fruits.filter(fruit => 
          fruit.y >= 700 && !fruit.cut && fruit.isCorrect
        );
        
        let newLives = prev.lives;
        if (missedFruits.length > 0) {
          newLives = Math.max(0, prev.lives - missedFruits.length);
        }
        
        return {
          ...prev,
          fruits: updatedFruits,
          lives: newLives
        };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [currentScreen]);

  // Game timer
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1 || prev.lives <= 0) {
          setTimeout(endGame, 100);
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setGameTimer(timer);
    return () => clearInterval(timer);
  }, [currentScreen]);

  // Fruit spawning
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const spawnTimer = setInterval(() => {
      spawnFruit();
    }, 1200);

    setFruitSpawnTimer(spawnTimer);
    return () => clearInterval(spawnTimer);
  }, [currentScreen, spawnFruit]);

  // Hand tracking controls
  const startTracking = async () => {
    if (cameraRef.current && cameraRef.current.start) {
      try {
        await cameraRef.current.start();
        setRunning(true);
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    }
  };

  const stopTracking = () => {
    if (cameraRef.current && cameraRef.current.stop) {
      cameraRef.current.stop();
    }
    setRunning(false);
    tracingPath.current = [];
  };

  const toggleTracking = () => {
    running ? stopTracking() : startTracking();
  };

  const toggleWebcam = () => {
    setShowWebcam(prev => !prev);
  };

  // Game flow functions
  const handleLogin = (name) => {
    setUsername(name);
    setCurrentScreen('menu');
  };

  const startGame = () => {
    setGameState({
      fruits: [],
      score: 0,
      lives: 3,
      level: 1,
      timeLeft: 60
    });
    setCurrentProblem(generateProblem());
    setCurrentScreen('game');
    tracingPath.current = [];
  };

  const endGame = () => {
    const newScore = { username, score: gameState.score, date: new Date().toLocaleDateString() };
    const updatedScores = [...scores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setScores(updatedScores);
    
    if (gameTimer) clearInterval(gameTimer);
    if (fruitSpawnTimer) clearInterval(fruitSpawnTimer);
    
    stopTracking();
    setCurrentScreen('gameOver');
  };

  const cutFruit = (fruitId) => {
    // Find the fruit we clicked/tapped
    const fruit = gameState.fruits.find(f => f.id === fruitId);
    if (fruit) {
      const centerX = fruit.x + 40;
      const centerY = fruit.y + 40;

      // Show the slash & effects exactly at fruit center
      createSlashEffect(centerX, centerY);

      // Run the collision check at the fruit's center so the intended fruit is marked 'cut'
      checkFruitCollisions(centerX, centerY);
      return;
    }

    // fallback: if fruit couldn't be found, use center
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect();
      checkFruitCollisions(rect.width / 2, rect.height / 2);
    }
  };
  
  // Screen rendering
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} theme={theme} />;
      case 'menu':
        return (
          <MenuScreen 
            onStartGame={startGame}
            onShowLeaderboard={() => setCurrentScreen('leaderboard')}
            theme={theme}
            username={username}
          />
        );
      case 'game':
        return (
          <GameScreen
            videoRef={videoRef}
            overlayRef={overlayRef}
            running={running}
            onToggleRunning={toggleTracking}
            gameState={gameState}
            onCutFruit={cutFruit}
            theme={theme}
            currentProblem={currentProblem}
            score={gameState.score}
            lives={gameState.lives}
            timeLeft={gameState.timeLeft}
            onBackToMenu={() => {
              setCurrentScreen('menu');
              stopTracking();
            }}
            slashEffects={slashEffects}
            showWebcam={showWebcam}
            onToggleWebcam={toggleWebcam}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={() => setCurrentScreen('menu')}
            theme={theme}
            scores={scores}
          />
        );
      case 'gameOver':
        return (
          <GameOverScreen
            score={gameState.score}
            onRestart={startGame}
            onBackToMenu={() => setCurrentScreen('menu')}
            theme={theme}
            isNewHighScore={scores.length === 0 || gameState.score > Math.max(...scores.map(s => s.score))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .math-fruit-ninja {
          width: 100vw;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
          background-image: url('../../Background.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .math-fruit-ninja.light {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          background-image: url('../../Background.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .math-fruit-ninja.dark {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: #fff;
          background-image: url('../../Background.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-screen, .menu-screen, .leaderboard-screen, .game-over-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .login-container, .menu-container, .leaderboard-container, .game-over-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .dark .login-container, 
        .dark .menu-container, 
        .dark .leaderboard-container, 
        .dark .game-over-container {
          background: rgba(45, 55, 72, 0.95);
        }

        .game-title {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #41e259ff, #3d8effff, #943dd1ff, #fd79ebff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .game-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-input {
          padding: 1rem;
          font-size: 1.1rem;
          border: 2px solid #ddd;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s ease;
        }

        .login-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .login-btn, .menu-btn, .game-over-btn {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn, .menu-btn.primary, .game-over-btn.primary {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
        }

        .menu-btn.secondary, .game-over-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: inherit;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .login-btn:hover, .menu-btn:hover, .game-over-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .welcome-text {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0.9;
        }

        .menu-buttons, .game-over-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .menu-btn {
          min-width: 300px;
          padding: 1.5rem 3rem;
          font-size: 1.3rem;
        }

        .game-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.1);
        }

        .game-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          font-size: 1.2rem;
          font-weight: bold;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        }

        .back-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .game-layout {
          display: flex;
          flex: 1;
        }

        .problem-panel {
          width: 300px;
          background: rgba(0, 0, 0, 0.1);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .webcam-section {
          margin-bottom: 2rem;
          width: 100%;
        }

        .webcam-toggle {
          margin-bottom: 1rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
          gap: 0.5rem;
        }

        .toggle-checkbox {
          display: none;
        }

        .toggle-slider {
          width: 40px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          position: relative;
          transition: background-color 0.3s;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: white;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-checkbox:checked + .toggle-slider {
          background-color: #4CAF50;
        }

        .toggle-checkbox:checked + .toggle-slider::before {
          transform: translateX(20px);
        }

        .webcam-container {
          position: relative;
          width: 200px;
          height: 150px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .webcam-display {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .webcam-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .math-problem {
          margin: 2.5rem 0;
          text-align: center;
          margin-top: -1rem;
        }

        .problem-text {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #6bff75ff, #3dc8ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .instructions {
          text-align: center;
          margin-top: 2rem;
          border-radius: 15px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          margin-top: -1.5rem;
        }

        .instructions p {
          color: white;
          margin-bottom: 1rem;
        }

        .toggle-label,
        .problem-panel h2 {
          color: #fff !important;
        }
        
        .problem-panel h2 {
          font-size: 2.5rem;
        }

        .game-header,
        .game-header .stat,
        .game-header .back-btn,
        .game-header .game-stats span {
          color: #fff !important;
        }

        .fruit-explosion {
          position: absolute;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, #fff200, #ff0000);
          border-radius: 50%;
          animation: explosionAnim 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 20;
        }

        @keyframes explosionAnim {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }


        .tracking-btn {
          margin-top: 1rem;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tracking-btn.start {
          background: #4CAF50;
          color: white;
        }

        .tracking-btn.stop {
          background: #f44336;
          color: white;
        }

        .tracking-btn:hover {
          transform: translateY(-2px);
        }

        .game-area {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .game-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        .game-video-hidden {
          opacity: 0;
          position: absolute;
          pointer-events: none;
          width: 1px;
          height: 1px;
          top: -1000px;
        }

        .game-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          pointer-events: none;
        }

        .fruits-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        .fruit {
          position: absolute;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
          border-radius: 50%;
          overflow: hidden;
        }

        .fruit-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 50%;
          z-index: 1;
        }

        .fruit-number {
          position: relative;
          z-index: 2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.5);
          padding: 0.2rem 0.5rem;
          border-radius: 15px;
        }

        .fruit.apple .fruit-image {
          background-color: #ff6b6b;
        }

        .fruit.orange .fruit-image {
          background-color: #ffd93d;
        }

        .fruit.banana .fruit-image {
          background-color: #ffeb3b;
        }

        .fruit.watermelon .fruit-image {
          background-color: #4caf50;
        }

        .fruit.cut {
          animation: cutAnimation 0.8s ease-out forwards;
        }

        .fruit-piece {
          position: absolute;
          width: 40px;
          height: 40px;
          background: inherit;
          border-radius: 20px;
          opacity: 0;
        }

        .fruit.cut .fruit-piece {
          animation: fruitBreakAnimation 0.8s ease-out forwards;
        }

        .fruit-piece.piece-1 {
          top: -10px;
          left: -10px;
          animation-delay: 0s;
        }

        .fruit-piece.piece-2 {
          top: -10px;
          right: -10px;
          animation-delay: 0.1s;
        }

        .fruit-piece.piece-3 {
          bottom: -10px;
          left: -10px;
          animation-delay: 0.2s;
        }

        .fruit-piece.piece-4 {
          bottom: -10px;
          right: -10px;
          animation-delay: 0.3s;
        }

        @keyframes cutAnimation {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fruitBreakAnimation {
          0% {
            opacity: 1;
            transform: scale(1) translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.3) translate(var(--random-x, 50px), var(--random-y, 50px)) rotate(360deg);
          }
        }

        .slash-effect {
          position: absolute;
          pointer-events: none;
          z-index: 15;
        }

        .slash-line {
          height: 4px;
          background: linear-gradient(90deg, transparent, #FFD700, #FF6B6B, #FFD700, transparent);
          border-radius: 2px;
          animation: slashAnimation 0.3s ease-out forwards;
          box-shadow: 0 0 10px #FFD700;
        }

        @keyframes slashAnimation {
          0% {
            opacity: 1;
            transform: scaleX(0);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1);
          }
        }

        .slash-sparks {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #FFD700, #FF6B6B);
          border-radius: 50%;
          animation: sparkAnimation 0.4s ease-out forwards;
          box-shadow: 0 0 8px #FFD700;
        }

        @keyframes sparkAnimation {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--spark-x), var(--spark-y)) scale(0);
          }
        }

        .scores-list {
          margin: 2rem 0;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          margin: 0.5rem 0;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .rank {
          font-weight: bold;
          color: #667eea;
        }

        .no-scores {
          text-align: center;
          opacity: 0.6;
          font-style: italic;
        }

        .new-high-score {
          color: #22c55e;
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .final-score {
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }

        .leaderboard-container {
          min-width: 400px;
          max-width: 600px;
        }

        .juice-splash {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          opacity: 0.7;
          animation: splashAnim 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 12;
        }

        @keyframes splashAnim {
          0% { transform: translate(0,0) scale(1); opacity: 0.7; }
          100% { transform: translate(var(--dx), var(--dy)) scale(var(--scale)); opacity: 0; }
        }


        @media (max-width: 768px) {
          .game-layout {
            flex-direction: column;
          }
          
          .problem-panel {
            width: 100%;
            height: 200px;
            flex-direction: row;
            padding: 1rem;
            justify-content: space-around;
          }
          
          .webcam-section {
            margin-bottom: 1rem;
            margin-right: 1rem;
          }
          
          .webcam-container {
            width: 120px;
            height: 90px;
          }
          
          .game-title {
            font-size: 2rem;
          }
          
          .menu-btn {
            min-width: 250px;
          }
          
          .problem-text {
            font-size: 2rem;
          }
        }

        .screen-flash {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 1000;
          pointer-events: none;
          animation: flashAnim 0.3s;
          opacity: 0.5;
        }
        .screen-flash.positive { background: #22c55e; }
        .screen-flash.negative { background: #e11d48; }

        @keyframes flashAnim {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>
      
      <div className={`math-fruit-ninja ${theme}`}>
        {flash === 'positive' && (
          <div className="screen-flash positive"></div>
        )}
        {flash === 'negative' && (
          <div className="screen-flash negative"></div>
        )}
        {renderCurrentScreen()}
      </div>
    </>
  );
}
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
  onBackToMenu
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
        {/* Left Panel - Math Problem */}
        <div className="problem-panel">
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
          {/* video must be present in DOM (but we hide it visually) */}
          <video 
            ref={videoRef} 
            className="game-video"
            playsInline
            muted
          />
          <canvas 
            ref={overlayRef}
            className="game-canvas"
            width="800"
            height="600"
          />
          
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
                <span className="fruit-number">{fruit.number}</span>
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

  // Hand tracking
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const emaPos = useRef({ x: 0, y: 0 });

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
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;
    
    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      default:
        a = 5;
        b = 3;
        answer = 8;
    }
    
    return {
      question: `${a} ${operation} ${b}`,
      answer
    };
  }, []);

  // Fruit generation
  const spawnFruit = useCallback(() => {
    if (!currentProblem) return;
    
    const fruitTypes = ['apple', 'orange', 'banana', 'watermelon'];
    const isCorrectAnswer = Math.random() < 0.3;
    
    let number;
    if (isCorrectAnswer) {
      number = currentProblem.answer;
    } else {
      const offset = Math.floor(Math.random() * 20) - 10;
      number = Math.max(1, currentProblem.answer + offset);
      if (number === currentProblem.answer) {
        number += Math.random() > 0.5 ? 5 : -5;
        number = Math.max(1, number);
      }
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
      speed: 2 + Math.random() * 3
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

    // create camera; don't gate frames by `running` here — we'll control start/stop via camera.start/stop
    const camera = new window.Camera(videoEl, {
      onFrame: async () => {
        try {
          await hands.send({ image: videoEl });
        } catch (error) {
          console.error('[MathFruitNinja] hands.send error', error);
        }
      },
      width: 800,
      height: 600,
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
        const vw = videoEl.videoWidth || 800;
        const vh = videoEl.videoHeight || 600;
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
      console.info('[MathFruitNinja] Camera + Hands cleaned up');
    };
  }, [handsLoaded, currentScreen]);

  // Hand tracking results
  function onResults(results) {
    if (!overlayRef.current) return;
    const overlay = overlayRef.current;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const tip = landmarks[8];
      
      // normalized coords -> canvas coords
      const x = tip.x * overlay.width;
      const y = tip.y * overlay.height;
      
      const alpha = 0.3;
      emaPos.current.x = alpha * x + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * y + (1 - alpha) * emaPos.current.y;

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

      checkFruitCollisions(emaPos.current.x, emaPos.current.y);
    }
  }

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
        } else {
          newLives = Math.max(0, newLives - 1);
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
    }, 2000);

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
  };

  const toggleTracking = () => {
    running ? stopTracking() : startTracking();
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
    // Fallback for mouse/touch
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
        }

        .math-fruit-ninja.light {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }

        .math-fruit-ninja.dark {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: #fff;
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
          background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4dabf7);
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

        .math-problem {
          margin: 2rem 0;
          text-align: center;
        }

        .problem-text {
          font-size: 3rem;
          font-weight: bold;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .instructions {
          text-align: center;
          margin-top: 2rem;
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

        .game-video {
          opacity: 0;
          position: absolute;
          pointer-events: none;
          width: 800px;
          height: 600px;
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
        }

        .fruit {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .fruit.apple {
          background: radial-gradient(circle, #ff6b6b, #dc3545);
        }

        .fruit.orange {
          background: radial-gradient(circle, #ffd93d, #fd7e14);
        }

        .fruit.banana {
          background: radial-gradient(circle, #ffeb3b, #fbc02d);
        }

        .fruit.watermelon {
          background: radial-gradient(circle, #4caf50, #2e7d32);
        }

        .fruit.cut {
          animation: cutAnimation 0.5s ease-out forwards;
        }

        @keyframes cutAnimation {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 0.7;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        .fruit-number {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

        @media (max-width: 768px) {
          .game-layout {
            flex-direction: column;
          }
          
          .problem-panel {
            width: 100%;
            height: 150px;
            flex-direction: row;
            padding: 1rem;
          }
          
          .game-title {
            font-size: 2rem;
          }
          
          .menu-btn {
            min-width: 250px;
          }
        }
      `}</style>
      
      <div className={`math-fruit-ninja ${theme}`}>
        {renderCurrentScreen()}
      </div>
    </>
  );
}

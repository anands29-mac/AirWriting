import React, { useEffect, useRef, useState, useCallback } from 'react';
import SignIn from "./components/SignIn.jsx";

// Enhanced Game Components with new features
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
  onToggleWebcam,
  combo,
  difficultyLevel,
  onDifficultyChange,
  powerUps,
  achievements,
  soundEnabled,
  onToggleSound
}) {
  return (
    <div className={`game-screen ${theme}`}>
      {/* Enhanced Game Header */}
      <div className="game-header">
        <div className="game-stats">
          <span className="stat">Score: {score}</span>
          <span className="stat">Lives: {'❤️'.repeat(lives)}</span>
          <span className="stat">Time: {timeLeft}s</span>
          <span className={`stat combo ${combo > 1 ? 'active' : ''}`}>
            Combo: {combo}x {combo > 1 && '🔥'}
          </span>
          <span className="stat difficulty">Difficulty: {difficultyLevel}</span>
        </div>
        <div className="header-controls">
          <select 
            value={difficultyLevel} 
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="difficulty-select"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button 
            className={`sound-btn ${soundEnabled ? 'on' : 'off'}`}
            onClick={onToggleSound}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button className="back-btn" onClick={onBackToMenu}>
            ← Menu
          </button>
        </div>
      </div>

      <div className="game-layout">
        {/* Enhanced Left Panel */}
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
                📹 Show Webcam
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

          {/* Math Problem Display */}
          <h2>Solve This:</h2>
          <div className="math-problem">
            {currentProblem ? (
              <span className="problem-text">{currentProblem.question} = ?</span>
            ) : (
              <span className="problem-text">Loading...</span>
            )}
          </div>

          {/* Active Power-ups Display */}
          {powerUps.length > 0 && (
            <div className="active-powerups">
              <h4>Active Power-ups:</h4>
              {powerUps.map(powerup => (
                <div key={powerup.id} className="powerup-item">
                  {powerup.icon} {powerup.name} ({powerup.timeLeft}s)
                </div>
              ))}
            </div>
          )}

          {/* Recent Achievements */}
          {achievements.filter(a => a.isNew).length > 0 && (
            <div className="new-achievements">
              <h4>🏆 New Achievement!</h4>
              {achievements.filter(a => a.isNew).map(achievement => (
                <div key={achievement.id} className="achievement-popup">
                  {achievement.icon} {achievement.name}
                </div>
              ))}
            </div>
          )}

          <div className="instructions">
            <p>✋ Use hand gestures to cut fruits with correct answers!</p>
            <p>🌟 Special gestures: Peace sign (✌️) for power-ups</p>
            <button 
              className={`tracking-btn ${running ? 'stop' : 'start'}`}
              onClick={onToggleRunning}
            >
              {running ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>
        </div>

        {/* Enhanced Game Area */}
        <div className="game-area">
          {/* Dynamic Background based on difficulty */}
          <div className={`game-background ${difficultyLevel.toLowerCase()}`} style={{
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
          
          {/* Enhanced Slash Effects */}
          {slashEffects.map(slash => (
            <div
              key={slash.id}
              className={`slash-effect ${slash.type || 'normal'}`}
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
          
          {/* Falling Fruits and Power-ups */}
          <div className="fruits-container">
            {gameState.fruits.map(fruit => (
              <div
                key={fruit.id}
                className={`fruit ${fruit.type} ${fruit.cut ? 'cut' : ''} ${fruit.isPowerUp ? 'powerup' : ''}`}
                style={{
                  left: `${fruit.x}px`,
                  top: `${fruit.y}px`,
                  transform: `rotate(${fruit.rotation}deg) ${fruit.isPowerUp ? 'scale(1.2)' : ''}`
                }}
                onClick={() => onCutFruit(fruit.id)}
              >
                {/* Fruit Image with glow effect for power-ups */}
                <div 
                  className={`fruit-image ${fruit.isPowerUp ? 'powerup-glow' : ''}`}
                  style={{
                    backgroundImage: `url('../../${fruit.type}.png')`
                  }}
                ></div>
                <span className="fruit-number">
                  {fruit.isPowerUp ? fruit.powerType : fruit.number}
                </span>
                
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

          {/* Combo Display */}
          {combo > 2 && (
            <div className="combo-display">
              <div className="combo-text">
                {combo}x COMBO! 🔥
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuScreen({ onStartGame, onShowLeaderboard, onShowAchievements, theme, username }) {
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
          <button className="menu-btn secondary" onClick={onShowAchievements}>
            🏅 Achievements
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
              <div key={index} className={`score-item ${index < 3 ? 'top-3' : ''}`}>
                <span className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </span>
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

function AchievementsScreen({ onBack, theme, achievements }) {
  return (
    <div className={`achievements-screen ${theme}`}>
      <div className="achievements-container">
        <h1>🏅 Achievements</h1>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-description">{achievement.description}</div>
              {achievement.unlocked && (
                <div className="achievement-date">
                  Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="back-btn" onClick={onBack}>← Back to Menu</button>
      </div>
    </div>
  );
}

function GameOverScreen({ score, onRestart, onBackToMenu, theme, isNewHighScore, finalStats }) {
  return (
    <div className={`game-over-screen ${theme}`}>
      <div className="game-over-container">
        <h1>Game Over!</h1>
        {isNewHighScore && <p className="new-high-score">🎉 New High Score!</p>}
        <div className="final-stats">
          <p className="final-score">Final Score: {score}</p>
          <p>Max Combo: {finalStats.maxCombo}x</p>
          <p>Accuracy: {finalStats.accuracy}%</p>
          <p>Power-ups Used: {finalStats.powerUpsUsed}</p>
        </div>
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

// Main App Component with Enhanced Features
export default function MathFruitNinja() {
  // Game state management
  const [currentScreen, setCurrentScreen] = useState('signin');
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('light');
  const [showWebcam, setShowWebcam] = useState(false);
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Enhanced Game mechanics
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
  
  // New features
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [totalFruitsAttempted, setTotalFruitsAttempted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [powerUpsUsed, setPowerUpsUsed] = useState(0);
  
  // Achievements system
  const [achievements, setAchievements] = useState([
    { id: 'first_game', name: 'First Steps', description: 'Play your first game', icon: '🎯', unlocked: false },
    { id: 'score_100', name: 'Century', description: 'Score 100 points', icon: '💯', unlocked: false },
    { id: 'combo_5', name: 'Combo Master', description: 'Get a 5x combo', icon: '🔥', unlocked: false },
    { id: 'perfect_game', name: 'Perfectionist', description: '100% accuracy in a game', icon: '⭐', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete 10 problems in 30 seconds', icon: '⚡', unlocked: false }
  ]);

  // Hand tracking refs
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const emaPos = useRef({ x: 0, y: 0 });
  const tracingPath = useRef([]);

  // Sound effects (mock implementation - you'd use actual audio files)
  const playSound = (soundType) => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${soundType}`);
    // Implement actual sound playing logic here
  };

  // Handle successful authentication
  const handleSignInSuccess = (authenticatedUsername) => {
    setUsername(authenticatedUsername);
    setCurrentScreen('menu');
  };

  // Enhanced fetch leaderboard with error handling
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/leaderboard");
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      setLeaderboardScores(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      // Show user-friendly error message
      alert("Unable to load leaderboard. Please check your connection.");
    }
  };

  // FIXED: Submit score with proper state capture and retry logic
  const submitScore = async (finalScore, finalLives, finalTimeLeft, stats) => {
    console.log('submitScore called with:', {
      username,
      finalScore,
      finalLives,
      finalTimeLeft,
      stats
    });
    
    const scoreData = {
      username,
      score: finalScore,
      lives: finalLives,
      timeLeft: finalTimeLeft,
      maxCombo: stats.maxCombo,
      accuracy: stats.accuracy,
      powerUpsUsed: stats.powerUpsUsed,
      difficulty: difficultyLevel
    };

    // Retry logic for better reliability
    let retries = 3;
    while (retries > 0) {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scoreData)
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Score submitted successfully:", data);
        return; // Success, exit retry loop
        
      } catch (err) {
        console.error(`Failed to submit score (attempt ${4-retries}):`, err);
        retries--;
        
        if (retries === 0) {
          // Show user-friendly error message
          alert("Unable to save your score. Please check your connection and try again.");
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  };

  // Enhanced math problem generator with difficulty levels
  const generateProblem = useCallback(() => {
    let operations, maxNum, includeDecimals, includeAlgebra;
    
    switch (difficultyLevel) {
      case 'Easy':
        operations = ['+', '-'];
        maxNum = 20;
        includeDecimals = false;
        includeAlgebra = false;
        break;
      case 'Medium':
        operations = ['+', '-', '*'];
        maxNum = 50;
        includeDecimals = Math.random() < 0.3;
        includeAlgebra = Math.random() < 0.2;
        break;
      case 'Hard':
        operations = ['+', '-', '*', '/'];
        maxNum = 100;
        includeDecimals = Math.random() < 0.5;
        includeAlgebra = Math.random() < 0.4;
        break;
      default:
        operations = ['+', '-'];
        maxNum = 50;
        includeDecimals = false;
        includeAlgebra = false;
    }

    if (includeAlgebra && Math.random() < 0.5) {
      // Algebra problem
      const b = Math.floor(Math.random() * maxNum/2) + 1;
      const answer = Math.floor(Math.random() * maxNum/2) + 1;
      const a = answer + b;
      return { question: `x + ${b} = ${a}`, answer };
    }

    if (includeDecimals && Math.random() < 0.3) {
      // Decimal problem
      const a = (Math.random() * maxNum/2).toFixed(1);
      const b = (Math.random() * maxNum/2).toFixed(1);
      const answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
      return { question: `${a} + ${b}`, answer: parseFloat(answer) };
    }

    // Regular problems
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer, question;

    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        question = `${a} + ${b}`;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + maxNum/2;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        question = `${a} - ${b}`;
        break;
      case '*':
        a = Math.floor(Math.random() * Math.min(12, maxNum/4)) + 1;
        b = Math.floor(Math.random() * Math.min(12, maxNum/4)) + 1;
        answer = a * b;
        question = `${a} × ${b}`;
        break;
      case '/':
        b = Math.floor(Math.random() * Math.min(12, maxNum/4)) + 1;
        answer = Math.floor(Math.random() * Math.min(12, maxNum/4)) + 1;
        a = b * answer;
        question = `${a} ÷ ${b}`;
        break;
      default:
        a = 5; b = 3; answer = 8; question = `${a} + ${b}`;
    }

    return { question, answer };
  }, [difficultyLevel]);

  // Enhanced fruit spawning with power-ups
  const spawnFruit = useCallback(() => {
    if (!currentProblem) return;
    
    const fruitTypes = ['Apple', 'Pomegranate', 'Pineapple', 'Watermelon'];
    const isPowerUp = Math.random() < 0.1; // 10% chance for power-up
    const isCorrectAnswer = isPowerUp ? false : Math.random() < 0.3; // Power-ups are never correct answers
    
    let number, powerType = null;
    
    if (isPowerUp) {
      const powerTypes = ['⚡', '💎', '🌟', '🛡️'];
      powerType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
      number = powerType;
    } else if (isCorrectAnswer) {
      number = Number(currentProblem.answer);
    } else {
      const baseAnswer = Number(currentProblem.answer);
      let offset = Math.floor(Math.random() * 20) - 10;
      if (offset === 0) offset = 5;
      number = Math.max(1, baseAnswer + offset);
      if (typeof currentProblem.answer === 'string' && currentProblem.answer.includes('.')) {
        number = Number(number.toFixed(1));
      }
    }
    
    const newFruit = {
      id: Date.now() + Math.random(),
      x: Math.random() * 600,
      y: -80,
      number,
      type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
      isCorrect: isCorrectAnswer,
      isPowerUp,
      powerType,
      cut: false,
      rotation: Math.random() * 360,
      speed: 2 + Math.random() * 3 + (difficultyLevel === 'Hard' ? 2 : 0)
    };

    setGameState(prev => ({
      ...prev,
      fruits: [...prev.fruits, newFruit]
    }));
  }, [currentProblem, difficultyLevel]);

  // Achievement checker
  const checkAchievements = (newScore, newCombo) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let shouldUnlock = false;
      const now = new Date().toISOString();
      
      switch (achievement.id) {
        case 'first_game':
          shouldUnlock = true;
          break;
        case 'score_100':
          shouldUnlock = newScore >= 100;
          break;
        case 'combo_5':
          shouldUnlock = newCombo >= 5;
          break;
        case 'perfect_game':
          shouldUnlock = totalFruitsAttempted > 0 && (correctAnswers / totalFruitsAttempted) === 1;
          break;
        case 'speed_demon':
          // This would need more sophisticated tracking
          shouldUnlock = false;
          break;
      }
      
      if (shouldUnlock) {
        playSound('achievement');
        return { ...achievement, unlocked: true, unlockedAt: now, isNew: true };
      }
      
      return achievement;
    });
    
    setAchievements(updatedAchievements);
  };

  // Enhanced collision detection with power-ups and combo system
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
          createSlashEffect(fruit.x + 40, fruit.y + 40, fruit.isPowerUp ? 'powerup' : 'normal');
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
      let newCombo = combo;
      let shouldGenerateNewProblem = false;
      
      newlyCut.forEach(fruit => {
        setTotalFruitsAttempted(prev => prev + 1);
        
        if (fruit.isPowerUp) {
          // Handle power-up
          activatePowerUp(fruit.powerType);
          playSound('powerup');
          newScore += 5; // Small bonus for power-ups
          newCombo += 1;
        } else if (fruit.isCorrect) {
          // Correct answer
          const basePoints = 10;
          const comboBonus = Math.floor(basePoints * (newCombo * 0.5));
          newScore += basePoints + comboBonus;
          newCombo += 1;
          shouldGenerateNewProblem = true;
          setCorrectAnswers(prev => prev + 1);
          playSound('correct');
        } else {
          // Wrong answer
          newLives = Math.max(0, newLives - 1);
          newCombo = 0; // Reset combo
          playSound('wrong');
        }
      });
      
      // Update combo state
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      
      // Check achievements
      checkAchievements(newScore, newCombo);
      
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

  // Power-up activation system
  const activatePowerUp = (powerType) => {
    const powerUpId = Date.now();
    let powerUp;
    
    switch (powerType) {
      case '⚡':
        powerUp = { 
          id: powerUpId, 
          name: 'Speed Boost', 
          icon: '⚡', 
          timeLeft: 10,
          effect: 'Slow down fruit falling speed'
        };
        break;
      case '💎':
        powerUp = { 
          id: powerUpId, 
          name: 'Double Points', 
          icon: '💎', 
          timeLeft: 15,
          effect: 'Double score for correct answers'
        };
        break;
      case '🌟':
        powerUp = { 
          id: powerUpId, 
          name: 'Extra Life', 
          icon: '🌟', 
          timeLeft: 0,
          effect: 'Gain one extra life'
        };
        setGameState(prev => ({ ...prev, lives: Math.min(5, prev.lives + 1) }));
        break;
      case '🛡️':
        powerUp = { 
          id: powerUpId, 
          name: 'Shield', 
          icon: '🛡️', 
          timeLeft: 20,
          effect: 'Wrong answers don\'t reduce lives'
        };
        break;
    }
    
    if (powerUp.timeLeft > 0) {
      setPowerUps(prev => [...prev, powerUp]);
      setPowerUpsUsed(prev => prev + 1);
      
      // Set timer to remove power-up
      setTimeout(() => {
        setPowerUps(prev => prev.filter(p => p.id !== powerUpId));
      }, powerUp.timeLeft * 1000);
    }
  };

  // Enhanced createSlashEffect with types
  const createSlashEffect = (x, y, type = 'normal') => {
    const slashId = Date.now() + Math.random();
    const angle = Math.random() * 360;
    const length = type === 'powerup' ? 120 : 80 + Math.random() * 40;
    
    const newSlash = {
      id: slashId,
      x: x - length / 2,
      y: y - 2,
      width: length,
      rotation: angle,
      type
    };
    
    setSlashEffects(prev => [...prev, newSlash]);
    
    // Enhanced particle effects for power-ups
    const particleCount = type === 'powerup' ? 12 : 6;
    for (let i = 0; i < particleCount; i++) {
      const sparkId = Date.now() + Math.random() + i;
      const sparkAngle = (Math.random() * 360) * Math.PI / 180;
      const sparkDistance = type === 'powerup' ? 50 : 30 + Math.random() * 30;
      const sparkX = Math.cos(sparkAngle) * sparkDistance;
      const sparkY = Math.sin(sparkAngle) * sparkDistance;
      
      const spark = {
        id: sparkId,
        x: x - 3,
        y: y - 3,
        sparkX,
        sparkY,
        type
      };
      
      setTimeout(() => {
        const sparkElement = document.createElement('div');
        sparkElement.className = `slash-sparks ${type}`;
        sparkElement.style.left = spark.x + 'px';
        sparkElement.style.top = spark.y + 'px';
        sparkElement.style.setProperty('--spark-x', spark.sparkX + 'px');
        sparkElement.style.setProperty('--spark-y', spark.sparkY + 'px');
        
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
          gameArea.appendChild(sparkElement);
          setTimeout(() => sparkElement.remove(), 600);
        }
      }, 50);
    }
    
    setTimeout(() => {
      setSlashEffects(prev => prev.filter(s => s.id !== slashId));
    }, 400);
  };

  // Load MediaPipe scripts
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
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

  // Initialize MediaPipe when entering game screen
  useEffect(() => {
    if (!handsLoaded || !window.Hands || !window.Camera) return;
    if (currentScreen !== 'game') return;
    if (cameraRef.current) return;

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
    
    hands.onResults(onResults);
    handsRef.current = hands;

    const videoEl = videoRef.current;
    const overlay = overlayRef.current;
    if (!videoEl) {
      console.warn('[MathFruitNinja] video element not ready');
      return;
    }

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

    (async () => {
      try {
        videoEl.playsInline = true;
        videoEl.muted = true;

        await camera.start();
        console.info('[MathFruitNinja] Camera started');
        setRunning(true);

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

  // Hand tracking results with enhanced gesture detection
  function onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
    const landmarks = results.multiHandLandmarks[0];
    const tip = landmarks[8];

    // Check for special gestures (peace sign for power-ups)
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // Simple peace sign detection (index and middle finger up)
    const indexUp = indexTip.y < landmarks[6].y;
    const middleUp = middleTip.y < landmarks[10].y;
    const ringDown = ringTip.y > landmarks[14].y;
    const pinkyDown = pinkyTip.y > landmarks[18].y;
    
    if (indexUp && middleUp && ringDown && pinkyDown) {
      // Peace sign detected - could trigger special effects or power-ups
      console.log('Peace sign detected!');
    }

    if (showWebcam) {
      const overlay = document.querySelector('.webcam-overlay');
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      drawHandSkeleton(ctx, landmarks, overlay.width, overlay.height);

      const rawX = (1 - tip.x) * 800;
      const rawY = tip.y * 600;

      const alpha = 0.3;
      emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y;

      checkFruitCollisions(emaPos.current.x, emaPos.current.y);
      drawTrackingOnGameCanvas(emaPos.current.x, emaPos.current.y);
    } else {
      if (!overlayRef.current) return;
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

      const gameX = (1 - tip.x) * overlayRef.current.width;
      const gameY = tip.y * overlayRef.current.height;

      const alpha = 0.3;
      emaPos.current.x = alpha * gameX + (1 - alpha) * emaPos.current.x;
      emaPos.current.y = alpha * gameY + (1 - alpha) * emaPos.current.y;

      tracingPath.current.push({
        x: emaPos.current.x,
        y: emaPos.current.y,
        timestamp: Date.now()
      });

      const now = Date.now();
      tracingPath.current = tracingPath.current.filter(
        point => now - point.timestamp < 1000
      );

      if (tracingPath.current.length > 1) {
        ctx.strokeStyle = combo > 2 ? '#FFD700' : '#FF6B6B';
        ctx.lineWidth = combo > 2 ? 6 : 4;
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

      ctx.globalAlpha = 1;
      ctx.fillStyle = combo > 2 ? '#FFD700' : '#FF6B6B';
      ctx.beginPath();
      ctx.arc(emaPos.current.x, emaPos.current.y, combo > 2 ? 20 : 15, 0, Math.PI * 2);
      ctx.fill();

      if (combo > 2) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(emaPos.current.x, emaPos.current.y, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      checkFruitCollisions(emaPos.current.x, emaPos.current.y);
    }
  }

  // Draw tracking elements on the main game canvas when webcam is shown
  function drawTrackingOnGameCanvas(gameX, gameY) {
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
    
    tracingPath.current.push({ 
      x: gameX, 
      y: gameY, 
      timestamp: Date.now() 
    });
    
    const now = Date.now();
    tracingPath.current = tracingPath.current.filter(point => now - point.timestamp < 1000);

    if (tracingPath.current.length > 1) {
      ctx.strokeStyle = combo > 2 ? '#FFD700' : '#FF6B6B';
      ctx.lineWidth = combo > 2 ? 6 : 4;
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

    ctx.globalAlpha = 1;
    ctx.fillStyle = combo > 2 ? '#FFD700' : '#FF6B6B';
    ctx.beginPath();
    ctx.arc(gameX, gameY, combo > 2 ? 20 : 15, 0, Math.PI * 2);
    ctx.fill();
    
    if (combo > 2) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(gameX, gameY, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Draw hand skeleton with enhanced visualization
  function drawHandSkeleton(ctx, landmarks, width, height) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];

    ctx.strokeStyle = combo > 2 ? '#FFD700' : '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      const s = landmarks[start];
      const e = landmarks[end];
      ctx.moveTo(s.x * width, s.y * height);
      ctx.lineTo(e.x * width, e.y * height);
    });
    ctx.stroke();

    ctx.fillStyle = combo > 2 ? '#FFD700' : '#FFFF00';
    landmarks.forEach(lm => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Enhanced explosion effect
  const createFruitExplosion = (x, y, isPowerUp = false) => {
    const particleCount = isPowerUp ? 12 : 8;
    const colors = isPowerUp ? ['#FFD700', '#FF69B4', '#00BFFF'] : ['#ff4b4b', '#ffa500', '#ffe135'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = isPowerUp ? 'fruit-explosion powerup' : 'fruit-explosion';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
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

  // Enhanced juice splash with power-up effects
  const createJuiceSplash = (x, y, fruitType, isPowerUp = false) => {
    const colors = isPowerUp ? 
      { default: 'linear-gradient(45deg, #FFD700, #FF69B4, #00BFFF)' } :
      {
        Apple: '#ff4b4b',
        Pomegranate: '#ff1744',
        Pineapple: '#ffe135',
        Watermelon: '#4caf50'
      };

    const splashColor = colors[fruitType] || colors.default || '#FFD700';
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;

    const splashCount = isPowerUp ? 12 : 8;
    for (let i = 0; i < splashCount; i++) {
      const splash = document.createElement('div');
      splash.className = isPowerUp ? 'juice-splash powerup' : 'juice-splash';
      splash.style.left = `${x}px`;
      splash.style.top = `${y}px`;
      splash.style.background = splashColor;

      const angle = Math.random() * 2 * Math.PI;
      const distance = 60 + Math.random() * 40;
      splash.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      splash.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      splash.style.setProperty('--scale', 1 + Math.random() * 0.5);

      gameArea.appendChild(splash);
      setTimeout(() => splash.remove(), 600);
    }
  };

  // Game loop - enhanced with power-up effects
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        // Apply speed power-up effect
        const hasSpeedBoost = powerUps.some(p => p.name === 'Speed Boost');
        const speedMultiplier = hasSpeedBoost ? 0.5 : 1;
        
        const updatedFruits = prev.fruits
          .map(fruit => ({
            ...fruit,
            y: fruit.y + (fruit.speed * speedMultiplier),
            rotation: fruit.rotation + 2
          }))
          .filter(fruit => fruit.cut || fruit.y < 700);
        
        const missedFruits = prev.fruits.filter(fruit => 
          fruit.y >= 700 && !fruit.cut && fruit.isCorrect
        );
        
        let newLives = prev.lives;
        const hasShield = powerUps.some(p => p.name === 'Shield');
        
        if (missedFruits.length > 0 && !hasShield) {
          newLives = Math.max(0, prev.lives - missedFruits.length);
          setCombo(0); // Reset combo on missed fruit
        }
        
        return {
          ...prev,
          fruits: updatedFruits,
          lives: newLives
        };
      });

      // Update power-up timers
      setPowerUps(prev => 
        prev.map(powerup => ({
          ...powerup,
          timeLeft: Math.max(0, powerup.timeLeft - 0.05)
        })).filter(powerup => powerup.timeLeft > 0)
      );
    }, 50);

    return () => clearInterval(gameLoop);
  }, [currentScreen, powerUps]);

  // Game timer with enhanced ending
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1 || prev.lives <= 0) {
          setTimeout(() => endGame(prev.score, prev.lives, prev.timeLeft), 100);
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setGameTimer(timer);
    return () => clearInterval(timer);
  }, [currentScreen]);

  // Enhanced fruit spawning with difficulty scaling
  useEffect(() => {
    if (currentScreen !== 'game') return;
    
    const getSpawnRate = () => {
      const baseRate = 2000;
      const difficultyMultiplier = difficultyLevel === 'Easy' ? 1.2 : difficultyLevel === 'Hard' ? 0.8 : 1;
      const scoreMultiplier = Math.max(0.5, 1 - (gameState.score / 1000)); // Faster spawning as score increases
      return baseRate * difficultyMultiplier * scoreMultiplier;
    };
    
    const spawnTimer = setInterval(() => {
      spawnFruit();
    }, getSpawnRate());

    setFruitSpawnTimer(spawnTimer);
    return () => clearInterval(spawnTimer);
  }, [currentScreen, spawnFruit, difficultyLevel, gameState.score]);

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

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Game flow functions with enhanced state management
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
    setCombo(0);
    setMaxCombo(0);
    setPowerUps([]);
    setTotalFruitsAttempted(0);
    setCorrectAnswers(0);
    setPowerUpsUsed(0);
    tracingPath.current = [];
    
    // Clear new achievement flags
    setAchievements(prev => prev.map(a => ({ ...a, isNew: false })));
  };

  // FIXED: Enhanced endGame with proper state capture
  const endGame = (finalScore, finalLives, finalTimeLeft) => {
    console.log('endGame called with:', { finalScore, finalLives, finalTimeLeft });
    
    // Stop all timers immediately
    if (gameTimer) clearInterval(gameTimer);
    if (fruitSpawnTimer) clearInterval(fruitSpawnTimer);
    stopTracking();

    // Calculate final statistics
    const accuracy = totalFruitsAttempted > 0 ? 
      Math.round((correctAnswers / totalFruitsAttempted) * 100) : 0;
    
    const finalStats = {
      maxCombo,
      accuracy,
      powerUpsUsed
    };

    // Submit score with captured values - this is the key fix
    submitScore(finalScore, finalLives, finalTimeLeft, finalStats);
    
    // Check final achievements
    checkAchievements(finalScore, maxCombo);
    
    // Set game over screen
    setCurrentScreen('gameOver');
    
    // Store final stats for display
    window.finalGameStats = finalStats;
  };

  const cutFruit = (fruitId) => {
    const fruit = gameState.fruits.find(f => f.id === fruitId);
    if (fruit) {
      createSlashEffect(fruit.x + 40, fruit.y + 40, fruit.isPowerUp ? 'powerup' : 'normal');
      createFruitExplosion(fruit.x + 40, fruit.y + 40, fruit.isPowerUp);
      createJuiceSplash(fruit.x + 40, fruit.y + 40, fruit.type, fruit.isPowerUp);
    }
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect();
      checkFruitCollisions(rect.width / 2, rect.height / 2);
    }
  };

  // Screen rendering with all new screens
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'signin':
        return <SignIn onSuccess={handleSignInSuccess} />;
      case 'menu':
        return (
          <MenuScreen 
            onStartGame={startGame}
            onShowLeaderboard={() => {
              fetchLeaderboard();
              setCurrentScreen('leaderboard');
            }}
            onShowAchievements={() => setCurrentScreen('achievements')}
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
            combo={combo}
            difficultyLevel={difficultyLevel}
            onDifficultyChange={setDifficultyLevel}
            powerUps={powerUps}
            achievements={achievements}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={() => setCurrentScreen('menu')}
            theme={theme}
            scores={leaderboardScores}
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen
            onBack={() => setCurrentScreen('menu')}
            theme={theme}
            achievements={achievements}
          />
        );
      case 'gameOver':
        const finalStats = window.finalGameStats || { maxCombo: 0, accuracy: 0, powerUpsUsed: 0 };
        return (
          <GameOverScreen
            score={gameState.score}
            onRestart={startGame}
            onBackToMenu={() => setCurrentScreen('menu')}
            theme={theme}
            isNewHighScore={leaderboardScores.length === 0 || gameState.score > Math.max(...leaderboardScores.map(s => s.score || 0))}
            finalStats={finalStats}
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

        .menu-screen, .leaderboard-screen, .game-over-screen, .achievements-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .menu-container, .leaderboard-container, .game-over-container, .achievements-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .dark .menu-container, 
        .dark .leaderboard-container, 
        .dark .game-over-container,
        .dark .achievements-container {
          background: rgba(45, 55, 72, 0.95);
        }

        /* Enhanced Game Header */
        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.1);
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .difficulty-select {
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: inherit;
          cursor: pointer;
        }

        .sound-btn {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .sound-btn.off {
          opacity: 0.5;
        }

        .game-title {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4dabf7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .menu-btn, .game-over-btn {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .menu-btn.primary, .game-over-btn.primary {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
        }

        .menu-btn.secondary, .game-over-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: inherit;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .menu-btn:hover, .game-over-btn:hover {
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

        /* Enhanced Game Stats */
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
          transition: all 0.3s ease;
        }

        .stat.combo.active {
          background: linear-gradient(45deg, #FFD700, #FF6B6B);
          color: white;
          animation: comboGlow 1s ease-in-out infinite alternate;
        }

        .stat.difficulty {
          text-transform: capitalize;
        }

        @keyframes comboGlow {
          from { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
          to { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
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

        /* Enhanced Problem Panel */
        .problem-panel {
          width: 320px;
          background: rgba(0, 0, 0, 0.1);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow-y: auto;
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
          margin: 2rem 0;
          text-align: center;
        }

        .problem-text {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Power-ups and Achievements Display */
        .active-powerups {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 10px;
          border: 2px solid rgba(255, 215, 0, 0.3);
          width: 100%;
        }

        .powerup-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .new-achievements {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.1);
          border-radius: 10px;
          border: 2px solid rgba(34, 197, 94, 0.3);
          width: 100%;
          animation: achievementPulse 2s ease-in-out infinite;
        }

        @keyframes achievementPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .achievement-popup {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .instructions {
          text-align: center;
          margin-top: 2rem;
        }

        .instructions p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
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

        .game-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
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
          transition: all 0.5s ease;
        }

        .game-background.easy {
          filter: brightness(1.1) contrast(0.9);
        }

        .game-background.medium {
          filter: brightness(1) contrast(1);
        }

        .game-background.hard {
          filter: brightness(0.8) contrast(1.2) saturate(1.3);
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

        /* Enhanced Fruits */
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

        .fruit.powerup {
          animation: powerupPulse 1s ease-in-out infinite alternate;
        }

        @keyframes powerupPulse {
          from { transform: scale(1) rotate(0deg); }
          to { transform: scale(1.1) rotate(10deg); }
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

        .fruit-image.powerup-glow {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          animation: powerupGlow 1s ease-in-out infinite alternate;
        }

        @keyframes powerupGlow {
          from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
          to { box-shadow: 0 0 30px rgba(255, 215, 0, 1); }
        }

        .fruit-number {
          position: relative;
          z-index: 2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.5);
          padding: 0.2rem 0.5rem;
          border-radius: 15px;
        }

        .fruit.Apple .fruit-image {
          background-color: #ff6b6b;
        }

        .fruit.Pomegranate .fruit-image {
          background-color: #ff1744;
        }

        .fruit.Pineapple .fruit-image {
          background-color: #ffeb3b;
        }

        .fruit.Watermelon .fruit-image {
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

        /* Enhanced Slash Effects */
        .slash-effect {
          position: absolute;
          pointer-events: none;
          z-index: 15;
        }

        .slash-effect.powerup {
          z-index: 16;
        }

        .slash-line {
          height: 4px;
          background: linear-gradient(90deg, transparent, #FFD700, #FF6B6B, #FFD700, transparent);
          border-radius: 2px;
          animation: slashAnimation 0.3s ease-out forwards;
          box-shadow: 0 0 10px #FFD700;
        }

        .slash-effect.powerup .slash-line {
          height: 6px;
          background: linear-gradient(90deg, transparent, #FFD700, #FF69B4, #00BFFF, #FFD700, transparent);
          animation: powerupSlashAnimation 0.4s ease-out forwards;
          box-shadow: 0 0 15px #FFD700;
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

        @keyframes powerupSlashAnimation {
          0% {
            opacity: 1;
            transform: scaleX(0) scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleX(1) scaleY(1.5);
          }
          100% {
            opacity: 0;
            transform: scaleX(1) scaleY(1);
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

        .slash-sparks.powerup {
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #FFD700, #FF69B4, #00BFFF);
          animation: powerupSparkAnimation 0.6s ease-out forwards;
          box-shadow: 0 0 12px #FFD700;
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

        @keyframes powerupSparkAnimation {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--spark-x), var(--spark-y)) scale(0.2) rotate(360deg);
          }
        }

        /* Combo Display */
        .combo-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          pointer-events: none;
        }

        .combo-text {
          font-size: 3rem;
          font-weight: bold;
          color: #FFD700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          animation: comboAnimation 2s ease-out forwards;
        }

        @keyframes comboAnimation {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        /* Enhanced Leaderboard */
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
          transition: all 0.3s ease;
        }

        .score-item.top-3 {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border: 2px solid rgba(255, 215, 0, 0.3);
        }

        .score-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .rank {
          font-weight: bold;
          color: #667eea;
          font-size: 1.5rem;
        }

        .no-scores {
          text-align: center;
          opacity: 0.6;
          font-style: italic;
        }

        /* Achievements Screen */
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          max-width: 800px;
        }

        .achievement-card {
          padding: 1.5rem;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .achievement-card.unlocked {
          background: linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
          border-color: rgba(34, 197, 94, 0.3);
        }

        .achievement-card.locked {
          background: rgba(0, 0, 0, 0.05);
          opacity: 0.6;
        }

        .achievement-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .achievement-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .achievement-name {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .achievement-description {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .achievement-date {
          font-size: 0.8rem;
          opacity: 0.6;
        }

        /* Game Over Screen Enhancements */
        .new-high-score {
          color: #22c55e;
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          animation: highScoreGlow 2s ease-in-out infinite alternate;
        }

        @keyframes highScoreGlow {
          from { text-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
          to { text-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
        }

        .final-stats {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 15px;
        }

        .final-stats p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .final-score {
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }

        /* Enhanced Particle Effects */
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

        .fruit-explosion.powerup {
          width: 12px;
          height: 12px;
          background: radial-gradient(circle, #FFD700, #FF69B4, #00BFFF);
          animation: powerupExplosionAnim 0.8s ease-out forwards;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
        }

        @keyframes explosionAnim {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }

        @keyframes powerupExplosionAnim {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.2) rotate(720deg); opacity: 0; }
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

        .juice-splash.powerup {
          width: 25px;
          height: 25px;
          animation: powerupSplashAnim 0.8s ease-out forwards;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        @keyframes splashAnim {
          0% { transform: translate(0,0) scale(1); opacity: 0.7; }
          100% { transform: translate(var(--dx), var(--dy)) scale(var(--scale)); opacity: 0; }
        }

        @keyframes powerupSplashAnim {
          0% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 0.8; }
          100% { transform: translate(var(--dx), var(--dy)) scale(var(--scale)) rotate(360deg); opacity: 0; }
        }

        /* Responsive Design */
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

          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .game-stats {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .stat {
            font-size: 1rem;
            padding: 0.3rem 0.8rem;
          }
        }
      `}</style>
      
      <div className={`math-fruit-ninja ${theme}`}>
        {renderCurrentScreen()}
      </div>
    </>
  );
}
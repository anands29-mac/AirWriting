import React, { useEffect, useRef, useState, useCallback } from 'react';
import './css/GameScreen.css';

export default function GameScreen({ 
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
  onToggleSound,
  setGameState,
  setCurrentProblem,
  generateProblem,
  setCombo,
  setMaxCombo,
  setPowerUps,
  setTotalFruitsAttempted,
  setCorrectAnswers,
  setPowerUpsUsed,
  setSlashEffects,
  setAchievements,
  totalFruitsAttempted,
  correctAnswers,
  maxCombo,
  powerUpsUsed,
  endGame,
  gameTimer,
  setGameTimer,
  fruitSpawnTimer,
  setFruitSpawnTimer
}) {
  // Hand tracking refs
  const [handsLoaded, setHandsLoaded] = useState(false);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const emaPos = useRef({ x: 0, y: 0 });
  const tracingPath = useRef([]);

  // Sound effects
  const playSound = (soundType) => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${soundType}`);
  };

  // Enhanced fruit spawning with power-ups
  const spawnFruit = useCallback(() => {
    if (!currentProblem) return;
    
    const fruitTypes = ['Apple', 'Pomegranate', 'Pineapple', 'Watermelon'];
    const isPowerUp = Math.random() < 0.1;
    const isCorrectAnswer = isPowerUp ? false : Math.random() < 0.3;
    
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
  }, [currentProblem, difficultyLevel, setGameState]);

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
      
      setTimeout(() => {
        setPowerUps(prev => prev.filter(p => p.id !== powerUpId));
      }, powerUp.timeLeft * 1000);
    }
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
          activatePowerUp(fruit.powerType);
          playSound('powerup');
          newScore += 5;
          newCombo += 1;
        } else if (fruit.isCorrect) {
          const basePoints = 10;
          const comboBonus = Math.floor(basePoints * (newCombo * 0.5));
          newScore += basePoints + comboBonus;
          newCombo += 1;
          shouldGenerateNewProblem = true;
          setCorrectAnswers(prev => prev + 1);
          playSound('correct');
        } else {
          newLives = Math.max(0, newLives - 1);
          newCombo = 0;
          playSound('wrong');
        }
      });
      
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      
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
        
        console.info('[GameScreen] MediaPipe scripts loaded');
        setHandsLoaded(true);
      } catch (error) {
        console.error('Failed to load MediaPipe:', error);
      }
    };
    
    loadMediaPipe();
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    if (!handsLoaded || !window.Hands || !window.Camera) return;
    if (cameraRef.current) return;

    console.info('[GameScreen] Initializing Hands + Camera');

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
    if (!videoEl) {
      console.warn('[GameScreen] video element not ready');
      return;
    }

    const camera = new window.Camera(videoEl, {
      onFrame: async () => {
        try {
          await hands.send({ image: videoEl });
        } catch (error) {
          console.error('[GameScreen] hands.send error', error);
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
        console.info('[GameScreen] Camera started');

        const vw = showWebcam ? 200 : (videoEl.videoWidth || 800);
        const vh = showWebcam ? 150 : (videoEl.videoHeight || 600);
        const overlay = overlayRef.current;
        if (overlay) {
          overlay.width = vw;
          overlay.height = vh;
          overlay.style.width = `${vw}px`;
          overlay.style.height = `${vh}px`;
        }
      } catch (error) {
        console.error('[GameScreen] Failed to start camera', error);
      }
    })();

    return () => {
      try {
        if (cameraRef.current && cameraRef.current.stop) {
          cameraRef.current.stop();
        }
      } catch (e) {
        console.warn('[GameScreen] camera stop error', e);
      }

      try {
        if (handsRef.current && handsRef.current.close) {
          handsRef.current.close();
        }
      } catch (e) {
        console.warn('[GameScreen] hands close error', e);
      }

      cameraRef.current = null;
      handsRef.current = null;
      tracingPath.current = [];
      console.info('[GameScreen] Camera + Hands cleaned up');
    };
  }, [handsLoaded, showWebcam]);

  // Hand tracking results with enhanced gesture detection
  function onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
    const landmarks = results.multiHandLandmarks[0];
    const tip = landmarks[8];

    // Check for special gestures
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const indexUp = indexTip.y < landmarks[6].y;
    const middleUp = middleTip.y < landmarks[10].y;
    const ringDown = ringTip.y > landmarks[14].y;
    const pinkyDown = pinkyTip.y > landmarks[18].y;
    
    if (indexUp && middleUp && ringDown && pinkyDown) {
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

  // Game loop - enhanced with power-up effects
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
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
          setCombo(0);
        }
        
        return {
          ...prev,
          fruits: updatedFruits,
          lives: newLives
        };
      });

      setPowerUps(prev => 
        prev.map(powerup => ({
          ...powerup,
          timeLeft: Math.max(0, powerup.timeLeft - 0.05)
        })).filter(powerup => powerup.timeLeft > 0)
      );
    }, 50);

    return () => clearInterval(gameLoop);
  }, [powerUps, setGameState, setCombo, setPowerUps]);

  // Game timer - fixed countdown
useEffect(() => {
  const timer = setInterval(() => {
    setGameState(prev => {
      if (prev.timeLeft > 1 && prev.lives > 0) {
        // keep decrementing time
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      } else {
        // time runs out OR no lives left
        clearInterval(timer);
        endGame(prev.score, prev.lives, 0); // force timeLeft = 0
        return { ...prev, timeLeft: 0 };
      }
    });
  }, 1000);

  setGameTimer(timer);
  return () => clearInterval(timer);
}, [setGameState, setGameTimer, endGame]);

  // Enhanced fruit spawning with difficulty scaling
  useEffect(() => {
    const getSpawnRate = () => {
      const baseRate = 2000;
      const difficultyMultiplier = difficultyLevel === 'Easy' ? 1.2 : difficultyLevel === 'Hard' ? 0.8 : 1;
      const scoreMultiplier = Math.max(0.5, 1 - (gameState.score / 1000));
      return baseRate * difficultyMultiplier * scoreMultiplier;
    };
    
    const spawnTimer = setInterval(() => {
      spawnFruit();
    }, getSpawnRate());

    setFruitSpawnTimer(spawnTimer);
    return () => clearInterval(spawnTimer);
  }, [spawnFruit, difficultyLevel, gameState.score, setFruitSpawnTimer]);

  const handleCutFruit = (fruitId) => {
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
                onClick={() => handleCutFruit(fruit.id)}
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
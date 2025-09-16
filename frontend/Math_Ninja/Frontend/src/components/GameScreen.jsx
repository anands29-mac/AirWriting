import React, { useEffect, useRef, useState, useCallback } from 'react';
import './css/GameScreen.css';
import { 
  AdaptiveDifficultySystem, 
  GestureRecognition, 
  AdvancedParticleSystem,
  AdvancedAudioSystem,
  AccessibilityFeatures 
} from './EnhancedSystems.jsx';

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

<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
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
=======
// Enhanced fruit spawning with better visual variety
const spawnFruit = useCallback(() => {
  if (!currentProblem) return;
  
  const fruitTypes = ['Apple', 'Pomegranate', 'Pineapple', 'Watermelon'];
  const isPowerUp = Math.random() < 0.2;
  const isCorrectAnswer = isPowerUp ? false : Math.random() < 0.5;
  
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
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx
    }
  }
  
  const getSpeedByDifficulty = () => {
    const baseSpeed = 6;
    const randomVariation = Math.random() * 2;
    
<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
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
=======
    switch (difficultyLevel) {
      case 'Easy':
        return baseSpeed + randomVariation;
      case 'Medium':
        return baseSpeed + randomVariation + 2;
      case 'Hard':
        return baseSpeed + randomVariation + 4;
      default:
        return baseSpeed + randomVariation;
    }
  };
  
  const newFruit = {
    id: Date.now() + Math.random(),
    x: Math.random() * (800 - 80), // Ensure fruit doesn't spawn too close to edge
    y: -80,
    number,
    type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
    isCorrect: isCorrectAnswer,
    isPowerUp,
    powerType,
    cut: false,
    rotation: Math.random() * 360,
    speed: getSpeedByDifficulty(),
    rotationSpeed: 1 + Math.random() * 3 // Add rotation speed variety
  };
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx

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

<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
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
=======
  // Web Audio Context and sound buffers
const audioContextRef = useRef(null);
const soundBuffersRef = useRef({});
const [audioInitialized, setAudioInitialized] = useState(false);

// Initialize Web Audio Context and load sounds
useEffect(() => {
  const initializeAudio = async () => {
    try {
      // Create AudioContext
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load sound files
      const soundUrls = {
        cut: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', // Replace with your MP3 URL
        powerup: 'https://www.soundjay.com/misc/sounds/magic-chime-02.mp3', // Replace with your MP3 URL
        correct: 'https://www.soundjay.com/misc/sounds/success-2.mp3', // Replace with your MP3 URL
        wrong: 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3', // Replace with your MP3 URL
        achievement: 'https://www.soundjay.com/misc/sounds/achievement-2.mp3' // Replace with your MP3 URL
      };

      // Load each sound file
      for (const [soundType, url] of Object.entries(soundUrls)) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          soundBuffersRef.current[soundType] = audioBuffer;
          console.log(`Loaded sound: ${soundType}`);
        } catch (error) {
          console.warn(`Failed to load ${soundType} sound:`, error);
          // Create a simple beep sound as fallback
          soundBuffersRef.current[soundType] = createBeepSound(audioContextRef.current, soundType);
        }
      }
      
      setAudioInitialized(true);
      console.log('Web Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio:', error);
      // Fallback to HTML5 Audio
      setAudioInitialized(false);
    }
  };

  initializeAudio();

  // Cleanup
  return () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };
}, []);

// Create fallback beep sounds programmatically
const createBeepSound = (audioContext, soundType) => {
  const sampleRate = audioContext.sampleRate;
  const duration = soundType === 'cut' ? 0.2 : 0.3;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Different frequencies for different sound types
  const frequencies = {
    cut: [800, 600], // Two-tone slice sound
    powerup: [523, 659, 784], // C-E-G chord
    correct: [880, 1100], // Happy ascending tones
    wrong: [220, 180], // Sad descending tones
    achievement: [523, 659, 784, 988] // Victory chord
  };

  const freqs = frequencies[soundType] || [440];
  
  for (let i = 0; i < length; i++) {
    let value = 0;
    freqs.forEach((freq, index) => {
      const time = i / sampleRate;
      const fadeOut = 1 - (time / duration);
      value += Math.sin(2 * Math.PI * freq * time) * fadeOut * (0.3 / freqs.length);
    });
    data[i] = value;
  }

  return buffer;
};

// Enhanced playSound function with Web Audio
const playSound = (soundType, volume = 0.5) => {
  if (!soundEnabled) return;
  
  if (audioInitialized && audioContextRef.current && soundBuffersRef.current[soundType]) {
    try {
      // Resume AudioContext if suspended (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create source and gain nodes
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = soundBuffersRef.current[soundType];
      gainNode.gain.value = volume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Add some effects for different sound types
      if (soundType === 'powerup') {
        // Add reverb-like effect for powerups
        const delay = audioContextRef.current.createDelay();
        delay.delayTime.value = 0.1;
        const feedback = audioContextRef.current.createGain();
        feedback.gain.value = 0.3;
        
        source.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(gainNode);
      }
      
      // Play sound
      source.start(0);
      console.log(`Playing Web Audio sound: ${soundType}`);
    } catch (error) {
      console.error('Error playing Web Audio sound:', error);
      fallbackPlaySound(soundType, volume);
    }
  } else {
    fallbackPlaySound(soundType, volume);
  }
};

// Fallback to HTML5 Audio if Web Audio fails
const fallbackPlaySound = (soundType, volume = 0.5) => {
  console.log(`Playing fallback sound: ${soundType}`);
  
  // Create simple audio beeps using oscillator (if available)
  if (window.AudioContext || window.webkitAudioContext) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      const frequencies = {
        cut: 800,
        powerup: 1200,
        correct: 880,
        wrong: 220,
        achievement: 1000
      };
      
      oscillator.frequency.value = frequencies[soundType] || 440;
      oscillator.type = soundType === 'powerup' ? 'sawtooth' : 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Fallback audio also failed:', error);
    }
  }
};

// Updated collision detection with enhanced effects
function checkFruitCollisions(handX, handY) {
  setGameState(prev => {
    console.log('Collision check - current lives:', prev.lives);
    
    let hasChanges = false;
    const updatedFruits = prev.fruits.map(fruit => {
      if (fruit.cut) return fruit;
      
      const distance = Math.sqrt(
        Math.pow(handX - (fruit.x + 40), 2) + 
        Math.pow(handY - (fruit.y + 40), 2)
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx
      );
      
      if (distance < 50) {
        hasChanges = true;
        playSound('cut', 0.7);
        
<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
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
=======
        // Calculate velocity for more realistic effects
        const velocity = tracingPath.current.length > 1 ? {
          x: tracingPath.current[tracingPath.current.length - 1].x - tracingPath.current[tracingPath.current.length - 2].x,
          y: tracingPath.current[tracingPath.current.length - 1].y - tracingPath.current[tracingPath.current.length - 2].y
        } : { x: 0, y: 0 };
        
        createFruitNinjaSlashEffect(fruit.x + 40, fruit.y + 40, fruit.isPowerUp ? 'powerup' : 'normal', velocity);
        createFruitNinjaExplosion(fruit.x + 40, fruit.y + 40, fruit.isPowerUp);
        createFruitNinjaJuiceSplash(fruit.x + 40, fruit.y + 40, fruit.type, fruit.isPowerUp, velocity);
        
        // Screen shake for powerful cuts
        if (combo > 3) {
          const gameArea = document.querySelector('.game-area');
          if (gameArea) {
            gameArea.classList.add('shake');
            setTimeout(() => gameArea.classList.remove('shake'), 200);
          }
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx
        }
        
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
        showPowerUpActivation();
      } else if (fruit.isCorrect) {
        const basePoints = 10;
        const comboBonus = Math.floor(basePoints * (newCombo * 0.5));
        const doublePoints = powerUps.some(p => p.name === 'Double Points');
        const totalPoints = (basePoints + comboBonus) * (doublePoints ? 2 : 1);
        newScore += totalPoints;
        newCombo += 1;
        shouldGenerateNewProblem = true;
        setCorrectAnswers(prev => prev + 1);
        playSound('correct');
        
        if (newCombo > 2) {
          showComboDisplay(newCombo);
        }
      } else {
        const hasShield = powerUps.some(p => p.name === 'Shield');
        if (!hasShield) {
          newLives = Math.max(0, newLives - 1);
          console.log('Lives decremented by collision:', prev.lives, '->', newLives);
        }
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

// ADD THIS at the very end of checkFruitCollisions, before the closing bracket:
    
    // Track for adaptive difficulty
    if (typeof AdaptiveDifficultySystem?.recordPlayerAction === 'function') {
      newlyCut.forEach(fruit => {
        AdaptiveDifficultySystem.recordPlayerAction({
          handPosition: { x: handX / 800, y: handY / 600 },
          fruitPosition: { x: fruit.x, y: fruit.y },
          accuracy: fruit.isCorrect ? 1 : 0,
          responseTime: Date.now() - (fruit.spawnTime || Date.now()),
          success: fruit.isCorrect || fruit.isPowerUp
        });
      });
    }
}

// Enhanced explosion with more particles
const createFruitNinjaExplosion = (x, y, isPowerUp = false) => {
  const particleCount = isPowerUp ? 20 : 12;
  const colors = isPowerUp 
    ? ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'] 
    : ['#ff4b4b', '#ffa500', '#ffe135', '#ff69b4'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = isPowerUp ? 'fruit-explosion powerup' : 'fruit-explosion';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = Math.random() * 2 * Math.PI;
    const distance = (isPowerUp ? 80 : 60) + Math.random() * 40;
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.appendChild(particle);
      setTimeout(() => particle.remove(), isPowerUp ? 1200 : 800);
    }
  }
 
};

// Show combo display
const showComboDisplay = (comboCount) => {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;
  
  // Remove existing combo display
  const existingCombo = gameArea.querySelector('.combo-display');
  if (existingCombo) {
    existingCombo.remove();
  }
  
  const comboDisplay = document.createElement('div');
  comboDisplay.className = 'combo-display';
  comboDisplay.innerHTML = `<div class="combo-text">${comboCount}x COMBO!</div>`;
  
  gameArea.appendChild(comboDisplay);
  
  setTimeout(() => {
    if (comboDisplay.parentNode) {
      comboDisplay.remove();
    }
  }, 2000);
};

// Show power-up activation effect
const showPowerUpActivation = () => {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;
  
  const powerupEffect = document.createElement('div');
  powerupEffect.className = 'powerup-activation';
  
  gameArea.appendChild(powerupEffect);
  
  setTimeout(() => {
    if (powerupEffect.parentNode) {
      powerupEffect.remove();
    }
  }, 800);
};

// Add velocity-based cursor effects
const updateSwordCursor = () => {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;
  
  let cursor = gameArea.querySelector('.sword-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'sword-cursor';
    gameArea.appendChild(cursor);
  }
  
  if (tracingPath.current.length > 0) {
    const lastPoint = tracingPath.current[tracingPath.current.length - 1];
    cursor.style.left = (lastPoint.x - 10) + 'px';
    cursor.style.top = (lastPoint.y - 10) + 'px';
    
    // Add velocity-based effects
    if (lastPoint.velocity > 15) {
      cursor.classList.add('high-velocity');
    } else {
      cursor.classList.remove('high-velocity');
    }
    
    // Add combo effects
    if (combo > 2) {
      cursor.classList.add('combo-active');
    } else {
      cursor.classList.remove('combo-active');
    }
    
    cursor.style.display = 'block';
  } else {
    cursor.style.display = 'none';
  }
};


// Enhanced slash effect with velocity-based properties
const createFruitNinjaSlashEffect = (x, y, type = 'normal', velocity = { x: 0, y: 0 }) => {
  const slashId = Date.now() + Math.random();
  
  // Calculate angle based on velocity
  const angle = velocity.x !== 0 || velocity.y !== 0 
    ? Math.atan2(velocity.y, velocity.x) * 180 / Math.PI 
    : Math.random() * 360;
    
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  const length = type === 'powerup' ? 140 + speed * 2 : 100 + speed;
  
  const newSlash = {
    id: slashId,
    x: x - length / 2,
    y: y - 3,
    width: length,
    rotation: angle,
    type
  };
  
  setSlashEffects(prev => [...prev, newSlash]);
  
  // Enhanced sparks based on velocity
  const sparkCount = type === 'powerup' ? 15 + Math.floor(speed / 5) : 8 + Math.floor(speed / 8);
  for (let i = 0; i < sparkCount; i++) {
    const sparkId = Date.now() + Math.random() + i;
    const sparkAngle = (angle + (Math.random() - 0.5) * 90) * Math.PI / 180;
    const sparkDistance = (type === 'powerup' ? 60 : 40) + speed + Math.random() * 30;
    const sparkX = Math.cos(sparkAngle) * sparkDistance;
    const sparkY = Math.sin(sparkAngle) * sparkDistance;
    
    const spark = {
      id: sparkId,
      x: x - 4,
      y: y - 4,
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

// MASSIVELY ENHANCED: Fruit Ninja style juice splash
const createFruitNinjaJuiceSplash = (x, y, fruitType, isPowerUp = false, velocity = { x: 0, y: 0 }) => {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;

  // Fruit-specific juice colors and properties
  const juiceProperties = {
    Apple: { 
      colors: ['#FF4444', '#FF6B6B', '#FF8E8E'], 
      seeds: ['#8B4513', '#654321'],
      pulp: '#FFB6C1'
    },
    Pomegranate: { 
      colors: ['#DC143C', '#B22222', '#8B0000'], 
      seeds: ['#4B0000', '#2F0000'],
      pulp: '#FF69B4'
    },
    Pineapple: { 
      colors: ['#FFD700', '#FFA500', '#FF8C00'], 
      seeds: ['#8B4513', '#A0522D'],
      pulp: '#FFFF99'
    },
    Watermelon: { 
      colors: ['#FF69B4', '#FF1493', '#DC143C'], 
      seeds: ['#000000', '#2F2F2F'],
      pulp: '#98FB98'
    }
  };

  const juice = juiceProperties[fruitType] || juiceProperties.Apple;
  
  if (isPowerUp) {
    // Special rainbow effect for power-ups
    juice.colors = ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500'];
  }

  // Create main juice splash particles
  const splashCount = isPowerUp ? 25 : 15;
  for (let i = 0; i < splashCount; i++) {
    const splash = document.createElement('div');
    splash.className = isPowerUp ? 'fruit-ninja-juice powerup' : 'fruit-ninja-juice';
    splash.style.position = 'absolute';
    splash.style.pointerEvents = 'none';
    splash.style.zIndex = '12';
    
    // Random splash properties
    const size = 8 + Math.random() * 12;
    splash.style.width = size + 'px';
    splash.style.height = size + 'px';
    splash.style.borderRadius = '50%';
    
    // Color selection
    const color = juice.colors[Math.floor(Math.random() * juice.colors.length)];
    splash.style.background = isPowerUp ? 
      `radial-gradient(circle, ${color}, ${juice.colors[Math.floor(Math.random() * juice.colors.length)]})` :
      `radial-gradient(circle, ${color}, ${color}88)`;
    
    // Position
    splash.style.left = (x - size/2) + 'px';
    splash.style.top = (y - size/2) + 'px';
    
    // Physics-based trajectory
    const angle = Math.random() * 2 * Math.PI;
    const speed = 100 + Math.random() * 200;
    const gravity = 300;
    const dx = Math.cos(angle) * speed + velocity.x * 50;
    const dy = Math.sin(angle) * speed + velocity.y * 50;
    
    splash.style.setProperty('--dx', dx + 'px');
    splash.style.setProperty('--dy', dy + 'px');
    splash.style.setProperty('--gravity', gravity + 'px');
    
    gameArea.appendChild(splash);
    setTimeout(() => splash.remove(), 1500);
  }

  // Create fruit seeds
  const seedCount = fruitType === 'Watermelon' ? 8 : fruitType === 'Pomegranate' ? 12 : 3;
  for (let i = 0; i < seedCount; i++) {
    const seed = document.createElement('div');
    seed.className = 'fruit-ninja-seed';
    seed.style.position = 'absolute';
    seed.style.pointerEvents = 'none';
    seed.style.zIndex = '11';
    
    const seedSize = 3 + Math.random() * 4;
    seed.style.width = seedSize + 'px';
    seed.style.height = seedSize + 'px';
    seed.style.borderRadius = fruitType === 'Watermelon' ? '50%' : '20%';
    seed.style.background = juice.seeds[Math.floor(Math.random() * juice.seeds.length)];
    
    seed.style.left = (x - seedSize/2) + 'px';
    seed.style.top = (y - seedSize/2) + 'px';
    
    const angle = Math.random() * 2 * Math.PI;
    const speed = 80 + Math.random() * 120;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    
    seed.style.setProperty('--dx', dx + 'px');
    seed.style.setProperty('--dy', dy + 'px');
    seed.style.setProperty('--gravity', '400px');
    
    gameArea.appendChild(seed);
    setTimeout(() => seed.remove(), 2000);
  }

  // Create fruit pulp chunks
  const pulpCount = 6;
  for (let i = 0; i < pulpCount; i++) {
    const pulp = document.createElement('div');
    pulp.className = 'fruit-ninja-pulp';
    pulp.style.position = 'absolute';
    pulp.style.pointerEvents = 'none';
    pulp.style.zIndex = '10';
    
    const pulpSize = 6 + Math.random() * 8;
    pulp.style.width = pulpSize + 'px';
    pulp.style.height = pulpSize + 'px';
    pulp.style.borderRadius = '30%';
    pulp.style.background = juice.pulp;
    pulp.style.opacity = '0.8';
    
    pulp.style.left = (x - pulpSize/2) + 'px';
    pulp.style.top = (y - pulpSize/2) + 'px';
    
    const angle = Math.random() * 2 * Math.PI;
    const speed = 60 + Math.random() * 100;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 50; // Slight upward bias
    
    pulp.style.setProperty('--dx', dx + 'px');
    pulp.style.setProperty('--dy', dy + 'px');
    pulp.style.setProperty('--gravity', '250px');
    
    gameArea.appendChild(pulp);
    setTimeout(() => pulp.remove(), 1800);
  }

  // Create juice streaks for dramatic effect
  for (let i = 0; i < 3; i++) {
    const streak = document.createElement('div');
    streak.className = 'fruit-ninja-streak';
    streak.style.position = 'absolute';
    streak.style.pointerEvents = 'none';
    streak.style.zIndex = '9';
    
    const width = 40 + Math.random() * 60;
    const height = 4 + Math.random() * 6;
    streak.style.width = width + 'px';
    streak.style.height = height + 'px';
    streak.style.borderRadius = height/2 + 'px';
    
    const color = juice.colors[0];
    streak.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
    
    const angle = Math.random() * 2 * Math.PI;
    streak.style.transform = `rotate(${angle}rad)`;
    streak.style.left = (x - width/2) + 'px';
    streak.style.top = (y - height/2) + 'px';
    
    gameArea.appendChild(streak);
    setTimeout(() => streak.remove(), 1200);
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

// Initialize Enhanced Systems
useEffect(() => {
  const initializeSystems = async () => {
    try {
      AdaptiveDifficultySystem.initialize?.();
      await AdvancedAudioSystem.initialize?.();
      AccessibilityFeatures.initialize?.();
      AdvancedParticleSystem.initialize?.();
      console.log('Enhanced systems initialized');
    } catch (error) {
      console.warn('Some enhanced systems failed to initialize:', error);
    }
  };
  
  initializeSystems();
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
      modelComplexity: 0, // Reduced from 1 for better performance
      minDetectionConfidence: 0.5, // Reduced for better tracking
      minTrackingConfidence: 0.5, // Reduced for better tracking
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


// Replace the onResults function and related functions in GameScreen.jsx

// Enhanced hand tracking with Fruit Ninja style effects
function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    // Clear the trail when no hand is detected
    tracingPath.current = [];
    return;
  }
  
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
  
// // Enhanced gesture recognition
// const gesture = GestureRecognition?.analyzeGesture?.(landmarks);
// if (gesture) {
//   console.log('Special gesture detected:', gesture);
//   // Add visual feedback for gestures
//   const gameArea = document.querySelector('.game-area');
//   if (gameArea) {
//     const gestureIndicator = document.createElement('div');
//     gestureIndicator.className = 'gesture-indicator';
//     gestureIndicator.textContent = gesture === 'peace' ? '✌️' : gesture === 'thumbsup' ? '👍' : '✊';
//     gestureIndicator.style.left = (emaPos.current.x - 25) + 'px';
//     gestureIndicator.style.top = (emaPos.current.y - 25) + 'px';
//     gameArea.appendChild(gestureIndicator);
//     setTimeout(() => gestureIndicator.remove(), 1000);
//   }
// }

  // Enhanced coordinate mapping with proper bounds expansion
  const expandedX = Math.max(-0.1, Math.min(1.1, (tip.x - 0.15) / 0.7)); 
  const expandedY = Math.max(-0.1, Math.min(1.1, (tip.y - 0.15) / 0.7)); 
  
  const gameArea = document.querySelector('.game-area');
  const gameRect = gameArea ? gameArea.getBoundingClientRect() : { width: 800, height: 600 };
  
  const rawX = (1 - expandedX) * gameRect.width;
  const rawY = expandedY * gameRect.height;

  if (showWebcam) {
    const overlay = document.querySelector('.webcam-overlay');
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    drawHandSkeleton(ctx, landmarks, overlay.width, overlay.height);

    const alpha = 0.15;
    emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x;
    emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y;

    emaPos.current.x = Math.max(-10, Math.min(gameRect.width + 10, emaPos.current.x));
    emaPos.current.y = Math.max(-10, Math.min(gameRect.height + 10, emaPos.current.y));

    checkFruitCollisions(emaPos.current.x, emaPos.current.y);
    drawFruitNinjaTrackingOnGameCanvas(emaPos.current.x, emaPos.current.y);
  } else {
    if (!overlayRef.current) return;
    const ctx = overlayRef.current.getContext('2d');
    
    if (overlayRef.current.width !== gameRect.width || overlayRef.current.height !== gameRect.height) {
      overlayRef.current.width = gameRect.width;
      overlayRef.current.height = gameRect.height;
      overlayRef.current.style.width = gameRect.width + 'px';
      overlayRef.current.style.height = gameRect.height + 'px';
    }
    
    ctx.clearRect(0, 0, gameRect.width, gameRect.height);

    const alpha = 0.15;
    emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x;
    emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y;

    emaPos.current.x = Math.max(-10, Math.min(gameRect.width + 10, emaPos.current.x));
    emaPos.current.y = Math.max(-10, Math.min(gameRect.height + 10, emaPos.current.y));

    // Add current position to trail with velocity calculation
    const now = Date.now();
    if (tracingPath.current.length > 0) {
      const lastPoint = tracingPath.current[tracingPath.current.length - 1];
      const distance = Math.sqrt(
        Math.pow(emaPos.current.x - lastPoint.x, 2) + 
        Math.pow(emaPos.current.y - lastPoint.y, 2)
      );
      const velocity = distance / ((now - lastPoint.timestamp) || 1);
      
      tracingPath.current.push({
        x: emaPos.current.x,
        y: emaPos.current.y,
        timestamp: now,
        velocity: velocity
      });
    } else {
      tracingPath.current.push({
        x: emaPos.current.x,
        y: emaPos.current.y,
        timestamp: now,
        velocity: 0
      });
<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx

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
=======
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx
    }

    // Keep only recent points for the trail
    tracingPath.current = tracingPath.current.filter(
      point => now - point.timestamp < 500 // Shorter, more dynamic trail
    );

    // Draw Fruit Ninja style sword trail
    drawFruitNinjaSwordTrail(ctx, tracingPath.current, combo);

    checkFruitCollisions(emaPos.current.x, emaPos.current.y);
  }
}

// UPDATED: Enhanced drawFruitNinjaTrackingOnGameCanvas
function drawFruitNinjaTrackingOnGameCanvas(gameX, gameY) {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;
  
  const gameRect = gameArea.getBoundingClientRect();
  
  let mainCanvas = gameArea.querySelector('.main-tracking-canvas');
  if (!mainCanvas) {
    mainCanvas = document.createElement('canvas');
    mainCanvas.className = 'main-tracking-canvas';
    mainCanvas.style.position = 'absolute';
    mainCanvas.style.top = '0';
    mainCanvas.style.left = '0';
    mainCanvas.style.pointerEvents = 'none';
    mainCanvas.style.zIndex = '15';
    gameArea.appendChild(mainCanvas);
  }
  
  if (mainCanvas.width !== gameRect.width || mainCanvas.height !== gameRect.height) {
    mainCanvas.width = gameRect.width;
    mainCanvas.height = gameRect.height;
    mainCanvas.style.width = gameRect.width + 'px';
    mainCanvas.style.height = gameRect.height + 'px';
  }
  
  const ctx = mainCanvas.getContext('2d');
  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  
  const now = Date.now();
  if (tracingPath.current.length > 0) {
    const lastPoint = tracingPath.current[tracingPath.current.length - 1];
    const distance = Math.sqrt(
      Math.pow(gameX - lastPoint.x, 2) + 
      Math.pow(gameY - lastPoint.y, 2)
    );
    const velocity = distance / ((now - lastPoint.timestamp) || 1);
    
    tracingPath.current.push({ 
      x: gameX, 
      y: gameY, 
      timestamp: now,
      velocity: velocity
    });
  } else {
    tracingPath.current.push({ 
      x: gameX, 
      y: gameY, 
      timestamp: now,
      velocity: 0
    });
  }
  
  tracingPath.current = tracingPath.current.filter(point => now - point.timestamp < 500);
  
  drawFruitNinjaSwordTrail(ctx, tracingPath.current, combo);
}


// NEW: Fruit Ninja style sword trail drawing
function drawFruitNinjaSwordTrail(ctx, trail, combo) {
  if (trail.length < 2) return;
  
  ctx.save();
  
  // Create gradient for the sword trail
  const gradient = ctx.createLinearGradient(
    trail[0].x, trail[0].y,
    trail[trail.length - 1].x, trail[trail.length - 1].y
  );
  
  if (combo > 2) {
    // Golden trail for high combo
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 1)');
  } else {
    // Blue-white trail for normal
    gradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
    gradient.addColorStop(0.3, 'rgba(135, 206, 250, 0.6)');
    gradient.addColorStop(0.7, 'rgba(100, 149, 237, 0.8)');
    gradient.addColorStop(1, 'rgba(65, 105, 225, 1)');
  }
  
  // Draw multiple layers for glow effect
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = (layer === 0 ? 15 : layer === 1 ? 8 : 3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = (layer === 0 ? 0.3 : layer === 1 ? 0.6 : 1.0);
    ctx.shadowBlur = layer === 0 ? 20 : 0;
    ctx.shadowColor = combo > 2 ? '#FFD700' : '#4169E1';
    
    // Draw smooth curves through trail points
    if (trail.length >= 2) {
      ctx.moveTo(trail[0].x, trail[0].y);
      
      for (let i = 1; i < trail.length - 1; i++) {
        const current = trail[i];
        const next = trail[i + 1];
        const cpx = (current.x + next.x) / 2;
        const cpy = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, cpx, cpy);
      }
      
      // Draw to the last point
      if (trail.length > 1) {
        const lastPoint = trail[trail.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }
    }
    
    ctx.stroke();
  }
  
  // Draw sword tip
  const tip = trail[trail.length - 1];
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 10;
  ctx.shadowColor = combo > 2 ? '#FFD700' : '#FFFFFF';
  
  const tipGradient = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 25);
  tipGradient.addColorStop(0, combo > 2 ? '#FFD700' : '#FFFFFF');
  tipGradient.addColorStop(0.5, combo > 2 ? '#FFA500' : '#87CEEB');
  tipGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = tipGradient;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 25, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner bright core
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}


// ALSO UPDATE: Enhanced drawTrackingOnGameCanvas function
function drawTrackingOnGameCanvas(gameX, gameY) {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;
  
  // Get actual game area dimensions
  const gameRect = gameArea.getBoundingClientRect();
  
  let mainCanvas = gameArea.querySelector('.main-tracking-canvas');
  if (!mainCanvas) {
    mainCanvas = document.createElement('canvas');
    mainCanvas.className = 'main-tracking-canvas';
    mainCanvas.style.position = 'absolute';
    mainCanvas.style.top = '0';
    mainCanvas.style.left = '0';
    mainCanvas.style.pointerEvents = 'none';
    mainCanvas.style.zIndex = '15';
    gameArea.appendChild(mainCanvas);
  }
  
  // Update canvas size to match game area
  if (mainCanvas.width !== gameRect.width || mainCanvas.height !== gameRect.height) {
    mainCanvas.width = gameRect.width;
    mainCanvas.height = gameRect.height;
    mainCanvas.style.width = gameRect.width + 'px';
    mainCanvas.style.height = gameRect.height + 'px';
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

<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
  setGameTimer(timer);
  return () => clearInterval(timer);
}, [setGameState, setGameTimer, endGame]);
=======
  if (setGameTimer && typeof setGameTimer === 'function') {
    setGameTimer(timer);
  }
  
  return () => {
    console.log('Timer effect cleanup');onResults
    clearInterval(timer);
  };
}, [running]);
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx

  // Enhanced fruit spawning with difficulty scaling
  useEffect(() => {
    const getSpawnRate = () => {
<<<<<<< Updated upstream:frontend/Math_Ninja/Frontend/src/components/GameScreen.jsx
      const baseRate = 2000;
      const difficultyMultiplier = difficultyLevel === 'Easy' ? 1.2 : difficultyLevel === 'Hard' ? 0.8 : 1;
=======
      const baseRate = 500;
      const difficultyMultiplier = difficultyLevel === 'Easy' ? 1.0 : difficultyLevel === 'Hard' ? 0.5 : 2.0;
>>>>>>> Stashed changes:frontend/src/components/GameScreen.jsx
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
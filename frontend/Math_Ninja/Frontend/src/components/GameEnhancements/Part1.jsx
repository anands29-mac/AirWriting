// PART 1: Advanced Game Mechanics & AI Features

// 1. ADAPTIVE DIFFICULTY AI
const AdaptiveDifficultySystem = {
  playerMetrics: {
    accuracy: 0,
    avgResponseTime: 0,
    streakCount: 0,
    missedFruits: 0,
    totalAttempts: 0
  },

  calculateDifficultyScore() {
    const accuracy = this.playerMetrics.accuracy;
    const speed = Math.max(0, 5000 - this.playerMetrics.avgResponseTime) / 5000;
    const consistency = Math.min(this.playerMetrics.streakCount / 10, 1);
    
    return (accuracy * 0.5 + speed * 0.3 + consistency * 0.2) * 100;
  },

  adjustDifficulty(currentScore) {
    const difficultyScore = this.calculateDifficultyScore();
    
    if (difficultyScore > 80) {
      return {
        fruitSpeed: 1.3,
        spawnRate: 0.7,
        problemComplexity: 1.4,
        powerUpChance: 0.15
      };
    } else if (difficultyScore < 40) {
      return {
        fruitSpeed: 0.7,
        spawnRate: 1.3,
        problemComplexity: 0.8,
        powerUpChance: 0.3
      };
    }
    
    return { fruitSpeed: 1, spawnRate: 1, problemComplexity: 1, powerUpChance: 0.2 };
  }
};

// 2. GESTURE RECOGNITION SYSTEM
const GestureRecognition = {
  gestureHistory: [],
  recognizedGestures: new Set(),

  analyzeGesture(handLandmarks) {
    const fingers = this.getFingerStates(handLandmarks);
    const palm = handLandmarks[0];
    const wrist = handLandmarks[0];
    
    // Advanced gesture detection
    if (this.isPeaceSign(fingers)) {
      this.triggerGestureEffect('peace', palm);
      return 'peace';
    }
    
    if (this.isThumbsUp(fingers, handLandmarks)) {
      this.triggerGestureEffect('thumbsup', palm);
      return 'thumbsup';
    }
    
    if (this.isFist(fingers)) {
      this.triggerGestureEffect('fist', palm);
      return 'fist';
    }
    
    if (this.isOkSign(fingers, handLandmarks)) {
      this.triggerGestureEffect('ok', palm);
      return 'ok';
    }
    
    return null;
  },

  getFingerStates(landmarks) {
    return {
      thumb: landmarks[4].y < landmarks[3].y,
      index: landmarks[8].y < landmarks[6].y,
      middle: landmarks[12].y < landmarks[10].y,
      ring: landmarks[16].y < landmarks[14].y,
      pinky: landmarks[20].y < landmarks[18].y
    };
  },

  isPeaceSign(fingers) {
    return fingers.index && fingers.middle && !fingers.ring && !fingers.pinky;
  },

  isThumbsUp(fingers, landmarks) {
    return fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
  },

  isFist(fingers) {
    return !fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
  },

  isOkSign(fingers, landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
    );
    return distance < 0.05 && fingers.middle && fingers.ring && fingers.pinky;
  },

  triggerGestureEffect(gesture, position) {
    console.log(`Gesture detected: ${gesture}`);
    // Trigger special effects based on gesture
    switch(gesture) {
      case 'peace':
        this.activateTimeSlowEffect();
        break;
      case 'thumbsup':
        this.activateScoreMultiplierEffect();
        break;
      case 'fist':
        this.activateExplosiveEffect();
        break;
      case 'ok':
        this.activatePrecisionModeEffect();
        break;
    }
  },

  activateTimeSlowEffect() {
    // Slow down time for 5 seconds
    console.log('Time slow effect activated!');
  },

  activateScoreMultiplierEffect() {
    // Double score for next 3 correct answers
    console.log('Score multiplier activated!');
  },

  activateExplosiveEffect() {
    // Cut all fruits on screen
    console.log('Explosive cut activated!');
  },

  activatePrecisionModeEffect() {
    // Show trajectory lines to help aim
    console.log('Precision mode activated!');
  }
};

// 3. PHYSICS-BASED FRUIT SPAWNING
const PhysicsSystem = {
  gravity: 0.3,
  wind: { x: 0, y: 0 },
  turbulence: 0.1,

  createRealisticFruit(baseProps) {
    const fruit = {
      ...baseProps,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * -2 - 3
      },
      angularVelocity: (Math.random() - 0.5) * 8,
      bounce: 0.6,
      friction: 0.98,
      mass: 1 + Math.random() * 0.5,
      airResistance: 0.01
    };

    return fruit;
  },

  updateFruitPhysics(fruit, deltaTime) {
    // Apply gravity
    fruit.velocity.y += this.gravity * deltaTime * fruit.mass;
    
    // Apply wind
    fruit.velocity.x += this.wind.x * deltaTime;
    fruit.velocity.y += this.wind.y * deltaTime;
    
    // Apply air resistance
    fruit.velocity.x *= (1 - this.airResistance * deltaTime);
    fruit.velocity.y *= (1 - this.airResistance * deltaTime);
    
    // Add turbulence
    fruit.velocity.x += (Math.random() - 0.5) * this.turbulence;
    fruit.velocity.y += (Math.random() - 0.5) * this.turbulence;
    
    // Update position
    fruit.x += fruit.velocity.x * deltaTime;
    fruit.y += fruit.velocity.y * deltaTime;
    
    // Update rotation
    fruit.rotation += fruit.angularVelocity * deltaTime;
    
    // Boundary collisions
    this.handleBoundaryCollisions(fruit);
    
    return fruit;
  },

  handleBoundaryCollisions(fruit) {
    // Left and right walls
    if (fruit.x < 0 || fruit.x > 800) {
      fruit.velocity.x *= -fruit.bounce;
      fruit.x = Math.max(0, Math.min(800, fruit.x));
    }
    
    // Floor (optional bouncing)
    if (fruit.y > 600) {
      fruit.velocity.y *= -fruit.bounce;
      fruit.y = 600;
      fruit.velocity.x *= fruit.friction;
    }
  },

  createWeatherEffect(type) {
    switch(type) {
      case 'wind':
        this.wind = { x: Math.random() * 2 - 1, y: Math.random() * 0.5 };
        setTimeout(() => { this.wind = { x: 0, y: 0 }; }, 10000);
        break;
      case 'storm':
        this.turbulence = 0.5;
        setTimeout(() => { this.turbulence = 0.1; }, 15000);
        break;
      case 'calm':
        this.wind = { x: 0, y: 0 };
        this.turbulence = 0.05;
        break;
    }
  }
};

// 4. ADVANCED SCORING SYSTEM WITH ANALYTICS
const AdvancedScoring = {
  scoreBreakdown: {
    basePoints: 0,
    comboBonus: 0,
    speedBonus: 0,
    accuracyBonus: 0,
    gestureBonus: 0,
    perfectCutBonus: 0
  },

  calculateScore(fruit, cutInfo) {
    let score = 0;
    this.scoreBreakdown = { basePoints: 0, comboBonus: 0, speedBonus: 0, accuracyBonus: 0, gestureBonus: 0, perfectCutBonus: 0 };

    // Base points
    const basePoints = fruit.isPowerUp ? 25 : (fruit.isCorrect ? 10 : -5);
    score += basePoints;
    this.scoreBreakdown.basePoints = basePoints;

    if (fruit.isCorrect) {
      // Speed bonus (faster cuts = more points)
      if (cutInfo.responseTime < 2000) {
        const speedBonus = Math.floor((2000 - cutInfo.responseTime) / 100);
        score += speedBonus;
        this.scoreBreakdown.speedBonus = speedBonus;
      }

      // Perfect cut bonus (cutting exactly through center)
      if (cutInfo.accuracy > 0.9) {
        const perfectBonus = 15;
        score += perfectBonus;
        this.scoreBreakdown.perfectCutBonus = perfectBonus;
      }

      // Gesture bonus
      if (cutInfo.gesture) {
        const gestureBonus = 20;
        score += gestureBonus;
        this.scoreBreakdown.gestureBonus = gestureBonus;
      }

      // Combo multiplier
      const comboMultiplier = Math.min(cutInfo.combo * 0.5, 3);
      const comboBonus = Math.floor(score * comboMultiplier);
      score += comboBonus;
      this.scoreBreakdown.comboBonus = comboBonus;
    }

    return { totalScore: score, breakdown: this.scoreBreakdown };
  },

  generateScorePopup(x, y, scoreData) {
    const popup = document.createElement('div');
    popup.className = 'advanced-score-popup';
    popup.innerHTML = `
      <div class="score-main">+${scoreData.totalScore}</div>
      ${scoreData.breakdown.speedBonus > 0 ? `<div class="score-bonus speed">Speed: +${scoreData.breakdown.speedBonus}</div>` : ''}
      ${scoreData.breakdown.perfectCutBonus > 0 ? `<div class="score-bonus perfect">Perfect! +${scoreData.breakdown.perfectCutBonus}</div>` : ''}
      ${scoreData.breakdown.gestureBonus > 0 ? `<div class="score-bonus gesture">Gesture! +${scoreData.breakdown.gestureBonus}</div>` : ''}
      ${scoreData.breakdown.comboBonus > 0 ? `<div class="score-bonus combo">Combo! +${scoreData.breakdown.comboBonus}</div>` : ''}
    `;
    
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.appendChild(popup);
      setTimeout(() => popup.remove(), 2000);
    }
  }
};

// 5. MACHINE LEARNING PATTERN RECOGNITION
const MLPatternRecognition = {
  playerPatterns: [],
  predictionModel: null,

  recordPlayerAction(action) {
    this.playerPatterns.push({
      timestamp: Date.now(),
      handPosition: action.handPosition,
      fruitPosition: action.fruitPosition,
      accuracy: action.accuracy,
      responseTime: action.responseTime,
      gesture: action.gesture,
      success: action.success
    });

    // Keep only last 1000 actions for performance
    if (this.playerPatterns.length > 1000) {
      this.playerPatterns = this.playerPatterns.slice(-1000);
    }

    this.updatePredictionModel();
  },

  updatePredictionModel() {
    if (this.playerPatterns.length < 50) return;

    // Simple pattern analysis
    const recentPatterns = this.playerPatterns.slice(-100);
    
    // Analyze success patterns
    const successfulPatterns = recentPatterns.filter(p => p.success);
    const failedPatterns = recentPatterns.filter(p => !p.success);

    // Calculate optimal cutting zones
    this.optimalZones = this.calculateOptimalZones(successfulPatterns);
    
    // Predict difficulty adjustments
    this.predictedDifficulty = this.predictOptimalDifficulty(recentPatterns);
  },

  calculateOptimalZones(successfulPatterns) {
    const zones = {};
    
    successfulPatterns.forEach(pattern => {
      const zone = this.getZoneKey(pattern.fruitPosition);
      if (!zones[zone]) {
        zones[zone] = { count: 0, avgAccuracy: 0, avgTime: 0 };
      }
      
      zones[zone].count++;
      zones[zone].avgAccuracy = (zones[zone].avgAccuracy + pattern.accuracy) / 2;
      zones[zone].avgTime = (zones[zone].avgTime + pattern.responseTime) / 2;
    });
    
    return zones;
  },

  getZoneKey(position) {
    const zoneX = Math.floor(position.x / 100);
    const zoneY = Math.floor(position.y / 100);
    return `${zoneX}-${zoneY}`;
  },

  predictOptimalDifficulty(patterns) {
    const avgAccuracy = patterns.reduce((sum, p) => sum + (p.success ? 1 : 0), 0) / patterns.length;
    const avgResponseTime = patterns.reduce((sum, p) => sum + p.responseTime, 0) / patterns.length;
    
    if (avgAccuracy > 0.8 && avgResponseTime < 2000) {
      return 'increase';
    } else if (avgAccuracy < 0.4 || avgResponseTime > 4000) {
      return 'decrease';
    }
    
    return 'maintain';
  },

  getPlayerInsights() {
    if (this.playerPatterns.length < 20) {
      return { message: 'Keep playing to unlock insights!' };
    }

    const recent = this.playerPatterns.slice(-50);
    const insights = [];

    // Accuracy trend
    const earlyAccuracy = recent.slice(0, 25).filter(p => p.success).length / 25;
    const lateAccuracy = recent.slice(25).filter(p => p.success).length / 25;
    
    if (lateAccuracy > earlyAccuracy + 0.1) {
      insights.push('📈 Your accuracy is improving!');
    } else if (lateAccuracy < earlyAccuracy - 0.1) {
      insights.push('📉 Focus on accuracy over speed');
    }

    // Best performance zone
    if (this.optimalZones) {
      const bestZone = Object.entries(this.optimalZones)
        .sort(([,a], [,b]) => b.avgAccuracy - a.avgAccuracy)[0];
      if (bestZone) {
        insights.push(`🎯 You're most accurate in the ${bestZone[0]} zone`);
      }
    }

    // Response time analysis
    const avgResponseTime = recent.reduce((sum, p) => sum + p.responseTime, 0) / recent.length;
    if (avgResponseTime < 1500) {
      insights.push('⚡ Lightning fast reflexes!');
    } else if (avgResponseTime > 3000) {
      insights.push('🐢 Take your time, but try to be quicker');
    }

    return { insights, avgAccuracy: lateAccuracy, avgResponseTime };
  }
};

export { AdaptiveDifficultySystem, GestureRecognition, PhysicsSystem, AdvancedScoring, MLPatternRecognition };
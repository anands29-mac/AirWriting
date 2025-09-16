// PART 2: Visual Effects & UI Enhancements

// 1. DYNAMIC PARTICLE SYSTEM
const AdvancedParticleSystem = {
  particles: [],
  maxParticles: 500,

  createParticleExplosion(x, y, type, intensity = 1) {
    const particleCount = Math.floor(30 * intensity);
    const colors = this.getParticleColors(type);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        id: Date.now() + Math.random(),
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 15 * intensity,
        vy: (Math.random() - 0.5) * 15 * intensity,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 6 * intensity,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: type,
        gravity: type === 'fire' ? -0.1 : 0.2,
        bounce: type === 'spark' ? 0.8 : 0.3,
        trail: type === 'magic' ? [] : null
      };
      
      this.particles.push(particle);
    }
    
    // Limit particles for performance
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  },

  getParticleColors(type) {
    const colorSets = {
      fire: ['#FF4500', '#FF6347', '#FFD700', '#FF8C00'],
      ice: ['#87CEEB', '#4682B4', '#B0E0E6', '#FFFFFF'],
      magic: ['#9400D3', '#8A2BE2', '#DA70D6', '#FFB6C1'],
      spark: ['#FFD700', '#FFA500', '#FFFF00', '#FFFFFF'],
      juice: ['#FF1493', '#FF69B4', '#FF6347', '#FFA500'],
      explosion: ['#FF0000', '#FF4500', '#FFD700', '#FFA500']
    };
    return colorSets[type] || colorSets.spark;
  },

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Apply gravity
      particle.vy += particle.gravity * deltaTime;
      
      // Apply air resistance
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Update life
      particle.life -= particle.decay * deltaTime;
      
      // Handle bouncing
      if (particle.y > 600) {
        particle.y = 600;
        particle.vy *= -particle.bounce;
      }
      
      // Trail effect for magic particles
      if (particle.trail) {
        particle.trail.push({ x: particle.x, y: particle.y, life: particle.life });
        if (particle.trail.length > 10) particle.trail.shift();
      }
      
      return particle.life > 0;
    });
  },

  renderParticles(ctx) {
    ctx.save();
    
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      
      // Render trail for magic particles
      if (particle.trail && particle.trail.length > 1) {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.globalAlpha = particle.trail[i].life * 0.5;
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        ctx.stroke();
      }
      
      // Render particle
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      if (particle.type === 'magic' || particle.type === 'spark') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    ctx.restore();
  }
};

// 2. DYNAMIC BACKGROUND SYSTEM
const DynamicBackground = {
  currentTheme: 'default',
  parallaxLayers: [],
  weatherEffects: [],

  initializeBackground(theme = 'default') {
    this.currentTheme = theme;
    this.createParallaxLayers(theme);
    this.createWeatherEffects();
  },

  createParallaxLayers(theme) {
    const themes = {
      default: [
        { type: 'gradient', colors: ['#667eea', '#764ba2'], speed: 0 },
        { type: 'clouds', count: 5, speed: 0.1 },
        { type: 'mountains', height: 0.3, speed: 0.2 }
      ],
      volcano: [
        { type: 'gradient', colors: ['#FF4500', '#8B0000'], speed: 0 },
        { type: 'lava', intensity: 0.8, speed: 0.3 },
        { type: 'rocks', count: 8, speed: 0.4 }
      ],
      ocean: [
        { type: 'gradient', colors: ['#87CEEB', '#4682B4'], speed: 0 },
        { type: 'waves', amplitude: 20, speed: 0.2 },
        { type: 'bubbles', count: 15, speed: 0.1 }
      ],
      space: [
        { type: 'gradient', colors: ['#000428', '#004e92'], speed: 0 },
        { type: 'stars', count: 200, speed: 0.05 },
        { type: 'nebula', opacity: 0.3, speed: 0.1 }
      ]
    };

    this.parallaxLayers = themes[theme] || themes.default;
  },

  createWeatherEffects() {
    const weather = Math.random();
    
    if (weather < 0.3) {
      this.weatherEffects = this.createRainEffect();
    } else if (weather < 0.5) {
      this.weatherEffects = this.createSnowEffect();
    } else if (weather < 0.7) {
      this.weatherEffects = this.createWindEffect();
    }
  },

  createRainEffect() {
    const raindrops = [];
    for (let i = 0; i < 50; i++) {
      raindrops.push({
        x: Math.random() * 800,
        y: Math.random() * -600,
        speed: 5 + Math.random() * 3,
        length: 10 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
    return raindrops;
  },

  createSnowEffect() {
    const snowflakes = [];
    for (let i = 0; i < 30; i++) {
      snowflakes.push({
        x: Math.random() * 800,
        y: Math.random() * -600,
        speed: 1 + Math.random() * 2,
        size: 2 + Math.random() * 4,
        sway: Math.random() * 2 - 1,
        opacity: 0.6 + Math.random() * 0.4
      });
    }
    return snowflakes;
  },

  createWindEffect() {
    const leaves = [];
    for (let i = 0; i < 20; i++) {
      leaves.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 2 + Math.random() * 3,
        vy: -1 + Math.random() * 2,
        rotation: Math.random() * 360,
        rotationSpeed: 2 + Math.random() * 4,
        size: 5 + Math.random() * 10,
        color: ['#8FBC8F', '#228B22', '#32CD32', '#90EE90'][Math.floor(Math.random() * 4)]
      });
    }
    return leaves;
  },

  updateBackground(deltaTime) {
    // Update weather effects
    this.weatherEffects.forEach(effect => {
      if (effect.speed !== undefined) {
        effect.y += effect.speed * deltaTime;
        if (effect.y > 650) {
          effect.y = Math.random() * -100;
          effect.x = Math.random() * 800;
        }
      }
      
      if (effect.sway !== undefined) {
        effect.x += effect.sway * Math.sin(Date.now() * 0.001) * deltaTime;
      }
      
      if (effect.vx !== undefined) {
        effect.x += effect.vx * deltaTime;
        effect.y += effect.vy * deltaTime;
        effect.rotation += effect.rotationSpeed * deltaTime;
        
        if (effect.x > 850) {
          effect.x = -50;
          effect.y = Math.random() * 600;
        }
      }
    });
  },

  renderBackground(ctx) {
    ctx.save();
    
    // Render parallax layers
    this.parallaxLayers.forEach(layer => {
      ctx.globalAlpha = layer.opacity || 1;
      
      switch (layer.type) {
        case 'gradient':
          this.renderGradient(ctx, layer);
          break;
        case 'clouds':
          this.renderClouds(ctx, layer);
          break;
        case 'mountains':
          this.renderMountains(ctx, layer);
          break;
        case 'waves':
          this.renderWaves(ctx, layer);
          break;
        case 'stars':
          this.renderStars(ctx, layer);
          break;
      }
    });
    
    // Render weather effects
    this.renderWeatherEffects(ctx);
    
    ctx.restore();
  },

  renderGradient(ctx, layer) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    layer.colors.forEach((color, index) => {
      gradient.addColorStop(index / (layer.colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
  },

  renderWeatherEffects(ctx) {
    ctx.globalAlpha = 0.7;
    
    this.weatherEffects.forEach(effect => {
      if (effect.length !== undefined) {
        // Rain
        ctx.strokeStyle = `rgba(173, 216, 230, ${effect.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x - 3, effect.y + effect.length);
        ctx.stroke();
      } else if (effect.size !== undefined && effect.sway !== undefined) {
        // Snow
        ctx.fillStyle = `rgba(255, 255, 255, ${effect.opacity})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.color !== undefined) {
        // Wind leaves
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.rotation * Math.PI / 180);
        ctx.fillStyle = effect.color;
        ctx.fillRect(-effect.size/2, -effect.size/2, effect.size, effect.size);
        ctx.restore();
      }
    });
  }
};

// 3. ADVANCED UI ANIMATIONS
const UIAnimations = {
  activeAnimations: new Map(),

  animateScoreIncrease(element, oldScore, newScore) {
    const duration = 800;
    const startTime = Date.now();
    const scoreDiff = newScore - oldScore;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Eased progress
      const easedProgress = this.easeOutBounce(progress);
      const currentScore = Math.floor(oldScore + (scoreDiff * easedProgress));
      
      element.textContent = `Score: ${currentScore}`;
      
      // Add visual effects
      if (progress < 0.3) {
        element.style.transform = `scale(${1 + (0.3 * (1 - progress / 0.3))})`;
        element.style.color = '#FFD700';
      } else {
        element.style.transform = 'scale(1)';
        element.style.color = '';
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  },

  easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  createFloatingText(text, x, y, options = {}) {
    const element = document.createElement('div');
    element.textContent = text;
    element.className = 'floating-text';
    element.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: ${options.fontSize || '2rem'};
      font-weight: bold;
      color: ${options.color || '#FFD700'};
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 1000;
      animation: floatUp 2s ease-out forwards;
    `;

    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.appendChild(element);
      setTimeout(() => element.remove(), 2000);
    }
  },

  createShockwave(x, y, intensity = 1) {
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave-effect';
    shockwave.style.cssText = `
      position: absolute;
      left: ${x - 50}px;
      top: ${y - 50}px;
      width: 100px;
      height: 100px;
      border: 3px solid rgba(255, 215, 0, 0.8);
      border-radius: 50%;
      animation: shockwaveExpand ${0.8 * intensity}s ease-out forwards;
      pointer-events: none;
      z-index: 15;
    `;

    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.appendChild(shockwave);
      setTimeout(() => shockwave.remove(), 800 * intensity);
    }
  },

  morphElement(element, targetShape, duration = 1000) {
    const startTime = Date.now();
    const originalTransform = element.style.transform || '';
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = this.easeInOutCubic(progress);
      
      switch (targetShape) {
        case 'expand':
          element.style.transform = `${originalTransform} scale(${1 + easedProgress * 0.5})`;
          break;
        case 'shrink':
          element.style.transform = `${originalTransform} scale(${1 - easedProgress * 0.8})`;
          break;
        case 'rotate':
          element.style.transform = `${originalTransform} rotate(${easedProgress * 360}deg)`;
          break;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
      }
    };
    
    animate();
  },

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
};

// 4. CINEMATIC CAMERA EFFECTS
const CinematicEffects = {
  screenEffects: [],
  cameraShakeIntensity: 0,
  chromaAberration: 0,
  
  triggerSlowMotion(duration = 3000) {
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.classList.add('slow-motion');
      
      // Visual indicator
      this.createSlowMotionOverlay();
      
      setTimeout(() => {
        gameArea.classList.remove('slow-motion');
      }, duration);
    }
  },

  createSlowMotionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'slow-motion-overlay';
    overlay.innerHTML = `
      <div class="slow-mo-text">SLOW MOTION</div>
      <div class="slow-mo-ripples">
        <div class="ripple"></div>
        <div class="ripple"></div>
        <div class="ripple"></div>
      </div>
    `;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle, transparent 30%, rgba(0,100,200,0.1) 70%);
      pointer-events: none;
      z-index: 9999;
      animation: slowMotionFade 3s ease-out forwards;
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  },

  triggerScreenShake(intensity = 1, duration = 500) {
    this.cameraShakeIntensity = intensity;
    const gameArea = document.querySelector('.game-area');
    
    if (gameArea) {
      const shakeInterval = setInterval(() => {
        const shakeX = (Math.random() - 0.5) * 20 * this.cameraShakeIntensity;
        const shakeY = (Math.random() - 0.5) * 20 * this.cameraShakeIntensity;
        
        gameArea.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        
        this.cameraShakeIntensity *= 0.95;
        
        if (this.cameraShakeIntensity < 0.01) {
          clearInterval(shakeInterval);
          gameArea.style.transform = '';
        }
      }, 16);
      
      setTimeout(() => {
        clearInterval(shakeInterval);
        gameArea.style.transform = '';
      }, duration);
    }
  },

  addChromaticAberration(intensity = 0.5) {
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.style.filter = `
        drop-shadow(${intensity * 2}px 0px 0px rgba(255,0,0,0.5))
        drop-shadow(${-intensity * 2}px 0px 0px rgba(0,255,255,0.5))
      `;
      
      setTimeout(() => {
        gameArea.style.filter = '';
      }, 200);
    }
  },

  createImpactFrame(duration = 100) {
    const impactOverlay = document.createElement('div');
    impactOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 50%);
      pointer-events: none;
      z-index: 9998;
      animation: impactFlash ${duration}ms ease-out forwards;
    `;

    document.body.appendChild(impactOverlay);
    setTimeout(() => impactOverlay.remove(), duration);
  }
};

// 5. DYNAMIC LIGHTING SYSTEM
const DynamicLighting = {
  lightSources: [],
  ambientLight: { r: 100, g: 100, b: 120 },
  shadowsEnabled: true,

  addLightSource(x, y, radius, color, intensity = 1) {
    const light = {
      id: Date.now() + Math.random(),
      x, y, radius, color, intensity,
      flickering: false,
      pulseSpeed: 0
    };
    
    this.lightSources.push(light);
    return light.id;
  },

  removeLightSource(id) {
    this.lightSources = this.lightSources.filter(light => light.id !== id);
  },

  updateLighting() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Fill with ambient light
    ctx.fillStyle = `rgb(${this.ambientLight.r}, ${this.ambientLight.g}, ${this.ambientLight.b})`;
    ctx.fillRect(0, 0, 800, 600);
    
    // Add light sources
    this.lightSources.forEach(light => {
      const gradient = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      
      const intensity = light.intensity + (light.flickering ? Math.sin(Date.now() * 0.01) * 0.2 : 0);
      const alpha = Math.max(0, Math.min(1, intensity));
      
      gradient.addColorStop(0, `${light.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${light.color}00`);
      
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      ctx.globalCompositeOperation = 'source-over';
    });
    
    // Apply lighting to game area
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
      gameArea.style.backgroundImage = `url(${canvas.toDataURL()})`;
      gameArea.style.backgroundBlendMode = 'multiply';
    }
  },

  createLightningEffect() {
    // Add temporary bright light
    const lightId = this.addLightSource(
      Math.random() * 800,
      Math.random() * 600,
      400,
      '#ffffff',
      2
    );
    
    // Flash effect
    CinematicEffects.createImpactFrame(150);
    
    setTimeout(() => {
      this.removeLightSource(lightId);
    }, 150);
  },

  createFireworkLight(x, y) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const lightId = this.addLightSource(x, y, 200, color, 1.5);
    
    setTimeout(() => {
      this.removeLightSource(lightId);
    }, 1000);
  }
};

// Export the visual systems
export { 
  AdvancedParticleSystem, 
  DynamicBackground, 
  UIAnimations, 
  CinematicEffects, 
  DynamicLighting 
};
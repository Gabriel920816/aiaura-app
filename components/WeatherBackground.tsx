
import React, { useEffect, useRef } from 'react';

interface WeatherBackgroundProps {
  condition: string;
  windSpeed?: number;
  windDirection?: number;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition, windSpeed = 0, windDirection = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let beams: Beam[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Convert wind direction (degrees) to radians and calculate components
    // 0 deg is North, 90 is East, 180 is South, 270 is West.
    // We want to calculate the X drift based on East/West components.
    const windRad = (windDirection - 90) * (Math.PI / 180);
    const windXFactor = Math.cos(windRad) * (windSpeed / 25);
    const windYFactor = Math.sin(windRad) * (windSpeed / 50);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles(true);
      initBeams();
    };

    class Beam {
      x: number = 0;
      y: number = 0;
      width: number = 0;
      angle: number = 0;
      opacity: number = 0;
      targetOpacity: number = 0;
      pulse: number = 0;
      length: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = width + 700; 
        this.y = -500; 
        this.width = Math.max(width, height) * 2.5; 
        this.angle = Math.PI * 0.74; 
        this.opacity = 0;
        this.targetOpacity = 0.20; 
        this.pulse = Math.random() * Math.PI * 2;
        this.length = Math.max(width, height) * 6;
      }

      update() {
        this.pulse += 0.001; 
        if (this.opacity < this.targetOpacity) this.opacity += 0.001;
      }

      draw() {
        if (!ctx) return;
        const currentOpacity = this.opacity * (0.85 + Math.sin(this.pulse) * 0.15);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const grad = ctx.createLinearGradient(0, -this.width / 2, 0, this.width / 2);
        grad.addColorStop(0, 'rgba(255, 253, 220, 0)');
        grad.addColorStop(0.3, `rgba(255, 252, 235, ${currentOpacity * 0.2})`);
        grad.addColorStop(0.5, `rgba(255, 254, 240, ${currentOpacity})`);
        grad.addColorStop(0.7, `rgba(255, 252, 235, ${currentOpacity * 0.2})`);
        grad.addColorStop(1, 'rgba(255, 253, 220, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, -this.width / 2, this.length, this.width);
        ctx.restore();
      }
    }

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      size: number = 0;
      opacity: number = 0;
      pulse: number = 0;
      pulseSpeed: number = 0;

      constructor(initialSpread: boolean = false) {
        this.reset(initialSpread);
      }

      reset(initialSpread: boolean = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        if (!initialSpread) {
          if (condition === 'Rain' || condition === 'Snow' || condition === 'Storm') {
            this.y = -20; 
          }
        }
        
        if (condition === 'Rain' || condition === 'Storm') {
          this.opacity = Math.random() * 0.4 + 0.3;
          this.size = Math.random() * 1.5 + 0.5;
          this.vy = Math.random() * 15 + 12 + windYFactor * 2;
          this.vx = (Math.random() - 0.5) * 1 + windXFactor * 12; 
        } else if (condition === 'Snow') {
          this.opacity = Math.random() * 0.5 + 0.4;
          this.size = Math.random() * 3 + 1.5;
          this.vy = Math.random() * 1.2 + 0.6 + windYFactor;
          this.vx = (Math.random() - 0.5) * 2 + windXFactor * 6; 
        } else if (condition === 'Cloudy 1' || condition === 'Cloudy') {
          this.size = Math.random() * 300 + 200;
          this.opacity = Math.random() * 0.25 + 0.15;
          this.vx = (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1) + windXFactor;
          this.vy = (Math.random() - 0.5) * 0.15 + windYFactor * 0.1;
        } else if (condition === 'Clear') {
          this.size = Math.random() * 2.5 + 1.0; 
          this.opacity = Math.random() * 0.45 + 0.1; 
          this.vx = (Math.random() - 0.5) * 0.4 + windXFactor * 1.5; 
          this.vy = (Math.random() - 0.5) * 0.3 - 0.08 + windYFactor * 0.5; 
          this.pulse = Math.random() * Math.PI * 2;
          this.pulseSpeed = Math.random() * 0.035 + 0.015;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (condition === 'Clear') {
          this.pulse += this.pulseSpeed;
          if (Math.random() > 0.92) {
              this.vx += (Math.random() - 0.5) * 0.08;
              this.vy += (Math.random() - 0.5) * 0.08;
          }
        }

        const buffer = this.size * 25;
        if (this.x > width + buffer) this.x = -buffer;
        if (this.x < -buffer) this.x = width + buffer;
        if (this.y > height + buffer) this.y = -buffer;
        if (this.y < -buffer) this.y = height + buffer;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        if (condition === 'Rain' || condition === 'Storm') {
          ctx.strokeStyle = `rgba(180, 210, 255, ${this.opacity})`;
          ctx.lineWidth = this.size;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.vx, this.y + 15);
          ctx.stroke();
        } else if (condition === 'Snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (condition === 'Cloudy 1' || condition === 'Cloudy') {
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.opacity * 0.4})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (condition === 'Clear') {
          const rayDistance = Math.abs(this.x + this.y - width) / 1000;
          const beamIntensity = Math.max(0, 1 - rayDistance);
          const currentOpacity = this.opacity * (0.3 + Math.sin(this.pulse) * 0.7) * (0.7 + beamIntensity * 0.3);
          ctx.save();
          ctx.fillStyle = `rgba(255, 254, 240, ${currentOpacity})`;
          if (currentOpacity > 0.65) {
             ctx.shadowBlur = 12;
             ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          }
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    let flashOpacity = 0;
    let flashType = 'soft'; // 'soft' or 'heavy'
    const updateLightning = () => {
      if (condition !== 'Storm') return;
      if (flashOpacity > 0) flashOpacity -= 0.04; 
      if (Math.random() > 0.994) {
        flashOpacity = 0.25; 
        flashType = 'soft';
      }
      if (Math.random() > 0.9985) {
        flashOpacity = 0.45; // Max brightness capped for eye safety
        flashType = 'heavy';
      }
    };

    const drawLightning = () => {
      if (condition !== 'Storm' || flashOpacity <= 0) return;
      
      // Instead of full screen white, we use a top-down gradient to simulate sky light
      const lightningGrad = ctx.createLinearGradient(0, 0, 0, height);
      lightningGrad.addColorStop(0, `rgba(230, 240, 255, ${flashOpacity})`);
      lightningGrad.addColorStop(0.4, `rgba(200, 220, 255, ${flashOpacity * 0.4})`);
      lightningGrad.addColorStop(1, `rgba(150, 180, 255, 0)`);
      
      ctx.fillStyle = lightningGrad;
      ctx.fillRect(0, 0, width, height);
      
      // Additional bloom flash for "heavy" lightning, localized
      if (flashType === 'heavy') {
         const bloom = ctx.createRadialGradient(width * 0.5, -100, 0, width * 0.5, -100, width * 0.8);
         bloom.addColorStop(0, `rgba(255, 255, 255, ${flashOpacity * 0.3})`);
         bloom.addColorStop(1, `rgba(255, 255, 255, 0)`);
         ctx.fillStyle = bloom;
         ctx.fillRect(0, 0, width, height);
      }
    };

    const initParticles = (isInitial: boolean) => {
      particles = [];
      let count = 0;
      if (condition === 'Rain' || condition === 'Storm') count = 180;
      else if (condition === 'Snow') count = 100;
      else if (condition === 'Cloudy 1' || condition === 'Cloudy') count = 12;
      else if (condition === 'Clear') count = 155; 

      for (let i = 0; i < count; i++) {
        particles.push(new Particle(isInitial));
      }
    };

    const initBeams = () => {
      beams = [];
      if (condition === 'Clear') {
        beams.push(new Beam());
      }
    };

    const drawSunGlow = () => {
        if (condition !== 'Clear' || !ctx) return;
        const washGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.5, height * 0.5, Math.max(width, height) * 1.5);
        washGrad.addColorStop(0, 'rgba(255, 250, 220, 0.05)');
        washGrad.addColorStop(1, 'rgba(255, 245, 230, 0.01)');
        ctx.fillStyle = washGrad;
        ctx.fillRect(0, 0, width, height);
        const glowX = width + 100;
        const glowY = -100;
        const glowSize = Math.max(width, height) * 1.2;
        const bloomGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowSize);
        bloomGrad.addColorStop(0, 'rgba(255, 255, 240, 0.15)');
        bloomGrad.addColorStop(0.3, 'rgba(255, 250, 220, 0.05)');
        bloomGrad.addColorStop(1, 'rgba(255, 248, 210, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      if (condition === 'Clear') {
        drawSunGlow();
        beams.forEach(b => {
          b.update();
          b.draw();
        });
      }
      
      if (condition === 'Storm') {
        updateLightning();
        drawLightning();
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition, windSpeed, windDirection]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[1] pointer-events-none mix-blend-screen"
      style={{ 
        opacity: condition === 'Clear' ? '1.0' : '0.6',
        filter: condition === 'Rain' || condition === 'Storm' ? 'blur(0.5px)' : 
                (condition === 'Cloudy 1' || condition === 'Cloudy') ? 'blur(30px)' : 
                condition === 'Clear' ? 'blur(0px)' : 'blur(1.2px)' 
      }}
    />
  );
};

export default WeatherBackground;

import React, { useEffect, useRef } from 'react';
import './Snowfall.css';

const Snowfall = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let snowflakes = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Snowflake class
    class Snowflake {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.radius = Math.random() * 6 + 4.5;
        this.speed = Math.random() * 0.5 + 0.3;
        this.wind = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speed;
        this.x += this.wind;

        // Reset snowflake when it goes off screen
        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }

        if (this.x > canvas.width) {
          this.x = 0;
        } else if (this.x < 0) {
          this.x = canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Very light blue color
        ctx.strokeStyle = `rgba(200, 230, 255, ${this.opacity})`;
        ctx.fillStyle = `rgba(220, 240, 255, ${this.opacity * 0.6})`;
        ctx.lineWidth = this.radius * 0.15;
        
        // Draw 6-pointed snowflake
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          
          // Main branch
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -this.radius);
          ctx.stroke();
          
          // Side branches
          ctx.beginPath();
          ctx.moveTo(0, -this.radius * 0.6);
          ctx.lineTo(-this.radius * 0.3, -this.radius * 0.8);
          ctx.moveTo(0, -this.radius * 0.6);
          ctx.lineTo(this.radius * 0.3, -this.radius * 0.8);
          ctx.stroke();
        }
        
        // Center circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Create snowflakes
    const createSnowflakes = () => {
      const numberOfSnowflakes = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numberOfSnowflakes; i++) {
        snowflakes.push(new Snowflake());
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    createSnowflakes();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="snowfall-canvas" />;
};

export default Snowfall;

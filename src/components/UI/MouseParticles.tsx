import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

export default function MouseParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const appleColors = [
            'rgba(0, 122, 255, 0.6)',   // Apple Blue
            'rgba(88, 86, 214, 0.6)',   // Apple Purple
            'rgba(255, 45, 85, 0.6)',   // Apple Pink
            'rgba(52, 199, 89, 0.6)',   // Apple Green
            'rgba(255, 149, 0, 0.6)',   // Apple Orange
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const spawnParticle = (x: number, y: number) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5;

            particlesRef.current.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                size: Math.random() * 3 + 1,
                color: appleColors[Math.floor(Math.random() * appleColors.length)]
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            // Spawn multiple particles per move for a rich trail
            for (let i = 0; i < 3; i++) {
                spawnParticle(e.clientX, e.clientY);
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];

                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.015; // Fade out speed
                p.size *= 0.96; // Shrink speed

                if (p.life <= 0 || p.size < 0.1) {
                    particlesRef.current.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Also spawn some passive particles around mouse if it's stationary but on screen
            if (mouseRef.current.x > 0 && Math.random() > 0.8) {
                spawnParticle(mouseRef.current.x + (Math.random() - 0.5) * 20, mouseRef.current.y + (Math.random() - 0.5) * 20);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50" // High Z-index to float over everything
        />
    );
}

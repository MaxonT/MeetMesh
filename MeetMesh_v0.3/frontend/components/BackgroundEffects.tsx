'use client'

import { useEffect, useState } from 'react'

export function BackgroundEffects() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; opacity: number }>>([])

  useEffect(() => {
    // 生成随机粒子
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.4,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* 浮动粒子 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/40 dark:bg-primary/50 blur-[1px]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${10 + particle.delay}s ease-in-out infinite, pulse ${3 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* 网格线条 */}
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.2]">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)/0.2) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)/0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          }}
        />
      </div>
      
      {/* 装饰性圆圈 */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '7s' }} />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-secondary/20 to-accent/20 blur-xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '5s' }} />
    </div>
  )
}
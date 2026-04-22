'use client';

const CARS = [
  { emoji: '🚗', size: 28, top: '8%',  left: '5%',  dur: 18, delay: 0,   opacity: 0.12 },
  { emoji: '🚙', size: 22, top: '15%', left: '82%', dur: 22, delay: -5,  opacity: 0.10 },
  { emoji: '🏎️', size: 20, top: '30%', left: '12%', dur: 26, delay: -8,  opacity: 0.09 },
  { emoji: '🚕', size: 24, top: '45%', left: '90%', dur: 20, delay: -3,  opacity: 0.11 },
  { emoji: '🚗', size: 18, top: '60%', left: '25%', dur: 30, delay: -12, opacity: 0.08 },
  { emoji: '🚙', size: 26, top: '72%', left: '70%', dur: 24, delay: -6,  opacity: 0.10 },
  { emoji: '🏎️', size: 22, top: '85%', left: '8%',  dur: 19, delay: -9,  opacity: 0.09 },
  { emoji: '🚗', size: 20, top: '20%', left: '50%', dur: 28, delay: -14, opacity: 0.08 },
  { emoji: '🚕', size: 18, top: '55%', left: '45%', dur: 32, delay: -7,  opacity: 0.07 },
  { emoji: '🚙', size: 24, top: '90%', left: '55%', dur: 21, delay: -11, opacity: 0.10 },
  { emoji: '🚗', size: 16, top: '38%', left: '65%', dur: 25, delay: -4,  opacity: 0.07 },
  { emoji: '🏎️', size: 26, top: '5%',  left: '38%', dur: 17, delay: -2,  opacity: 0.11 },
];

export default function BgAnime() {
  return (
    <div className="bg-animated" aria-hidden="true">
      <div className="bg-dots" />
      {CARS.map((car, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: car.top,
            left: car.left,
            fontSize: `${car.size}px`,
            opacity: car.opacity,
            filter: 'grayscale(1) sepia(1) hue-rotate(190deg) saturate(4) brightness(0.55)',
            animation: `float ${car.dur}s ease-in-out infinite`,
            animationDelay: `${car.delay}s`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {car.emoji}
        </span>
      ))}
    </div>
  );
}

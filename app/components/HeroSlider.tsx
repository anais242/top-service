'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  {
    url: 'https://res.cloudinary.com/dfwyskgso/image/upload/f_auto,q_auto,c_fill,g_auto,w_1920,h_1080/top-service/hero/hero-1.jpg',
    alt: 'Flotte Top Service — Hilux, SUV, Jetour X70 Plus',
  },
  {
    url: 'https://res.cloudinary.com/dfwyskgso/image/upload/f_auto,q_auto,c_fill,g_auto,w_1920,h_1080/top-service/hero/hero-2.png',
    alt: 'Top Service — Services et tarifs à l\'heure',
  },
];

export default function HeroSlider() {
  const [actif, setActif] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActif(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ position: 'relative', width: '100%', height: '92vh', minHeight: '520px', overflow: 'hidden' }}>

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === actif ? 1 : 0,
          transition: 'opacity 0.9s ease',
          zIndex: i === actif ? 1 : 0,
        }}>
          <Image src={slide.url} alt={slide.alt} fill style={{ objectFit: 'cover' }} priority={i === 0} />
          {/* Overlay dégradé bleu */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(13,27,62,0.75) 0%, rgba(13,27,62,0.35) 60%, rgba(13,27,62,0.1) 100%)',
          }} />
        </div>
      ))}

      {/* Contenu */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 5vw',
        maxWidth: '760px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(219,234,254,0.4)',
          borderRadius: '50px', padding: '6px 18px', marginBottom: '24px',
          fontSize: '0.78rem', fontWeight: 700, color: '#DBEAFE',
          letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
          Location de véhicules · Congo
        </div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2rem, 5vw, 3.4rem)',
          fontWeight: 800, color: '#FFFFFF',
          lineHeight: 1.15, marginBottom: '20px',
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          Le véhicule qu'il vous faut,<br />
          <span style={{ color: '#93C5FD' }}>quand vous en avez besoin</span>
        </h1>

        <p style={{
          color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.7,
          marginBottom: '36px', maxWidth: '480px',
        }}>
          Réservez en quelques clics parmi notre flotte de véhicules disponibles à Brazzaville.
          Prix transparents, confirmation rapide.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/vehicules" className="btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Voir les véhicules
          </Link>
          <Link href="/inscription" style={{
            padding: '14px 32px', fontSize: '1rem', fontWeight: 700,
            border: '2px solid rgba(219,234,254,0.6)', borderRadius: '10px',
            color: '#DBEAFE', textDecoration: 'none', display: 'inline-flex',
            alignItems: 'center', transition: 'all 0.25s',
            background: 'rgba(255,255,255,0.08)',
          }}>
            Créer un compte
          </Link>
        </div>
      </div>

      {/* Indicateurs */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '5vw',
        display: 'flex', gap: '10px', zIndex: 2,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActif(i)} style={{
            width: i === actif ? '32px' : '10px',
            height: '10px', borderRadius: '5px',
            background: i === actif ? '#3B82F6' : 'rgba(255,255,255,0.4)',
            border: 'none', cursor: 'pointer',
            transition: 'all 0.35s ease', padding: 0,
          }} />
        ))}
      </div>
    </section>
  );
}

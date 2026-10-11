'use client';

import React, { useMemo } from 'react';
import './GalleryHeading.css';

export function GalleryHeading({
  headlineLine1 = 'YOUR CREATIVITY DESERVES',
  headlineLine2 = 'THE RIGHT CONNECTIONS.',
  variant = 'rising-diagonal',
  mode = 'dark',
  font = 'sans',
  weight = '700',
  headlineSize = 1.15,
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  className = '',
  style = {},
}) {
  const filter = useMemo(() => {
    if (hue === 0 && saturation === 1.0 && brightness === 1.0) {
      return undefined;
    }
    return `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;
  }, [hue, saturation, brightness]);

  const srcUrl = useMemo(() => {
    const q = new URLSearchParams();
    if (headlineLine1) q.set('h1', headlineLine1);
    if (headlineLine2) q.set('h2', headlineLine2);
    const qs = q.toString();
    return `/effects/gallery-heading.html${qs ? `?${qs}` : ''}`;
  }, [headlineLine1, headlineLine2]);

  return (
    <div
      className={`gallery-heading-frame ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#F9F7F3',
        overflow: 'hidden',
        filter,
        ...style,
      }}
    >
      <iframe
        title="Gallery Heading - Your Creativity Deserves The Right Connections"
        src={srcUrl}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          background: '#F9F7F3',
        }}
      />
    </div>
  );
}

export default GalleryHeading;

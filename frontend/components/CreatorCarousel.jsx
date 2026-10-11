'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CreatorCarousel.css';

const CATEGORIES = [
  {
    id: 'fashion',
    name: 'FASHION',
    image: '/assets/activity-fashion.jpg',
    alt: 'Fashion model posing on streetwear photoshoot',
    position: '50% 25%'
  },
  {
    id: 'comedy',
    name: 'COMEDY',
    image: '/assets/activity-comedy.jpg',
    alt: 'Stand-up comedian performing live on stage with microphone',
    position: '50% 18%'
  },
  {
    id: 'fitness',
    name: 'FITNESS',
    image: '/assets/activity-fitness.jpg',
    alt: 'CrossFit athlete training on pullup bar in gym',
    position: '78% 20%'
  },
  {
    id: 'travel',
    name: 'TRAVEL',
    image: '/assets/activity-travel.jpg',
    alt: 'Travel creator with backpack overlooking mountain vista',
    position: '72% 25%'
  },
  {
    id: 'beauty',
    name: 'BEAUTY',
    image: '/assets/activity-beauty.jpg',
    alt: 'Beauty creator applying cosmetic lipstick with wand',
    position: '50% 42%'
  },
  {
    id: 'culinary',
    name: 'CULINARY',
    image: '/assets/activity-culinary.jpg',
    alt: 'Commercial chef actively plating dish under heat lamps',
    position: '50% 35%'
  },
  {
    id: 'tech',
    name: 'TECHNOLOGY',
    image: '/assets/activity-tech.jpg',
    alt: 'Creator demonstrating camera setup and recording on tripod',
    position: '48% 28%'
  },
  {
    id: 'music',
    name: 'MUSIC',
    image: '/assets/activity-music.jpg',
    alt: 'Musician performing on stage with electric guitar',
    position: '48% 22%'
  }
];

export default function CreatorCarousel({ className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stageRef = useRef(null);
  const deckRef = useRef(null);
  const cardsRef = useRef([]);
  const animFrameRef = useRef(null);

  const count = CATEGORIES.length;

  const stateRef = useRef({
    phase: 0,
    target: 0,
    base: 0,
    pointerX: 0,
    pointerY: 0,
    active: false,
    isIntersecting: true,
    isTabVisible: true,
    isDragging: false,
    dragStartX: 0,
    lastInput: typeof performance !== 'undefined' ? performance.now() : 0
  });

  const wrappedDelta = useCallback((index, phase) => {
    let delta = index - phase;
    while (delta > count / 2) delta -= count;
    while (delta < -count / 2) delta += count;
    return delta;
  }, [count]);

  const nearestIndex = useCallback((phase) => {
    return ((Math.round(phase) % count) + count) % count;
  }, [count]);

  const moveTo = useCallback((index) => {
    const s = stateRef.current;
    const current = nearestIndex(s.phase);
    let delta = index - current;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;

    s.base += delta;
    s.target = s.base;
    s.active = false;
    s.lastInput = performance.now();
    setActiveIndex(index);
  }, [count, nearestIndex]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previousTime = performance.now();

    function render(time) {
      const s = stateRef.current;
      if (!s.isIntersecting || !s.isTabVisible) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const deltaTime = Math.min(32, time - previousTime);
      previousTime = time;
      const ease = reducedMotion ? 1 : 1 - Math.pow(0.001, deltaTime / 1000);

      // Subtle idle breathing animation after 3.6s of inactivity
      if (!s.active && !s.isDragging && time - s.lastInput > 3600) {
        const idle = time - s.lastInput - 3600;
        s.target = s.base + Math.sin(idle * 0.00042) * 2.2;
      }

      s.phase += (s.target - s.phase) * ease;
      const currentActive = nearestIndex(s.phase);
      const isMobile = window.innerWidth < 650;
      const horizontalSpacing = Math.min(170, Math.max(120, window.innerWidth * 0.12));

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const delta = wrappedDelta(index, s.phase);
        const distance = Math.abs(delta);
        const focus = Math.exp(-distance * distance * 1.28);
        const side = Math.max(0, 1 - distance / 5);
        const direction = Math.sign(delta);

        const x = isMobile
          ? delta * (window.innerWidth * 0.34)
          : delta * horizontalSpacing;
        // Keep vertical translation gentle so active card is centered and never clips at the bottom
        const y = distance * 6 + s.pointerY * focus * 6;
        const z = focus * 140 - distance * 145;
        const scale = 0.60 + side * 0.14 + focus * 0.44;
        const rotateX = -s.pointerY * focus * 3.0;
        const rotateY = isMobile
          ? -direction * (distance > 0.2 ? 10 + Math.min(distance, 2) * 4 : 0) + s.pointerX * focus * 2
          : -direction * (distance > 0.2 ? 14 + Math.min(distance, 3) * 5 : 0) + s.pointerX * focus * 3;
        const rotateZ = delta * 0.5;

        card.style.zIndex = String(Math.round(1000 - distance * 100));
        card.style.opacity = String(Math.max(0.15, side * 0.75 + focus * 0.25));
        card.style.filter = `blur(${Math.max(0, distance - 1.6) * 0.3}px)`;
        // Using translate(-50%, -50%) first ensures card scales and transforms perfectly around its center
        card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

        if (index === currentActive) {
          card.setAttribute('aria-current', 'true');
        } else {
          card.removeAttribute('aria-current');
        }
      });

      setActiveIndex(currentActive);
      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    // Event Handlers
    function onPointerMove(event) {
      const rect = stage.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      const s = stateRef.current;
      s.pointerX = nx;
      s.pointerY = ny;

      if (s.isDragging) {
        const deltaX = (event.clientX - s.dragStartX) / rect.width;
        s.target = s.base - deltaX * 3.5;
      } else {
        s.active = true;
        s.target = s.base + (window.innerWidth < 650 ? nx * 2.2 : nx * 3.0);
      }
      s.lastInput = performance.now();
    }

    function onPointerDown(event) {
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = event.clientX;
      s.lastInput = performance.now();
    }

    function onPointerUp() {
      const s = stateRef.current;
      if (s.isDragging) {
        s.isDragging = false;
        s.base = Math.round(s.target);
        s.target = s.base;
      }
    }

    function onPointerLeave() {
      const s = stateRef.current;
      s.active = false;
      s.isDragging = false;
      s.pointerX = 0;
      s.pointerY = 0;
      s.target = s.base;
    }

    function onWheel(event) {
      event.preventDefault();
      const direction = Math.sign(Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX);
      if (!direction) return;
      const s = stateRef.current;
      s.base += direction;
      s.target = s.base;
      s.active = false;
      s.lastInput = performance.now();
    }

    function onKeyDown(event) {
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      if (!forward && !backward) return;
      event.preventDefault();
      const s = stateRef.current;
      s.base += forward ? 1 : -1;
      s.target = s.base;
      s.active = false;
      s.lastInput = performance.now();
    }

    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointerleave', onPointerLeave);
    stage.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    function handleVisibility() {
      stateRef.current.isTabVisible = !document.hidden;
    }
    document.addEventListener('visibilitychange', handleVisibility);

    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        stateRef.current.isIntersecting = entry ? entry.isIntersecting : true;
      }, { threshold: 0.1 });
      observer.observe(stage);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
    };
  }, [wrappedDelta, nearestIndex]);

  return (
    <div
      className={`w-full max-w-[1140px] mx-auto relative rounded-2xl overflow-hidden border border-[#181816]/10 bg-[#f6f5f0] shadow-[0_10px_32px_rgba(24,24,22,0.03)] ${className}`}
      aria-label="CRAB Creator Categories Carousel"
    >
      {/* Left/Right Edge Feathering into Landing Page Background */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 z-20 bg-gradient-to-r from-[#f6f5f0] via-[#f6f5f0]/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 md:w-32 z-20 bg-gradient-to-l from-[#f6f5f0] via-[#f6f5f0]/80 to-transparent"
        aria-hidden="true"
      />

      {/* 3D Stage Container with generous height to guarantee full card and label visibility */}
      <div
        ref={stageRef}
        className="creator-carousel-stage relative w-full h-[520px] sm:h-[550px] md:h-[580px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      >
        <div ref={deckRef} className="creator-carousel-deck absolute inset-0">
          {CATEGORIES.map((cat, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={cat.id}
                ref={(el) => (cardsRef.current[index] = el)}
                type="button"
                onClick={() => moveTo(index)}
                aria-label={`Creator Category: ${cat.name}`}
                className={`creator-carousel-card absolute top-[47%] left-1/2 w-[168px] sm:w-[196px] md:w-[224px] aspect-[0.72] p-0 rounded-xl overflow-hidden bg-white border cursor-pointer transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6600] ${
                  isActive
                    ? 'border-[#ff6600]/40 shadow-[0_18px_42px_rgba(24,24,22,0.14)]'
                    : 'border-[#181816]/12 shadow-[0_4px_14px_rgba(24,24,22,0.06)] hover:border-[#ff6600]/30'
                }`}
              >
                {/* Authentic Activity Photograph Container with Tailored Focal Point */}
                <div className="absolute inset-0 bottom-[44px] overflow-hidden bg-[#eae8e1]">
                  <img
                    src={cat.image}
                    alt={cat.alt}
                    style={{ objectPosition: cat.position }}
                    className="w-full h-full object-cover transition-transform duration-300"
                    loading={index < 3 ? 'eager' : 'lazy'}
                  />
                </div>

                {/* Integrated Category Label Bar */}
                <div className="absolute inset-x-0 bottom-0 h-[44px] flex items-center justify-center px-3 bg-white border-t border-[#181816]/8 z-10">
                  <span
                    className={`block truncate font-mono text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200 ${
                      isActive ? 'text-[#ff6600]' : 'text-[#181816]'
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

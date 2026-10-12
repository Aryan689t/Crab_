'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import CreatorCarousel from '@/components/CreatorCarousel';
import GalleryHeading from '@/components/GalleryHeading';

const FAQ_ITEMS = [
  {
    q: 'What is CRAB and how does it differ from traditional influencer agencies?',
    a: 'CRAB (Creators Reaching Aligned Brands) is a direct discovery platform built on authentic affinity. Unlike traditional agencies that charge high markups and push generic rosters, CRAB matches creators and brands based on shared aesthetics, audience values, and verified engagement — without agency gatekeepers.',
  },
  {
    q: 'How does CRAB evaluate creator-brand alignment?',
    a: 'Alignment is evaluated using qualitative and quantitative criteria: niche relevance, audience sentiment, editorial integrity, product category affinity, and mutual values (such as sustainability, craft, design, and technical depth).',
  },
  {
    q: 'Is it free for creators to join?',
    a: 'Yes. Creators can join, build their alignment profile, and review incoming brand opportunities at zero cost. Creators keep 100% of their agreed sponsorship fees.',
  },
  {
    q: 'How do brands post collaboration opportunities?',
    a: 'Brands submit a campaign brief defining their product story, target aesthetics, budget range, and desired deliverables (such as dedicated video integrations, podcast reads, or editorial features). Aligned creators are invited to review and accept the brief.',
  },
  {
    q: 'Who controls the creative direction of the sponsored content?',
    a: 'Creators maintain full creative freedom over their voice, style, and presentation. Brands provide talking points, key value propositions, and factual accuracy checks, ensuring the integration sounds authentic rather than scripted.',
  },
  {
    q: 'How are payments and contract deliverables handled?',
    a: 'Campaign payments are protected through standard milestones. Once terms are accepted, funds are escrowed and released upon deliverable completion and verification, providing certainty for both creators and brand marketing teams.',
  },
];

export default function RootLandingPage() {
  // Navigation State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modals State
  const [activeModal, setActiveModal] = useState<'creator' | 'brand' | null>(null);

  // Form submission status states
  const [creatorSubmitted, setCreatorSubmitted] = useState(false);
  const [brandSubmitted, setBrandSubmitted] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { user, login } = useAuth();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [activeModal]);

  const enterDemo = async (role: 'CREATOR' | 'BRAND') => {
    const email = role === 'CREATOR' ? 'tech.creator@crab-platform.local' : 'acme.brand@crab-platform.local';
    await login(email, 'Password123!', role);
  };

  const openModal = (type: 'creator' | 'brand') => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3] text-[#181816] font-sans antialiased selection:bg-[#ff6600]/20 selection:text-[#ff6600]">
      {/* ========================================================================
          1. NAVIGATION BAR
          Balanced horizontal layout: Left links | Center Logo | Right Actions
          ======================================================================== */}
      <header className="sticky top-0 left-0 w-full h-[72px] bg-[#F9F7F3]/95 backdrop-blur-md z-50 border-b border-[#181816]/10">
        <div className="max-w-[1240px] mx-auto h-full px-6 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center">

          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <div className="relative group">
              <a href="#story" className="text-sm font-medium text-[#4a4944] hover:text-[#181816] inline-flex items-center gap-1 py-1 transition-colors">
                About <span className="text-[10px] text-[#76746e] group-hover:translate-y-0.5 transition-transform">▾</span>
              </a>
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#181816]/12 rounded-xl shadow-lg p-2 min-w-[200px] hidden group-hover:flex flex-col gap-0.5 z-50">
                <a href="#story" className="text-xs px-3 py-2 rounded-lg text-[#4a4944] hover:bg-[#f6f5f0] hover:text-[#181816] transition-colors">Our Mission</a>
                <a href="#principles" className="text-xs px-3 py-2 rounded-lg text-[#4a4944] hover:bg-[#f6f5f0] hover:text-[#181816] transition-colors">Alignment Principles</a>
                <a href="#how-it-works" className="text-xs px-3 py-2 rounded-lg text-[#4a4944] hover:bg-[#f6f5f0] hover:text-[#181816] transition-colors">How It Works</a>
              </div>
            </div>

            <a href="#gallery" className="text-sm font-medium text-[#4a4944] hover:text-[#181816] transition-colors">
              Disciplines
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-[#4a4944] hover:text-[#181816] transition-colors">
              Workflow
            </a>
            <a href="#faq" className="text-sm font-medium text-[#4a4944] hover:text-[#181816] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Center Brand Identity */}
          <div className="flex items-center justify-start md:justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/crab-logo.png"
                alt="CRAB"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-[#181816]">
                CRAB
              </span>
            </Link>
          </div>

          {/* Right Action Links & CTAs (Sign In & Get Started) */}
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[#4a4944] hover:text-[#181816] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#ff6600] text-white text-xs sm:text-sm font-medium hover:bg-[#e65c00] active:scale-95 transition-all shadow-xs"
            >
              Get Started
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 text-[#181816] hover:bg-[#edebe4] rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileNavOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 bg-[#f6f5f0] z-40 p-6 flex flex-col gap-4 border-t border-[#181816]/10 overflow-y-auto">
          <a href="#story" onClick={() => setMobileNavOpen(false)} className="text-lg font-medium text-[#181816] py-3 border-b border-[#181816]/10">About CRAB</a>
          <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="text-lg font-medium text-[#181816] py-3 border-b border-[#181816]/10">How It Works</a>
          <a href="#creators-brands" onClick={() => setMobileNavOpen(false)} className="text-lg font-medium text-[#181816] py-3 border-b border-[#181816]/10">Dual Value Model</a>
          <a href="#principles" onClick={() => setMobileNavOpen(false)} className="text-lg font-medium text-[#181816] py-3 border-b border-[#181816]/10">Alignment Principles</a>
          <a href="#faq" onClick={() => setMobileNavOpen(false)} className="text-lg font-medium text-[#181816] py-3 border-b border-[#181816]/10">FAQ</a>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileNavOpen(false)}
              className="w-full py-3.5 border border-[#181816]/20 bg-white text-[#181816] rounded-full font-medium text-center hover:bg-[#edebe4]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileNavOpen(false)}
              className="w-full py-3.5 bg-[#ff6600] text-white rounded-full font-medium text-center shadow-sm"
              style={{ color: '#ffffff' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      <main>
        {/* ======================================================================
            2. HERO SECTION
            Intended Order: Eyebrow -> 3D Canvas Text Animation -> Quote -> Paragraph -> Portal CTAs -> Benefits -> 3D Filmstrip Carousel
            ====================================================================== */}
        <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 px-6 text-center max-w-[1240px] mx-auto" id="hero">

          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#181816]/10 text-[11px] font-mono font-semibold text-[#4a4944] uppercase tracking-wider mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
            <span>CREATORS ✕ BRANDS • DIRECT ALIGNMENT PLATFORM</span>
          </div>

          {/* 3D Gallery Heading Showcase - Seamless Warm #F9F7F3 Light Frame */}
          <section className="w-full max-w-[1140px] mx-auto my-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#F9F7F3] border border-[#181816]/08 transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]">
            <div className="w-full h-[460px] sm:h-[560px] md:h-[640px] bg-[#F9F7F3]">
              <GalleryHeading
                variant="rising-diagonal"
                mode="light"
                font="sans"
                weight="700"
                headlineLine1="YOUR CREATIVITY DESERVES"
                headlineLine2="THE RIGHT CONNECTIONS."
                headlineSize={1.15}
                hue={0}
                saturation={1.00}
                brightness={1.00}
              />
            </div>
          </section>

          <h1 className="sr-only">Your Creativity Deserves the Right Connections.</h1>

          {/* Supporting Statement / Quote (Quiet, Editorial Typography) */}
          <div className="max-w-[620px] mx-auto text-xs sm:text-sm font-serif italic text-[#76746e] leading-relaxed mb-6">
            <p>
              [1] “True alignment isn't vanity reach—it's shared identity, genuine audience affinity, and collaboration that feels completely natural to both sides.”
            </p>
            <span className="block mt-1.5 font-mono text-[11px] not-italic text-[#ff6600] font-medium tracking-wide">
              — CRAB Founding Principle
            </span>
          </div>

          {/* Descriptive Paragraph */}
          <p className="max-w-[700px] mx-auto text-base sm:text-lg text-[#4a4944] leading-relaxed mb-8">
            Discover a world of creators, brands, and collaboration possibilities with CRAB — a platform built to bring aligned creative identities and brand goals closer together.
          </p>

          {/* Primary Actions: Get Started & Sign In */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-7">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-[#ff6600] text-white rounded-full font-medium text-sm sm:text-base hover:bg-[#e65c00] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
              style={{ color: '#ffffff' }}
            >
              <span>Get Started</span>
              <span className="text-xs text-white/80">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#181816]/20 rounded-full font-medium text-sm sm:text-base text-[#181816] hover:bg-[#edebe4] hover:border-[#181816] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-sm"
            >
              <span>Sign In</span>
              <span>→</span>
            </Link>
          </div>

          {/* Compact Product Benefits Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-[#76746e] mb-12">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#ff6600]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              Zero Cold DM Spam
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#ff6600]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              Direct Brand & Creator Relationships
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#ff6600]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              100% Creator Fee Retention
            </span>
          </div>

          {/* The Creator Filmstrip 3D Carousel Component */}
          <div className="w-full my-4">
            <CreatorCarousel />
          </div>

          {/* Downward Scroll Indicator */}
          <div className="mt-8 flex justify-center">
            <a
              href="#story"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#181816]/10 text-[#76746e] hover:text-[#ff6600] hover:scale-105 transition-all shadow-xs"
              aria-label="Scroll to mission overview"
            >
              <svg className="w-5 h-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>
          </div>
        </section>

        {/* ======================================================================
            3. EDITORIAL STORY SECTION
            ====================================================================== */}
        <section className="py-20 px-6 max-w-[760px] mx-auto border-t border-[#181816]/10" id="story">
          <div className="space-y-6">
            <p className="font-serif text-xl sm:text-2xl leading-relaxed text-[#181816]">
              <span className="float-left font-serif text-6xl sm:text-7xl leading-none font-bold text-[#ff6600] pr-3 pt-1">F</span>
              or years, creator-brand partnerships have been crippled by noise. Brands burn marketing budgets blasting impersonal cold DMs into creator inboxes, while creators are forced to decline promotions that don't fit their aesthetic, values, or audience standards.
            </p>
            <p className="font-serif text-lg sm:text-xl leading-relaxed text-[#4a4944]">
              CRAB was created to eliminate the friction. We believe the most impactful partnerships happen when a brand's mission and a creator's natural voice genuinely intersect. By matching creators and brands around shared aesthetics, genuine audience affinity, and clear deliverables, CRAB turns transactional sponsorships into lasting, high-trust collaborations.
            </p>
          </div>
        </section>

        {/* ======================================================================
            4. PHOTO GALLERY STRIP (CREATIVE FORMATS)
            ====================================================================== */}
        <section className="py-12 px-6 max-w-[1240px] mx-auto" id="gallery" aria-label="Creative Disciplines">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl overflow-hidden border border-[#181816]/10 shadow-xs hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-[#edebe4]">
                <img src="/assets/photo_1.jpg" alt="Creator in studio filming authentic craft video" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-1">Studio Production</div>
                <div className="text-xs text-[#4a4944] leading-relaxed">Authentic craft storytelling with full creator editorial independence.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-[#181816]/10 shadow-xs hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-[#edebe4]">
                <img src="/assets/photo_2.jpg" alt="Podcast creator recording audio in acoustic studio" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-1">Audio & Podcasts</div>
                <div className="text-xs text-[#4a4944] leading-relaxed">Deep listener trust built through long-form, high-affinity conversations.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-[#181816]/10 shadow-xs hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-[#edebe4]">
                <img src="/assets/photo_3.jpg" alt="Brand team and creator discussing campaign moodboard" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-1">Creative Strategy</div>
                <div className="text-xs text-[#4a4944] leading-relaxed">Collaborative brief planning directly between founders and creators.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-[#181816]/10 shadow-xs hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-[#edebe4]">
                <img src="/assets/photo_4.jpg" alt="Creator editing documentary footage in natural light" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-1">Independent Media</div>
                <div className="text-xs text-[#4a4944] leading-relaxed">Organic field reviews and product integration that resonate naturally.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            5. HOW CRAB WORKS (THE 4-STEP ALIGNMENT PROCESS)
            ====================================================================== */}
        <section className="py-20 px-6 max-w-[1240px] mx-auto" id="how-it-works">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-2">Collaboration Workflow</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#181816] mb-3">How CRAB connects <em className="italic">creators and brands</em></h2>
            <p className="text-base text-[#76746e]">A transparent, four-step journey designed to replace cold outreach with vetted compatibility.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-sm font-bold text-[#ff6600] mb-3">01</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Build Your Alignment Profile</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                Creators articulate their niche, creative format, and audience values. Brands outline their product philosophy, aesthetic standards, and target objectives.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-sm font-bold text-[#ff6600] mb-3">02</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Curated Match Discovery</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                Explore collaboration opportunities filtered by genuine audience affinity, ethical overlap, and category resonance — filtering out mismatched outreach.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-sm font-bold text-[#ff6600] mb-3">03</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Clear, Transparent Terms</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                Establish agreed deliverables, fair market compensation, timeline milestones, and usage rights upfront without confusing agency contracts or opaque commissions.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-sm font-bold text-[#ff6600] mb-3">04</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Long-Term Partnerships</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                Transform one-off sponsored segments into ongoing brand ambassadorships, co-created capsules, and recurring campaign sponsorships that build equity.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================================
            6. DUAL VALUE PROPOSITIONS (FOR CREATORS & FOR BRANDS)
            ====================================================================== */}
        <section className="py-20 px-6 max-w-[1240px] mx-auto" id="creators-brands">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Creators */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#181816]/10 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#ff6600]/10 text-[#ff6600] font-mono text-xs font-semibold uppercase tracking-wider">
                    For Creators
                  </span>
                  <img
                    src="/crab-logo.png"
                    alt="CRAB"
                    className="w-7 h-7 object-contain opacity-90"
                  />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#181816] mb-4">
                  Sponsorships you can be <em className="italic">proud to recommend</em>
                </h3>
                <p className="text-sm sm:text-base text-[#4a4944] mb-6 leading-relaxed">
                  Your audience follows you for your taste and honesty. Never compromise that trust for an ill-fitting sponsor again.
                </p>

                <ul className="space-y-4 mb-8 text-xs sm:text-sm text-[#4a4944]">
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Zero Irrelevant Cold Inquiries:</strong> Receive proposals only from brands whose mission, product, and budget fit your standard.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Total Editorial Freedom:</strong> Retain control over script, visual framing, and authentic presentation without rigid corporate mandates.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Protected Terms & Timely Payouts:</strong> Transparent escrow workflows and clear milestone approvals protect your work.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="w-full py-3.5 bg-[#ff6600] text-white rounded-full font-medium text-sm hover:bg-[#e65c00] transition-all cursor-pointer text-center shadow-xs block"
                  style={{ color: '#ffffff' }}
                >
                  Get Started →
                </Link>
                <button
                  onClick={() => openModal('creator')}
                  className="w-full py-2.5 text-xs text-[#76746e] hover:text-[#181816] transition-colors"
                >
                  Or Submit Creator Alignment Application
                </button>
              </div>
            </div>

            {/* For Brands */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#181816]/10 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#edebe4] text-[#4a4944] font-mono text-xs font-semibold uppercase tracking-wider">
                    For Brands
                  </span>
                  <img
                    src="/crab-logo.png"
                    alt="CRAB"
                    className="w-7 h-7 object-contain opacity-90"
                  />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#181816] mb-4">
                  Reach loyal audiences through <em className="italic">authentic advocates</em>
                </h3>
                <p className="text-sm sm:text-base text-[#4a4944] mb-6 leading-relaxed">
                  Stop paying for empty vanity reach. Partner with creators whose followers genuinely value their point of view.
                </p>

                <ul className="space-y-4 mb-8 text-xs sm:text-sm text-[#4a4944]">
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Organic Niche Alignment:</strong> Discover creators whose aesthetic and audience demographics naturally overlap with your product ethos.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Higher Organic Resonance:</strong> Content created by authentic advocates connects naturally with audiences, building genuine community sentiment.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-[#ff6600] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span><strong>Direct Communication:</strong> Work directly with creative talent instead of navigating layers of slow agency intermediaries.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="w-full py-3.5 border border-[#181816]/20 bg-white text-[#181816] rounded-full font-medium text-sm hover:bg-[#edebe4] transition-all cursor-pointer text-center block"
                >
                  Get Started →
                </Link>
                <button
                  onClick={() => openModal('brand')}
                  className="w-full py-2.5 text-xs text-[#76746e] hover:text-[#181816] transition-colors"
                >
                  Or Request Brand Partner Discovery
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================
            7. TRUST & ALIGNMENT PRINCIPLES
            ====================================================================== */}
        <section className="py-20 px-6 max-w-[1240px] mx-auto" id="principles">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-2">The CRAB Standard</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#181816] mb-3">Principles of <em className="italic">true partnership</em></h2>
            <p className="text-base text-[#76746e]">What makes a collaboration authentic, sustainable, and high-impact.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">01 / INTEGRITY</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Audience Trust is Sacred</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                A creator's reputation is their most valuable asset. CRAB exists to protect that trust, never to compromise it with mismatched sponsorships.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">02 / TRANSPARENCY</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Direct Relationships</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                No hidden agency fees or restrictive middleman contracts. Brands and creators collaborate directly with clear expectations and fair economics.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">03 / RESONANCE</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Quality Over Vanity Reach</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                A partnership with a dedicated, highly aligned audience generates far greater long-term brand equity than indifferent, mismatched impressions.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#181816]/10 shadow-xs">
              <div className="font-mono text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">04 / AUTONOMY</div>
              <h3 className="font-serif text-xl text-[#181816] mb-2 font-medium">Creative Sovereignty</h3>
              <p className="text-xs sm:text-sm text-[#4a4944] leading-relaxed">
                Creators understand how to talk to their audience better than any marketing template. Brands provide the mission; creators deliver the magic.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================================
            8. FREQUENTLY ASKED QUESTIONS (ACCORDION)
            ====================================================================== */}
        <section className="py-20 px-6 max-w-[820px] mx-auto" id="faq">
          <div className="text-center mb-12">
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-2">Frequently Asked Questions</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#181816] mb-3">Everything you need to know about <em className="italic">CRAB</em></h2>
            <p className="text-base text-[#76746e]">Common questions from creators, founders, and marketing leaders.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-xl border border-[#181816]/10 overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-serif text-lg font-medium text-[#181816] cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <span className="font-mono text-xl text-[#ff6600] shrink-0">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#4a4944] leading-relaxed border-t border-[#181816]/5 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================================
            9. FINAL CALL TO ACTION
            ====================================================================== */}
        <section className="py-24 px-6 text-center max-w-[900px] mx-auto" id="join">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#181816] mb-5 leading-tight">
            Where creators meet<br />
            <em className="italic">the right brands</em>
          </h2>
          <p className="text-base sm:text-lg text-[#4a4944] max-w-[600px] mx-auto mb-10 leading-relaxed">
            Connect with aligned partners and build meaningful, high-trust creative collaborations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#ff6600] text-white rounded-full font-medium text-sm sm:text-base hover:bg-[#e65c00] transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              style={{ color: '#ffffff' }}
            >
              <span>Get Started</span>
              <span>→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-[#181816]/20 rounded-full font-medium text-sm sm:text-base text-[#181816] hover:bg-[#edebe4] transition-all cursor-pointer shadow-sm"
            >
              <span>Sign In</span>
              <span>→</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-[#76746e]">
            <span>ZERO AGENCY FEES</span>
            <span>•</span>
            <span>DIRECT TERMS</span>
            <span>•</span>
            <span>VERIFIED INTEGRITY</span>
          </div>
        </section>
      </main>

      {/* ========================================================================
          10. FOOTER (High-Contrast Dark Surface)
          ======================================================================== */}
      <footer className="bg-[#0a0a0a] text-white py-16 px-6 border-t border-white/10">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/crab-logo.png"
                alt="CRAB"
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-serif font-bold text-xl text-white">CRAB</span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed">
              Creators Reaching Aligned Brands. Direct partnerships built on shared taste, audience resonance, and zero agency middlemen.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-4">Account & Access</div>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-4">Platform Exploration</div>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li><a href="#story" className="hover:text-white transition-colors">Our Founding Mission</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Creative Disciplines</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Four-Step Workflow</a></li>
              <li><a href="#principles" className="hover:text-white transition-colors">Alignment Principles</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Support</a></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-[#ff6600] uppercase tracking-wider mb-4">Guiding Ethos</div>
            <p className="text-xs text-white/60 leading-relaxed">
              We reject cold spam, inflated vanity metrics, and non-transparent sponsorship deals. Real influence is built on audience trust.
            </p>
          </div>

        </div>

        <div className="max-w-[1240px] mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© 2026 CRAB Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white/80 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white/80 transition-colors">Sign Up</Link>
            <a href="#principles" className="hover:text-white/80 transition-colors">Alignment Manifesto</a>
          </div>
        </div>
      </footer>

      {/* ========================================================================
          11. ONBOARDING & APPLICATION MODALS
          ======================================================================== */}
      {/* Modal 1: Creator Application */}
      {activeModal === 'creator' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#181816]/10 mb-5">
              <h3 className="font-serif text-2xl text-[#181816] font-medium">Join CRAB as a Creator</h3>
              <button
                onClick={closeModal}
                className="text-[#76746e] hover:text-[#181816] text-2xl leading-none cursor-pointer p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {!creatorSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCreatorSubmitted(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-[#76746e] leading-relaxed">
                  Join a curated network of creators who partner directly with mission-aligned brands. 100% free, keep full creative control.
                </p>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Creator / Channel Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Studio Craft Media"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Primary Channel or Portfolio URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/@yourchannel or website"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Primary Category</label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600] bg-white"
                  >
                    <option value="">Select your discipline...</option>
                    <option value="tech">Technology & Developer Tools</option>
                    <option value="fashion">Fashion & Design</option>
                    <option value="fitness">Athletics, Movement & Wellness</option>
                    <option value="travel">Travel, Exploration & Outdoors</option>
                    <option value="culinary">Culinary & Hospitality</option>
                    <option value="comedy">Comedy & Entertainment</option>
                    <option value="music">Music & Acoustic Arts</option>
                    <option value="beauty">Beauty & Aesthetics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Audience Size / Reach</label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600] bg-white"
                  >
                    <option value="">Select tier...</option>
                    <option value="10k-50k">10,000 – 50,000</option>
                    <option value="50k-150k">50,000 – 150,000</option>
                    <option value="150k-500k">150,000 – 500,000</option>
                    <option value="500k+">500,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Brands or Ethos You Strongly Support</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Hardware repairability, open-source software, transparent pricing, sustainable materials..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  ></textarea>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0a0a0a] text-white rounded-lg font-medium text-sm hover:bg-[#262626] transition-all cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    Submit Alignment Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      enterDemo('CREATOR');
                    }}
                    className="w-full py-2.5 text-center text-xs text-[#76746e] hover:text-[#ff6600] transition-colors cursor-pointer"
                  >
                    Or skip straight to Creator Workspace →
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-serif text-2xl text-[#181816]">Application Received</h4>
                <p className="text-xs text-[#76746e] max-w-sm mx-auto leading-relaxed">
                  Thank you! Your creator profile has been queued for alignment review. We'll verify your channel values and notify you when matching brand briefs are ready.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      enterDemo('CREATOR');
                    }}
                    className="px-6 py-2.5 bg-[#ff6600] text-white rounded-full text-xs font-medium hover:bg-[#e65c00] transition-all inline-block cursor-pointer"
                  >
                    Go to Creator Workspace →
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-[#0a0a0a] text-white rounded-full text-xs font-medium hover:bg-[#262626] transition-all"
                    style={{ color: '#ffffff' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Brand Partner */}
      {activeModal === 'brand' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#181816]/10 mb-5">
              <h3 className="font-serif text-2xl text-[#181816] font-medium">Partner with CRAB as a Brand</h3>
              <button
                onClick={closeModal}
                className="text-[#76746e] hover:text-[#181816] text-2xl leading-none cursor-pointer p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {!brandSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBrandSubmitted(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-[#76746e] leading-relaxed">
                  Find authentic creators who naturally appreciate what you build. Direct connections, zero spam.
                </p>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Brand / Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Your Company"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Company Website</label>
                  <input
                    type="url"
                    required
                    placeholder="https://yourbrand.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Target Creator Niche</label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600] bg-white"
                  >
                    <option value="">Select target niche...</option>
                    <option value="tech">Developer Tools & Productivity</option>
                    <option value="fashion">Fashion & Lifestyle</option>
                    <option value="fitness">Health, Fitness & Athletics</option>
                    <option value="culinary">Culinary & Hospitality</option>
                    <option value="travel">Travel & Outdoor Exploration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Estimated Campaign Budget</label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600] bg-white"
                  >
                    <option value="">Select budget tier...</option>
                    <option value="5k-15k">$5,000 – $15,000</option>
                    <option value="15k-50k">$15,000 – $50,000</option>
                    <option value="50k+">$50,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#4a4944] mb-1">Campaign Deliverables & Objective</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Seeking dedicated long-form video integrations and genuine workflow features..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#181816]/15 text-sm focus:outline-none focus:border-[#ff6600]"
                  ></textarea>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0a0a0a] text-white rounded-lg font-medium text-sm hover:bg-[#262626] transition-all cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    Request Creator Discovery Access
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      enterDemo('BRAND');
                    }}
                    className="w-full py-2.5 text-center text-xs text-[#76746e] hover:text-[#ff6600] transition-colors cursor-pointer"
                  >
                    Or skip straight to Brand Workspace →
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-serif text-2xl text-[#181816]">Discovery Request Received</h4>
                <p className="text-xs text-[#76746e] max-w-sm mx-auto leading-relaxed">
                  We've received your brand brief. Our team will review your alignment parameters and reach out within 24 hours with curated creator recommendations.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      enterDemo('BRAND');
                    }}
                    className="px-6 py-2.5 bg-[#ff6600] text-white rounded-full text-xs font-medium hover:bg-[#e65c00] transition-all inline-block cursor-pointer"
                  >
                    Go to Brand Workspace →
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-[#0a0a0a] text-white rounded-full text-xs font-medium hover:bg-[#262626] transition-all"
                    style={{ color: '#ffffff' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom-Left Indicator */}
      <div
        className="fixed bottom-4 left-4 z-40 w-7 h-7 rounded-full bg-[#181816] text-[#F9F7F3] flex items-center justify-center font-mono font-bold text-xs shadow-md select-none"
        title="CRAB Platform"
      >
        N
      </div>
    </div>
  );
}

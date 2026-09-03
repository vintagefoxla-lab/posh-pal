import React from 'react'

/**
 * TikTokTemplates — TikTok/Reels video overlay templates (9:16 ratio)
 * 
 * Designed for use as video overlays or static title cards in short-form 
 * video content. Each template has a transparent-safe area at the bottom 
 * for captions/UI elements.
 * 
 * Variants:
 *   "before-after"    — Before vs After split comparison overlay
 *   "poshpal-in-15"  — "Posh Pal in 15 Seconds" feature highlight frame
 * 
 * Usage:
 *   <TikTokTemplates.BeforeAfter />
 *   <TikTokTemplates.PoshPalIn15 />
 */

// ─── SVG Filters & Gradients ──────────────────────────────────────

const Defs = () => (
  <defs>
    <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#6366F1" />
      <stop offset="100%" stopColor="#4F46E5" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#F59E0B" />
      <stop offset="100%" stopColor="#D97706" />
    </linearGradient>
    <linearGradient id="violetGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#8B5CF6" />
      <stop offset="100%" stopColor="#7C3AED" />
    </linearGradient>
    <linearGradient id="bgDark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0F172A" />
      <stop offset="100%" stopColor="#1E293B" />
    </linearGradient>
    <filter id="shadow-sm">
      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.2" />
    </filter>
    <filter id="shadow-lg">
      <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#6366F1" floodOpacity="0.3" />
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
)

// ─── Variant 1: Before vs After Overlay ───────────────────────────

const BeforeAfter = () => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />

    {/* Background */}
    <rect width="1080" height="1920" fill="url(#bgDark)" />

    {/* Decorative circles */}
    <circle cx="200" cy="300" r="250" fill="url(#violetGrad)" fillOpacity="0.06" />
    <circle cx="900" cy="800" r="300" fill="url(#brandGrad)" fillOpacity="0.05" />
    <circle cx="540" cy="1600" r="350" fill="url(#emeraldGrad)" fillOpacity="0.04" />

    {/* Logo top */}
    <g transform="translate(60, 60)">
      <rect x="0" y="8" width="36" height="30" rx="5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="3" />
      <path d="M12 8V5C12 2.8 13.8 1 16 1C18.2 1 20 2.8 20 5V8" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14L20 12L22 10L24 12L22 14Z" fill="#6366F1" />
      <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" fontStyle="italic">Posh</text>
      <text x="118" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#A5B4FC" fontStyle="italic">Pal</text>
    </g>

    {/* Title */}
    <text x="540" y="200" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="48" fill="#FFFFFF" textAnchor="middle" filter="url(#shadow-sm)">Before vs After</text>

    {/* ─── BEFORE (Left) ──────────────────────────────────────── */}
    <g transform="translate(70, 280)">
      {/* Card background */}
      <rect x="0" y="0" width="440" height="560" rx="24" fill="#1E293B" stroke="#334155" strokeWidth="2" />

      {/* Label */}
      <rect x="0" y="0" width="440" height="60" rx="24" fill="#475569" />
      <rect x="0" y="30" width="440" height="30" fill="#475569" />
      <text x="220" y="40" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle" letterSpacing="3">BEFORE</text>

      {/* Manual icon */}
      <g transform="translate(220, 140)">
        <circle cx="0" cy="0" r="36" fill="#475569" />
        <text y="14" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#FFFFFF" textAnchor="middle">⏰</text>
      </g>

      {/* Stats */}
      <text x="220" y="230" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="#94A3B8" textAnchor="middle">Manual Sharing</text>

      {/* Stat items */}
      {[
        { label: 'Hours/Day', value: '2h', color: '#FC8181' },
        { label: 'Engagement', value: 'Low', color: '#F6AD55' },
        { label: 'Sales/Mo', value: '$800', color: '#F6AD55' },
      ].map((stat, i) => (
        <g key={i} transform={`translate(60, ${300 + i * 70})`}>
          <text x="0" y="0" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#64748B">{stat.label}</text>
          <text x="320" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill={stat.color} textAnchor="end">{stat.value}</text>
          {i < 2 && <line x1="0" y1="30" x2="320" y2="30" stroke="#334155" strokeWidth="1" />}
        </g>
      ))}
    </g>

    {/* VS divider */}
    <g transform="translate(540, 560)">
      <circle cx="0" cy="0" r="40" fill="url(#brandGrad)" filter="url(#shadow-sm)" />
      <text x="0" y="10" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" textAnchor="middle">VS</text>
    </g>

    {/* ─── AFTER (Right) ─────────────────────────────────────── */}
    <g transform="translate(570, 280)">
      {/* Card background */}
      <rect x="0" y="0" width="440" height="560" rx="24" fill="#0F2B1D" stroke="#10B981" strokeWidth="2" />

      {/* Label */}
      <rect x="0" y="0" width="440" height="60" rx="24" fill="#10B981" />
      <rect x="0" y="30" width="440" height="30" fill="#10B981" />
      <text x="220" y="40" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle" letterSpacing="3">AFTER</text>

      {/* Automation icon */}
      <g transform="translate(220, 140)">
        <circle cx="0" cy="0" r="36" fill="#065F46" />
        <text y="14" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#FFFFFF" textAnchor="middle">🤖</text>
      </g>

      {/* Stats */}
      <text x="220" y="230" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="#6EE7B7" textAnchor="middle">Posh Pal Auto</text>

      {/* Stat items */}
      {[
        { label: 'Hours/Day', value: '0h', color: '#68D391' },
        { label: 'Engagement', value: '3x', color: '#68D391' },
        { label: 'Sales/Mo', value: '$2,800', color: '#68D391' },
      ].map((stat, i) => (
        <g key={i} transform={`translate(60, ${300 + i * 70})`}>
          <text x="0" y="0" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#6EE7B7">{stat.label}</text>
          <text x="320" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill={stat.color} textAnchor="end">{stat.value}</text>
          {i < 2 && <line x1="0" y1="30" x2="320" y2="30" stroke="#065F46" strokeWidth="1" />}
        </g>
      ))}
    </g>

    {/* Bottom CTA */}
    <g transform="translate(540, 980)">
      <rect x="-180" y="-30" width="360" height="60" rx="30" fill="url(#brandGrad)" filter="url(#shadow-lg)" />
      <text x="0" y="8" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle">Try Posh Pal Free →</text>
    </g>

    {/* Safe-area bottom note */}
    <text x="540" y="1060" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" fill="#64748B" textAnchor="middle" letterSpacing="2" textTransform="uppercase">PoshPal.app</text>
  </svg>
)

// ─── Variant 2: Posh Pal in 15 Seconds ────────────────────────────

const PoshPalIn15 = () => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />

    {/* Background */}
    <rect width="1080" height="1920" fill="#FFFFFF" />
    <rect width="1080" height="960" fill="#F8FAFC" />
    <circle cx="900" cy="300" r="400" fill="url(#brandGrad)" fillOpacity="0.04" />
    <circle cx="200" cy="1500" r="350" fill="url(#violetGrad)" fillOpacity="0.03" />

    {/* Logo top-left */}
    <g transform="translate(60, 60)">
      <rect x="0" y="8" width="36" height="30" rx="5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="3" />
      <path d="M12 8V5C12 2.8 13.8 1 16 1C18.2 1 20 2.8 20 5V8" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14L20 12L22 10L24 12L22 14Z" fill="#6366F1" />
      <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#0F172A" fontStyle="italic">Posh</text>
      <text x="118" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#6366F1" fontStyle="italic">Pal</text>
    </g>

    {/* Header */}
    <text x="540" y="200" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="32" fill="#6366F1" textAnchor="middle" letterSpacing="3">⚡ Posh Pal in 15 Seconds</text>

    {/* Feature cards — 3 rows */}
    {[
      {
        icon: '📸',
        title: '1. Snap & List',
        desc: 'Take a photo. AI writes the listing. Done in 10 seconds.',
        color: '#6366F1',
        bg: '#EEF2FF',
        x: 80, y: 280,
      },
      {
        icon: '🔄',
        title: '2. Auto-Share',
        desc: 'Set it once. Your closet shares 24/7 — even while you sleep.',
        color: '#8B5CF6',
        bg: '#EDE9FE',
        x: 80, y: 440,
      },
      {
        icon: '📊',
        title: '3. Optimize & Profit',
        desc: 'Smart pricing, cross-listing, and analytics that grow revenue.',
        color: '#10B981',
        bg: '#D1FAE5',
        x: 80, y: 600,
      },
    ].map((feature) => (
      <g key={feature.title} transform={`translate(${feature.x}, ${feature.y})`}>
        <rect x="0" y="0" width="920" height="140" rx="20" fill={feature.bg} stroke={feature.color} strokeWidth="1.5" strokeOpacity="0.3" />
        {/* Icon */}
        <text x="50" y="85" fontSize="48" textAnchor="middle">{feature.icon}</text>
        {/* Text */}
        <text x="120" y="55" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="26" fill="#0F172A">{feature.title}</text>
        <text x="120" y="95" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="18" fill="#475569">{feature.desc}</text>
      </g>
    ))}

    {/* Speed timer */}
    <g transform="translate(540, 820)">
      <circle cx="0" cy="0" r="60" fill="url(#amberGrad)" filter="url(#shadow-sm)" />
      {/* Clock hands */}
      <line x1="0" y1="-30" x2="0" y2="0" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="20" y2="-10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
      <text x="0" y="90" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#D97706" textAnchor="middle">15 sec setup</text>
    </g>

    {/* CTA */}
    <g transform="translate(540, 1020)">
      <rect x="-180" y="-30" width="360" height="60" rx="30" fill="url(#brandGrad)" filter="url(#shadow-lg)" />
      <text x="0" y="8" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF" textAnchor="middle">Start with Posh Pal →</text>
    </g>

    {/* Trust badges */}
    <g transform="translate(540, 1100)">
      <text x="-140" y="0" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle">$15/mo flat</text>
      <circle cx="0" cy="-6" r="3" fill="#94A3B8" />
      <text x="0" y="0" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle">Cancel anytime</text>
      <circle cx="136" cy="-6" r="3" fill="#94A3B8" />
      <text x="140" y="0" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle">Every feature</text>
    </g>

    {/* Bottom */}
    <text x="540" y="1180" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" fill="#CBD5E1" textAnchor="middle" letterSpacing="4" textTransform="uppercase">PoshPal.app</text>
  </svg>
)

// ─── Exports ──────────────────────────────────────────────────────

export { BeforeAfter, PoshPalIn15 }

const TikTokTemplates = { BeforeAfter, PoshPalIn15 }

export default TikTokTemplates
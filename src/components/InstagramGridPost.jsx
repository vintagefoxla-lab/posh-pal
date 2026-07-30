import React from 'react'

/**
 * InstagramGridPost — Instagram square post template (1:1 ratio)
 * 
 * Base wrapper for Instagram grid posts. Provides the 1:1 frame
 * with brand styling. Three variants available via the `variant` prop.
 * 
 * Variants:
 *   "earnings-growth" — Success story teaser card
 *   "ai-listing"      — AI Listing Generator feature spotlight
 *   "did-you-know"    — Educational post about Poshmark sharing
 * 
 * Usage:
 *   <InstagramGridPost variant="earnings-growth" />
 *   <InstagramGridPost variant="ai-listing" />
 *   <InstagramGridPost variant="did-you-know" />
 */

const GRADIENT_BRAND = 'url(#brandGrad)'
const GRADIENT_EMERALD = 'url(#emeraldGrad)'
const GRADIENT_AMBER = 'url(#amberGrad)'
const GRADIENT_VIOLET = 'url(#violetGrad)'

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
    <filter id="shadow-sm">
      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.15" />
    </filter>
    <filter id="shadow-lg">
      <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#6366F1" floodOpacity="0.25" />
    </filter>
  </defs>
)

// ─── Variant 1: Earnings Growth (Success Story Teaser) ────────────

const EarningsGrowth = () => (
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />

    {/* Background — dark gradient */}
    <rect width="1080" height="1080" rx="40" fill="#0F172A" />
    <circle cx="900" cy="200" r="400" fill="url(#brandGrad)" fillOpacity="0.08" />
    <circle cx="200" cy="900" r="300" fill="url(#emeraldGrad)" fillOpacity="0.05" />

    {/* Logo top-left */}
    <g transform="translate(60, 60)">
      {/* Shopping bag icon */}
      <rect x="0" y="8" width="36" height="30" rx="5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="3" />
      <path d="M12 8V5C12 2.8 13.8 1 16 1C18.2 1 20 2.8 20 5V8" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14L20 12L22 10L24 12L22 14Z" fill="#6366F1" />
      {/* Wordmark */}
      <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" fontStyle="italic">Posh</text>
      <text x="110" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#A5B4FC" fontStyle="italic">Pal</text>
    </g>

    {/* Main content */}
    <g transform="translate(0, 240)">
      {/* Reseller avatar */}
      <circle cx="540" cy="80" r="70" fill="url(#brandGrad)" />
      <text x="540" y="100" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="56" fill="#FFFFFF" textAnchor="middle">S</text>

      {/* Reseller name */}
      <text x="540" y="200" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="40" fill="#FFFFFF" textAnchor="middle">Sarah Scaled to</text>

      {/* Earnings growth — big bold number */}
      <text x="540" y="310" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="120" fill="#10B981" textAnchor="middle" filter="url(#shadow-lg)">+$2,000</text>
      <text x="540" y="370" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="36" fill="#6EE7B7" textAnchor="middle" letterSpacing="4">PER MONTH</text>

      {/* Decorative line */}
      <line x1="340" y1="430" x2="740" y2="430" stroke="#334155" strokeWidth="2" strokeDasharray="8 4" />

      {/* Stats row */}
      <g transform="translate(240, 470)">
        <text x="0" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="48" fill="#A5B4FC" textAnchor="middle">5</text>
        <text x="0" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#64748B" textAnchor="middle" letterSpacing="2" textTransform="uppercase">LISTINGS/WK</text>
        <text x="180" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="48" fill="#A5B4FC" textAnchor="middle" textDecoration="line-through">$800</text>
        <text x="180" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#64748B" textAnchor="middle" letterSpacing="2">BEFORE</text>
        <line x1="300" y1="-20" x2="300" y2="40" stroke="#334155" strokeWidth="2" />
        <text x="360" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="48" fill="#10B981" textAnchor="middle">25</text>
        <text x="360" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#64748B" textAnchor="middle" letterSpacing="2">LISTINGS/WK</text>
        <text x="540" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="48" fill="#10B981" textAnchor="middle">$2,800</text>
        <text x="540" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill="#64748B" textAnchor="middle" letterSpacing="2">AFTER</text>
      </g>

      {/* Arrow indicator */}
      <g transform="translate(540, 560)">
        <path d="M-20 0L0 20L20 0" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* CTA */}
      <rect x="340" y="620" width="400" height="60" rx="30" fill="url(#brandGrad)" filter="url(#shadow-sm)" />
      <text x="540" y="658" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF" textAnchor="middle">Try Posh Pal Free →</text>
    </g>

    {/* Bottom tag */}
    <text x="540" y="1020" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#64748B" textAnchor="middle" letterSpacing="4" textTransform="uppercase">PoshPal.app</text>

    {/* Decorative sparkles */}
    <path d="M860 240L852 232L860 224L868 232L860 240Z" fill="#6366F1" fillOpacity="0.6" />
    <path d="M160 640L154 634L160 628L166 634L160 640Z" fill="#10B981" fillOpacity="0.4" />
  </svg>
)

// ─── Variant 2: AI Listing Generator (Feature Spotlight) ──────────

const AIListingPost = () => (
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />

    {/* Background */}
    <rect width="1080" height="1080" rx="40" fill="#FFFFFF" />
    <rect width="1080" height="540" fill="#F8FAFC" />
    <circle cx="900" cy="200" r="350" fill="url(#brandGrad)" fillOpacity="0.04" />

    {/* Logo top-left */}
    <g transform="translate(60, 60)">
      <rect x="0" y="8" width="36" height="30" rx="5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="3" />
      <path d="M12 8V5C12 2.8 13.8 1 16 1C18.2 1 20 2.8 20 5V8" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14L20 12L22 10L24 12L22 14Z" fill="#6366F1" />
      <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#0F172A" fontStyle="italic">Posh</text>
      <text x="110" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#6366F1" fontStyle="italic">Pal</text>
    </g>

    {/* Main content */}
    <g transform="translate(0, 200)">
      {/* Feature icon — large camera + sparkle */}
      <g transform="translate(540, 80)">
        <rect x="-48" y="-48" width="96" height="96" rx="24" fill="#EEF2FF" />
        <rect x="-44" y="-44" width="88" height="88" rx="20" stroke="#6366F1" strokeWidth="2" fill="none" />
        {/* Camera body */}
        <rect x="-28" y="-8" width="56" height="38" rx="6" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="2.5" />
        <circle cx="0" cy="11" r="12" fill="#C7D2FE" stroke="#6366F1" strokeWidth="2.5" />
        {/* Sparkle */}
        <path d="M16 -20L14 -22L16 -24L18 -22L16 -20Z" fill="#6366F1" />
        <path d="M28 -12L26 -14L28 -16L30 -14L28 -12Z" fill="#6366F1" fillOpacity="0.6" />
        {/* Flash */}
        <circle cx="24" cy="-2" r="2.5" fill="#6366F1" />
      </g>

      {/* Headline */}
      <text x="540" y="230" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="52" fill="#0F172A" textAnchor="middle">Snap a Photo.</text>
      <text x="540" y="300" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="52" fill="#6366F1" textAnchor="middle">Get a Listing.</text>

      {/* Description */}
      <text x="540" y="370" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="22" fill="#64748B" textAnchor="middle">
        <tspan x="540" dy="0">AI writes optimized titles, descriptions,</tspan>
        <tspan x="540" dy="32">and tags — all from one photo.</tspan>
      </text>

      {/* Speed callout */}
      <g transform="translate(540, 460)">
        <rect x="-140" y="-30" width="280" height="60" rx="16" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.5" />
        <text x="0" y="0" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="28" fill="#4F46E5" textAnchor="middle">10 Seconds → 1 Listing</text>
      </g>

      {/* Feature tags row */}
      <g transform="translate(200, 560)">
        {['AI-Powered', 'Optimized SEO', 'Bulk Create'].map((tag, i) => (
          <g key={i}>
            <rect x={i * 230} y="-20" width="200" height="40" rx="20" fill={i === 0 ? '#6366F1' : '#F1F5F9'} />
            <text x={i * 230 + 100} y="8" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="16" fill={i === 0 ? '#FFFFFF' : '#64748B'} textAnchor="middle" letterSpacing="1">{tag}</text>
          </g>
        ))}
      </g>

      {/* CTA */}
      <rect x="340" y="660" width="400" height="60" rx="30" fill="url(#brandGrad)" filter="url(#shadow-sm)" />
      <text x="540" y="698" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF" textAnchor="middle">Try AI Listing →</text>
    </g>

    {/* Bottom tag */}
    <text x="540" y="1020" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle" letterSpacing="4" textTransform="uppercase">PoshPal.app</text>
  </svg>
)

// ─── Variant 3: Did You Know? (Educational) ──────────────────────

const DidYouKnow = () => (
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Defs />

    {/* Background — soft violet gradient */}
    <rect width="1080" height="1080" rx="40" fill="#F5F3FF" />
    <circle cx="200" cy="200" r="400" fill="url(#violetGrad)" fillOpacity="0.04" />
    <circle cx="900" cy="800" r="300" fill="url(#brandGrad)" fillOpacity="0.03" />

    {/* Logo top-left */}
    <g transform="translate(60, 60)">
      <rect x="0" y="8" width="36" height="30" rx="5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="3" />
      <path d="M12 8V5C12 2.8 13.8 1 16 1C18.2 1 20 2.8 20 5V8" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 14L20 12L22 10L24 12L22 14Z" fill="#6366F1" />
      <text x="50" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#0F172A" fontStyle="italic">Posh</text>
      <text x="110" y="28" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="#6366F1" fontStyle="italic">Pal</text>
    </g>

    {/* Main content */}
    <g transform="translate(0, 200)">
      {/* Did you know pill */}
      <g transform="translate(540, 40)">
        <rect x="-110" y="-20" width="220" height="40" rx="20" fill="url(#brandGrad)" />
        <text x="0" y="6" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill="#FFFFFF" textAnchor="middle" letterSpacing="3" textTransform="uppercase">⚡ Did you know?</text>
      </g>

      {/* Big stat number */}
      <text x="540" y="200" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="160" fill="#8B5CF6" textAnchor="middle" filter="url(#shadow-sm)">3x</text>

      {/* Stat label */}
      <text x="540" y="260" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="32" fill="#0F172A" textAnchor="middle" letterSpacing="2">MORE ENGAGEMENT</text>
      <text x="540" y="300" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="20" fill="#64748B" textAnchor="middle">when you share your closet 3-4 times/day</text>

      {/* Time comparison */}
      <g transform="translate(540, 380)">
        {/* Manual */}
        <rect x="-280" y="-40" width="240" height="80" rx="16" fill="#FFFFFF" stroke="#E2E8F0" />
        <text x="-160" y="-8" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#94A3B8" textAnchor="middle">⏰ 2h</text>
        <text x="-160" y="20" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle" letterSpacing="1">MANUAL SHARING</text>

        {/* Arrow */}
        <text x="0" y="10" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="28" fill="#6366F1" textAnchor="middle">→</text>

        {/* Automated */}
        <rect x="40" y="-40" width="240" height="80" rx="16" fill="#EDE9FE" stroke="#C4B5FD" />
        <text x="160" y="-8" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#7C3AED" textAnchor="middle">🤖 0h</text>
        <text x="160" y="20" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#7C3AED" textAnchor="middle" letterSpacing="1">AUTO-SHARING</text>
      </g>

      {/* Feature callout */}
      <g transform="translate(540, 520)">
        <rect x="-240" y="-30" width="480" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" />
        <text x="0" y="4" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="#475569" textAnchor="middle">
          Pro Tip: 24/7 sharing = more eyes = more sales
        </text>
      </g>

      {/* Benefit items */}
      <g transform="translate(200, 620)">
        {[
          { text: 'Stays at top of search results' },
          { text: 'Works while you sleep' },
          { text: 'Boosts algorithm visibility' },
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 55})`}>
            <rect x="0" y="-4" width="22" height="22" rx="6" fill="#D1FAE5" />
            <path d="M6 7L9 10L16 3" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="34" y="12" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="18" fill="#334155">{item.text}</text>
          </g>
        ))}
      </g>

      {/* CTA */}
      <rect x="290" y="800" width="500" height="60" rx="30" fill="url(#brandGrad)" filter="url(#shadow-sm)" />
      <text x="540" y="838" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF" textAnchor="middle">Try Posh Pal Free →</text>
    </g>

    {/* Bottom tag */}
    <text x="540" y="1020" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#94A3B8" textAnchor="middle" letterSpacing="4" textTransform="uppercase">PoshPal.app</text>
  </svg>
)

// ─── Main Export ──────────────────────────────────────────────────

const InstagramGridPost = ({ variant = 'earnings-growth' }) => {
  switch (variant) {
    case 'earnings-growth':
      return <EarningsGrowth />
    case 'ai-listing':
      return <AIListingPost />
    case 'did-you-know':
      return <DidYouKnow />
    default:
      return <EarningsGrowth />
  }
}

export default InstagramGridPost
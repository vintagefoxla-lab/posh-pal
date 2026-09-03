import React from 'react'
import { Sparkles, TrendingUp, Star, Zap, ChevronRight } from 'lucide-react'

/**
 * FeaturedSuccessStoryHeader — OG Image / Blog Header Template (1200×630)
 * 
 * A high-converting hero graphic for reseller success story blog posts.
 * Designed at 1200×630 for Open Graph / social sharing, but responsive
 * for use as a blog header component.
 * 
 * Props:
 *   name: string — reseller name (e.g., "Posh Pal Reseller")
 *   handle: string — social handle (e.g., "@reseller")
 *   growth: string — profit increase (e.g., "+$2,000/mo")
 *   growthPercent: string — percentage growth (e.g., "+200%")
 *   niche: string — reseller niche (e.g., "Vintage & Designer")
 *   avatarInitial: string — single letter for avatar
 *   beforeRevenue: string — pre-Posh Pal revenue (e.g., "$800/mo")
 *   afterRevenue: string — post-Posh Pal revenue (e.g., "$2,800/mo")
 * 
 * Usage:
 *   <FeaturedSuccessStoryHeader 
 *     name="Posh Pal Reseller" 
 *     growth="+$2,000/mo" 
 *     growthPercent="+200%" 
 *     ...
 *   />
 */

const FeaturedSuccessStoryHeader = ({
  name = 'Posh Pal Reseller',
  handle = '',
  growth = '',
  growthPercent = '',
  niche = 'Poshmark Reselling',
  avatarInitial = 'P',
  beforeRevenue = '',
  afterRevenue = ''
}) => {
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1200/630' }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-400/5 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #818CF8 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-16 py-12">
        {/* ─── Posh Pal Brand Bar ─────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-black italic text-white uppercase tracking-widest">
            Posh Pal
          </span>
          <span className="w-px h-5 bg-white/20" />
          <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">
            Featured Success Story
          </span>
        </div>

        {/* ─── Main Stat ──────────────────────────────────────────── */}
        {growthPercent && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-400/30 rounded-full px-5 py-2 mb-5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-base font-black text-emerald-300 uppercase tracking-widest">
                {growthPercent} Profit Growth
              </span>
            </div>
          </div>
        )}

        {/* ─── Revenue Comparison ─────────────────────────────────── */}
        {beforeRevenue && afterRevenue && (
          <div className="flex items-center gap-8 mb-8">
            {/* Before */}
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Before</p>
              <p className="text-2xl font-black text-slate-500 line-through decoration-slate-600">{beforeRevenue}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-gradient-to-r from-slate-600 via-brand-400 to-slate-600" />
              <ChevronRight className="w-5 h-5 text-brand-400 -mt-2.5" />
            </div>

            {/* After */}
            <div className="text-center">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">After Posh Pal</p>
              <p className="text-4xl font-black text-white">{afterRevenue}</p>
              {growthPercent && (
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{growthPercent}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Reseller Info ──────────────────────────────────────── */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-xl ring-2 ring-white/20 shrink-0">
            {avatarInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-black text-white">{name}</p>
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs font-medium text-slate-400">{handle}</p>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <p className="text-xs font-medium text-slate-400">{niche}</p>
            </div>
          </div>
          
          {/* Growth stat */}
          {growth && (
            <div className="ml-auto text-right">
              <p className="text-2xl font-black text-emerald-400">{growth}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Growth</p>
            </div>
          )}
        </div>

        {/* ─── Bottom Tagline ─────────────────────────────────────── */}
        <p className="text-[10px] font-medium text-slate-600 mt-6">
          poshpal.team/blog/{name.toLowerCase().replace(/[^a-z]/g, '-')}-success-story
        </p>
      </div>
    </div>
  )
}

export default FeaturedSuccessStoryHeader

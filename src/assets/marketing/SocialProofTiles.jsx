import React from 'react'
import { Quote, Star, TrendingUp, BadgeCheck, ShoppingBag, Zap, Sparkles, Heart } from 'lucide-react'

/**
 * SocialProofTiles — Influencer Quote Cards for Landing Pages
 * 
 * High-conversion social proof components featuring quotes from top
 * influencer targets. Designed to be embedded in the influencer landing
 * page or any marketing surface.
 * 
 * Exports:
 *   SocialProofTile — Individual quote card
 *   SocialProofGrid — Responsive grid of tiles
 * 
 * Usage:
 *   <SocialProofGrid />
 *   <SocialProofTile influencer={...} variant="default|compact|featured" />
 */

const INFLUENCERS = []

// ─── Individual Tile ──────────────────────────────────────────────────

export const SocialProofTile = ({ 
  influencer, 
  variant = 'default',
  className = '' 
}) => {
  const { name, handle, initial, niche, quote, stat, statLabel, verified, featured, gradient } = influencer
  
  // Featured: large, prominent card with gradient avatar
  if (variant === 'featured' || featured) {
    return (
      <div className={`card p-6 md:p-8 relative overflow-hidden ${className}`}>
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-white pointer-events-none" />
        
        <div className="relative z-10">
          {/* Quote icon */}
          <Quote className="w-8 h-8 text-brand-200 mb-4" />
          
          {/* Quote text */}
          <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium mb-5">
            "{quote}"
          </p>
          
          {/* Influencer info */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl ring-4 ring-white shadow-lg shrink-0`}>
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-black text-slate-900">{name}</p>
                {verified && <BadgeCheck className="w-4 h-4 text-brand-500 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{handle}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{niche}</p>
              
              {/* Stars */}
              <div className="flex items-center gap-0.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            
            {/* Stat */}
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-emerald-600">{stat}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{statLabel}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default: compact card
  return (
    <div className={`card p-5 hover:border-brand-100 hover:shadow-sm transition-all ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-sm ring-2 ring-white shadow shrink-0`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-800">{name}</p>
            {verified && <BadgeCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{handle}</p>
        </div>
        
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      
      {/* Quote */}
      <div className="flex gap-1.5 mb-3">
        <Quote className="w-3.5 h-3.5 text-brand-200 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 leading-relaxed">"{quote}"</p>
      </div>
      
      {/* Stat bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-medium">{niche}</p>
        <div className="text-right">
          <p className="text-sm font-black text-emerald-600">{stat}</p>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{statLabel}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Responsive Grid ──────────────────────────────────────────────────

export const SocialProofGrid = ({ className = '' }) => {
  const featuredInfluencer = INFLUENCERS.find(i => i.featured)
  const otherInfluencers = INFLUENCERS.filter(i => !i.featured)

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <Heart className="w-5 h-5 text-rose-500" />
        <h2 className="text-lg font-black text-slate-900">Resellers Getting Started</h2>
      </div>

      {/* Featured influencer (large card) */}
      <SocialProofTile 
        influencer={featuredInfluencer} 
        variant="featured" 
      />

      {/* Other influencers (2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherInfluencers.map(inf => (
          <SocialProofTile 
            key={inf.id} 
            influencer={inf} 
            variant="default" 
          />
        ))}
      </div>

      {/* Bottom stat bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-bold text-slate-700">New platform — community growing</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-700">AI listings, sharing & cross-listing</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-700">$15/mo flat Pro price</span>
        </div>
      </div>
    </div>
  )
}

// ─── Default Export ───────────────────────────────────────────────────

export default SocialProofGrid

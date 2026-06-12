import React from 'react'
import { Zap, TrendingUp, Clock, Hash, Calendar, Lock, Sparkles } from 'lucide-react'

// ─── Fake monthly trend data ─────────────────────────────────────────

function generateTrendData(brand, category, tier) {
  const baseValue = tier === 'Luxury' ? 85 
    : tier === 'Premium' ? 70 
    : tier === 'Mid-Range' ? 55 
    : 40

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const seasonalBoost = {
    'Jackets':    [90, 85, 70, 50, 35, 30],
    'Sweaters':   [85, 80, 65, 45, 30, 25],
    'Shoes':      [60, 55, 65, 75, 80, 85],
    'Tops':       [40, 45, 60, 75, 85, 90],
    'Bottoms':    [50, 55, 65, 75, 80, 75],
    'Dresses':    [25, 35, 60, 85, 95, 90],
    'Accessories':[45, 45, 50, 55, 60, 60],
    'Other':      [55, 55, 55, 55, 55, 55],
  }

  const boosts = seasonalBoost[category] || seasonalBoost['Other']
  
  return months.map((month, i) => {
    const seasonal = boosts[i]
    const noise = Math.round((Math.random() - 0.5) * 12)
    return {
      month,
      value: Math.max(10, Math.min(100, baseValue + (seasonal - 50) * 0.6 + noise)),
      seasonality: seasonal > 65 ? 'Peak' : seasonal > 45 ? 'Moderate' : 'Low',
    }
  })
}

// ─── Fake keyword data ──────────────────────────────────────────────

function generateKeywords(brand, category, tier) {
  const categoryWords = {
    'Jackets': ['Insulated', 'Waterproof', 'Shell', 'Down', 'Fleece', 'Hooded', 'Lightweight', 'Winter', 'Packable', 'Windbreaker'],
    'Tops': ['Cotton', 'Casual', 'Graphic', 'Striped', 'Basic', 'Linen', 'Button-up', 'Polo', 'Henley', 'Muscle'],
    'Bottoms': ['Slim', 'Straight', 'Relaxed', 'Cargo', 'Jogger', 'Chino', 'Denim', 'Cuffed', 'Stretch', 'High-waist'],
    'Shoes': ['Sneakers', 'Running', 'Casual', 'Leather', 'Canvas', 'Slip-on', 'Lace-up', 'Boots', 'Loafers', 'Platform'],
    'Accessories': ['Leather', 'Minimal', 'Statement', 'Vintage', 'Gold', 'Silver', 'Chain', 'Woven', 'Knitted', 'Beaded'],
    'Dresses': ['Floral', 'Maxi', 'Midi', 'Bodycon', 'Wrap', 'A-line', 'Summer', 'Evening', 'Slip', 'Sundress'],
    'Sweaters': ['Cashmere', 'Wool', 'Crewneck', 'Turtleneck', 'Chunky', 'Cardigan', 'Cable', 'Merino', 'V-neck', 'Oversized'],
    'Other': ['Vintage', 'Unique', 'Bundle', 'Rare', 'Collectible', 'Limited', 'Signed', 'Set', 'Complete', 'Custom'],
  }
  
  const words = categoryWords[category] || categoryWords['Other']
  return words.map((word, i) => ({
    word: `${word}`,
    weight: Math.round((10 - i * 0.8) + Math.random() * 2),
  })).sort((a, b) => b.weight - a.weight)
}

// ─── Share time heatmap data ────────────────────────────────────────

function generateHeatmap(tier, demand) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const times = ['Morning\n9am-12pm', 'Afternoon\n12-5pm', 'Evening\n5-10pm']
  
  // Create a grid of 7×3 with intensity 0-3
  const grid = days.map((day, di) => {
    return times.map((time, ti) => {
      // Evening peak on weekdays, morning on weekends
      let intensity
      if (di < 5) { // weekday
        intensity = ti === 2 ? 3 : ti === 1 ? 2 : 1
      } else { // weekend
        intensity = ti === 2 ? 2 : ti === 0 ? 3 : 1
      }
      // Add randomness
      if (Math.random() > 0.7) intensity = Math.max(0, intensity - 1)
      if (Math.random() > 0.85) intensity = Math.min(3, intensity + 1)
      return intensity
    })
  })
  
  return { days, times, grid }
}

// ─── Pro Gating Wrapper ─────────────────────────────────────────────

const ProGate = ({ unlocked, children }) => {
  if (unlocked) return children

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none scale-[1.02] select-none">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 z-10">
        <div className="bg-amber-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ring-2 ring-amber-400/30">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <h4 className="text-white font-black text-lg mb-1">Pro Feature</h4>
        <p className="text-slate-400 text-xs text-center max-w-[200px] mb-4">
          Unlock market insights, demand charts, and keyword analytics
        </p>
        <button className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" />
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────

const DemandChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value))
  const minVal = Math.min(...data.map(d => d.value))
  const range = maxVal - minVal || 1

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-brand-500" />
        <h4 className="text-sm font-bold text-slate-900">Demand Trend (6 Months)</h4>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-32 md:h-40 px-1">
        {data.map((point, i) => {
          const heightPct = ((point.value - minVal) / range) * 80 + 15
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group">
              <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {point.value}%
              </span>
              <div 
                className="w-full rounded-lg transition-all duration-700 ease-out cursor-pointer relative"
                style={{ 
                  height: `${heightPct}%`,
                  animation: `barGrow 0.6s ease-out ${i * 0.08}s both`,
                }}
              >
                <div className={`absolute inset-0 rounded-lg ${
                  point.seasonality === 'Peak' 
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    : point.seasonality === 'Moderate'
                    ? 'bg-gradient-to-t from-brand-500 to-brand-400'
                    : 'bg-gradient-to-t from-slate-400 to-slate-300'
                }`} />
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[9px] font-bold text-slate-400">{point.month}</span>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-t from-emerald-500 to-emerald-400" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Peak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-t from-brand-500 to-brand-400" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-t from-slate-400 to-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Low</span>
        </div>
      </div>
    </div>
  )
}

const KeywordCloud = ({ keywords }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-4 h-4 text-brand-500" />
        <h4 className="text-sm font-bold text-slate-900">Top Keywords</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => {
          const sizeMap = {
            1: 'text-[10px]',
            2: 'text-[11px]',
            3: 'text-xs',
            4: 'text-sm',
            5: 'text-sm',
            6: 'text-base',
            7: 'text-base',
            8: 'text-lg',
            9: 'text-lg',
            10: 'text-xl',
          }
          const size = sizeMap[kw.weight] || 'text-xs'
          const color = kw.weight > 7 
            ? 'text-brand-600 bg-brand-50 border-brand-100' 
            : kw.weight > 5 
            ? 'text-slate-700 bg-slate-50 border-slate-100' 
            : 'text-slate-400 bg-white border-slate-100'
          
          return (
            <span 
              key={i}
              className={`${size} font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-sm cursor-default ${color}`}
              style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` }}
            >
              {kw.word}
            </span>
          )
        })}
      </div>
    </div>
  )
}

const ShareHeatmap = ({ days, times, grid }) => {
  const intensityColors = [
    'bg-slate-100 border-slate-200',       // 0 — low
    'bg-amber-50 border-amber-200',        // 1 — moderate
    'bg-emerald-100 border-emerald-300',   // 2 — good
    'bg-emerald-500 border-emerald-600',   // 3 — best
  ]
  const intensityLabels = ['Low', 'Fair', 'Good', 'Best']

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-brand-500" />
        <h4 className="text-sm font-bold text-slate-900">Best Time to Share</h4>
      </div>
      
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[400px]">
          {/* Header row: days */}
          <div className="grid grid-cols-8 gap-1.5 mb-1.5">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-end pb-1" />
            {days.map((day, di) => (
              <div key={di} className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center pb-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Time rows */}
          {times.map((time, ti) => (
            <div key={ti} className="grid grid-cols-8 gap-1.5 mb-1.5">
              <div className="text-[8px] font-bold text-slate-400 flex items-center leading-tight">
                {time}
              </div>
              {days.map((_, di) => {
                const intensity = grid[di][ti]
                return (
                  <div 
                    key={di}
                    className={`aspect-square rounded-lg border ${intensityColors[intensity]} transition-all duration-300 relative group cursor-default`}
                  >
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                      {intensity === 3 && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {intensityLabels[intensity]}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Heatmap legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
        {intensityLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded ${intensityColors[i].split(' ')[0]}`} />
            <span className="text-[9px] font-bold text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main MarketInsights Component ───────────────────────────────────

const MarketInsights = ({ brand, category, condition, tierName, demand, poshpal_pro = false }) => {
  if (!brand && !category) return null

  const trendData = generateTrendData(brand, category, 
    tierName === 'Luxury' ? 'Luxury' : 
    tierName === 'Premium' ? 'Premium' : 
    tierName === 'Budget' ? 'Budget' : 'Mid-Range'
  )
  const keywords = generateKeywords(brand, category, tierName)
  const heatmap = generateHeatmap(tierName, demand)

  const content = (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="badge-accent text-[9px]">Pro</span>
        <span className="text-xs font-bold text-slate-400">Market Insights</span>
      </div>

      {/* Demand Chart */}
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <DemandChart data={trendData} />
      </div>

      {/* Keyword Cloud + Heatmap grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <KeywordCloud keywords={keywords} />
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <ShareHeatmap days={heatmap.days} times={heatmap.times} grid={heatmap.grid} />
        </div>
      </div>
    </div>
  )

  return (
    <ProGate unlocked={poshpal_pro}>
      {content}
    </ProGate>
  )
}

export default MarketInsights
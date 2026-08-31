import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign, 
  Sparkles, 
  ArrowRight,
  MousePointer2,
  Trophy,
  PieChart
} from 'lucide-react'

/**
 * InfluencerROI — Premium Earnings Calculator
 * 
 * Visualizes potential earnings for influencers based on audience size and engagement.
 * Part of Phase 6: Growth Scaling & Influencer Partnerships.
 */

const InfluencerROI = () => {
  const [audience, setAudience] = useState(25000)
  const [engagement, setEngagement] = useState(2.5)
  
  // Constants derived from Posh Pal simulation data
  const CONVERSION_RATE = 0.12 // 12% conversion from click to signup (from Instagram simulation)
  const PAYOUT_PER_SIGNUP = 15.00 // $15 per Pro conversion
  
  const stats = useMemo(() => {
    const clicks = Math.round(audience * (engagement / 100))
    const conversions = Math.round(clicks * CONVERSION_RATE)
    const monthlyEarnings = conversions * PAYOUT_PER_SIGNUP
    const annualEarnings = monthlyEarnings * 12
    
    return {
      clicks,
      conversions,
      monthlyEarnings,
      annualEarnings
    }
  }, [audience, engagement])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  const formatNumber = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
    return val
  }

  return (
    <div className="card overflow-hidden border-indigo-100 shadow-xl shadow-indigo-500/5">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 md:p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <PieChart className="w-32 h-32 rotate-12" />
        </div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4 ring-1 ring-white/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">Earnings Calculator</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
            How Much Could You <span className="text-amber-400 italic">Earn?</span>
          </h2>
          <p className="text-indigo-100/80 text-sm max-w-md font-medium">
            Join the Posh Pal Partner Program and turn your audience into recurring monthly revenue.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Controls */}
          <div className="space-y-8">
            {/* Audience Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Audience Size
                </label>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black text-sm ring-1 ring-indigo-100">
                  {formatNumber(audience)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={audience}
                onChange={(e) => setAudience(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>1K</span>
                <span>500K</span>
              </div>
            </div>

            {/* Engagement Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                  <MousePointer2 className="w-4 h-4 text-indigo-500" />
                  Engagement Rate
                </label>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black text-sm ring-1 ring-indigo-100">
                  {engagement}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={engagement}
                onChange={(e) => setEngagement(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>0.5%</span>
                <span>10%</span>
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Clicks</p>
                <p className="text-lg font-black text-slate-800">{formatNumber(stats.clicks)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Signups</p>
                <p className="text-lg font-black text-slate-800">{formatNumber(stats.conversions)}</p>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="relative">
            <div className="bg-slate-900 rounded-3xl p-8 text-center h-full flex flex-col justify-center border-b-4 border-amber-500 shadow-2xl">
              <div className="absolute top-4 right-4">
                <Trophy className="w-8 h-8 text-amber-500/20" />
              </div>
              
              <p className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Potential Monthly Revenue</p>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-8 h-8 text-white/30" />
                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                  {formatCurrency(stats.monthlyEarnings).replace('$', '')}
                </span>
              </div>
              
              <p className="text-slate-400 text-sm font-medium mb-8">
                Based on <span className="text-white font-bold">{CONVERSION_RATE * 100}%</span> conversion rate
              </p>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-500 text-xs font-bold uppercase">Estimated Annual</span>
                  <span className="text-emerald-400 font-black text-xl">{formatCurrency(stats.annualEarnings)}</span>
                </div>
                
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                  Become a Partner
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Instant Payouts</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Unlimited Scaling</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Partner Rewards</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfluencerROI

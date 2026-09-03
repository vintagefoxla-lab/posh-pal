import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Share2,
  DollarSign,
  Target,
  Zap,
  Sparkles,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Gift,
  Award,
  Star,
  Trophy,
  ChevronDown,
  Filter,
  ExternalLink,
  CheckCircle2,
  MousePointer2,
  UserPlus
} from 'lucide-react'

/**
 * AnalyticsDashboardPhase6 — Phase 6 Upgraded Analytics
 */

// ─── Mini Line Chart ────────────────────────────────────────────────

const MiniLineChart = ({ data, height = 40, color = 'brand', labels = [] }) => {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 80 - 10
    return `${x}% ${y}%`
  }).join(', ')

  const colorMap = {
    brand: 'stroke-brand-500 fill-brand-500/10',
    emerald: 'stroke-emerald-500 fill-emerald-500/10',
    amber: 'stroke-amber-500 fill-amber-500/10',
    violet: 'stroke-violet-500 fill-violet-500/10',
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className={`w-full ${colorMap[color] || colorMap.brand}`} preserveAspectRatio="none" style={{ height }}>
        <polyline fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-sm" />
        <polygon points={`0% 100%, ${points}, 100% 100%`} className="opacity-20" />
      </svg>
      {labels.length > 0 && (
        <div className="flex justify-between mt-1">
          {labels.map((l, i) => (
            <span key={i} className="text-[8px] font-bold text-slate-400 uppercase">{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Progress Ring ──────────────────────────────────────────────────

const ProgressRing = ({ current, target, label, unit, color = 'brand' }) => {
  const pct = Math.min(100, (current / target) * 100)
  const colorMap = {
    brand: { ring: 'stroke-brand-500', track: 'stroke-brand-100', text: 'text-brand-600' },
    emerald: { ring: 'stroke-emerald-500', track: 'stroke-emerald-100', text: 'text-emerald-600' },
    amber: { ring: 'stroke-amber-500', track: 'stroke-amber-100', text: 'text-amber-600' },
  }
  const c = colorMap[color] || colorMap.brand
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="5" className={c.track} />
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${c.ring} transition-all duration-1000 ease-out`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-black ${c.text}`}>{Math.round(pct)}%</span>
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5">{label}</p>
      <p className="text-[10px] font-bold text-slate-500 text-center">
        {unit === '$' ? `$${current.toLocaleString()}` : current.toLocaleString()} / {unit === '$' ? `$${target.toLocaleString()}` : target.toLocaleString()} {unit !== '$' && unit !== '%' ? unit : ''}
      </p>
    </div>
  )
}

const QUICK_FILTERS = [
  { id: 'referrals', label: 'Referrals', icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'conversions', label: 'Conversions', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'top_performers', label: 'Top Performers', icon: Trophy, color: 'text-brand-600', bg: 'bg-brand-50' },
]

const LEADERBOARD_DATA = [
  // No fabricated leaderboard. Real referrers are loaded from /api/analytics/leaderboard.
  // Until real referrals exist, this stays empty (honest state).
]

// ─── Main Component ──────────────────────────────────────────────────

const AnalyticsDashboardPhase6 = ({ onBack, userFetch, isPro }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewScope, setViewScope] = useState('all')
  const [scopeOpen, setScopeOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [viewScopes, setViewScopes] = useState([
    { id: 'all', label: 'All Users' },
    { id: 'default_user', label: 'Default User' },
  ])
  const [activeSubTab, setActiveSubTab] = useState('performance')
  const [attribution, setAttribution] = useState([])
  const [trend, setTrend] = useState([])

  const load = async () => {
    try {
      // 1. Fetch Summary
      const response = await userFetch('/api/analytics/summary', {
        headers: {
          'X-View-Filter': viewScope,
          'X-User-ID': localStorage.getItem('poshpal_user_id') || 'default_user'
        }
      })

      // 2. Fetch Leaderboard
      const lbRes = await userFetch('/api/analytics/leaderboard')
      let leaderboardData = LEADERBOARD_DATA
      if (lbRes.ok) {
        const lbRaw = await lbRes.json()
        leaderboardData = lbRaw.leaderboard || LEADERBOARD_DATA
        
        // Update View Scopes with top 5 influencers
        const top5 = leaderboardData.slice(0, 5).map(r => ({
          id: r.id || r.code,
          label: r.name || r.handle || r.code
        }))
        
        const baseScopes = [
          { id: 'all', label: 'All Users' },
          { id: 'default_user', label: 'Default User' }
        ]
        const newScopes = [...baseScopes]
        top5.forEach(s => {
          if (!newScopes.find(ns => ns.id === s.id)) {
            newScopes.push(s)
          }
        })
        setViewScopes(newScopes)
      }

      if (response.ok) {
        const raw = await response.json()
        setData({
          share_volume: { current: parseInt(raw.total_shares) || 0, target: 1000, unit: 'shares' },
          offer_conversion_rate: { current: parseFloat(raw.conversion_rate) || 0, target: 20, unit: '%' },
          total_revenue: { current: parseFloat(raw.total_revenue) || 0, target: 5000.00, unit: '$' },
          listing_velocity: { current: raw.listing_velocity ?? 8, target: 15, unit: '/day' },
          top_categories: raw.top_categories || [],
          weekly_trend: raw.weekly_shares || [],
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          referral_count: parseInt(raw.referral_count) || 0,
          referral_conversions: parseInt(raw.referral_conversions) || 0,
          referral_revenue: parseFloat(raw.referral_revenue) || 0,
          referral_trend: raw.referral_weekly || [],
          referral_growth: parseFloat(raw.referral_growth) || 0,
          conversion_growth: parseFloat(raw.conversion_growth) || 0,
          referral_revenue_growth: parseFloat(raw.referral_revenue_growth) || 0,
          leaderboard: leaderboardData,
        })
      }

      if (activeSubTab === 'roi') {
        const attrRes = await userFetch('/api/analytics/attribution')
        if (attrRes.ok) setAttribution(await attrRes.json())
        
        const trendRes = await userFetch('/api/analytics/traffic-trend')
        if (trendRes.ok) setTrend(await trendRes.json())
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [viewScope, activeSubTab])

  const toggleFilter = (id) => {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const filteredLeaderboard = useMemo(() => {
    if (!data?.leaderboard) return []
    let items = [...data.leaderboard]
    if (activeFilters.includes('referrals')) {
      items = items.sort((a, b) => b.referrals - a.referrals)
    }
    if (activeFilters.includes('conversions')) {
      items = items.sort((a, b) => b.conversions - a.conversions)
    }
    if (activeFilters.includes('top_performers')) {
      items = items.filter(i => i.referrals >= 3)
    }
    return items
  }, [data, activeFilters])

  const currentScopeLabel = viewScopes.find(s => s.id === viewScope)?.label || 'All Users'

  if (loading && !data) {
    return (
      <div className="fade-in-up">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <div className="card p-8 text-center">
          <div className="w-10 h-10 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="fade-in-up pb-10">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden mb-5">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 text-brand-600 tool-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Analytics Dashboard</h2>
                <p className="text-xs text-slate-500 font-medium">Track your reselling performance</p>
              </div>
            </div>
            <button
              onClick={() => { setLoading(true); load() }}
              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 flex gap-4 border-b border-slate-50">
          <button 
            onClick={() => setActiveSubTab('performance')}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'performance' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Performance
          </button>
          <button 
            onClick={() => setActiveSubTab('roi')}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'roi' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Marketing ROI
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="filter-bar">
            <div className="relative">
              <button
                onClick={() => setScopeOpen(!scopeOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                {currentScopeLabel}
                <ChevronDown className={`w-3 h-3 transition-transform ${scopeOpen ? 'rotate-180' : ''}`} />
              </button>
              {scopeOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-lg z-20 overflow-hidden fade-in-up">
                  {viewScopes.map((scope) => (
                    <button
                      key={scope.id}
                      onClick={() => { setViewScope(scope.id); setScopeOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                        viewScope === scope.id
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeSubTab === 'performance' && (
              <>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider hidden sm:inline">|</span>
                {QUICK_FILTERS.map((f) => {
                  const isActive = activeFilters.includes(f.id)
                  const Icon = f.icon
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFilter(f.id)}
                      className={`filter-chip flex items-center gap-1.5 ${
                        isActive ? 'filter-chip-active' : 'filter-chip-inactive'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {f.label}
                    </button>
                  )
                })}

                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="text-[9px] font-bold text-slate-400 hover:text-danger underline ml-auto"
                  >
                    Clear
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {activeSubTab === 'performance' ? (
        <div className="space-y-5">
          <div className="card p-6">
            <div className="grid grid-cols-3 gap-4">
              <ProgressRing current={data.share_volume.current} target={data.share_volume.target} label="Share Volume" unit={data.share_volume.unit} color="brand" />
              <ProgressRing current={data.offer_conversion_rate.current} target={data.offer_conversion_rate.target} label="Conversion Rate" unit={data.offer_conversion_rate.unit} color="emerald" />
              <ProgressRing current={data.total_revenue.current} target={data.total_revenue.target} label="Total Revenue" unit={data.total_revenue.unit} color="amber" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500" />
                <span className="input-label mb-0">Weekly Share Activity</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{data.weekly_trend.reduce((a, b) => a + b, 0).toLocaleString()} total</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <MiniLineChart data={data.weekly_trend} height={60} color="brand" labels={data.days} />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-amber-500" />
              <span className="input-label mb-0">Referral Campaign Performance</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Referrals</span>
                </div>
                <p className="text-3xl font-black text-amber-900">{data.referral_count}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600">+{data.referral_growth}%</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Conversions</span>
                </div>
                <p className="text-3xl font-black text-emerald-900">{data.referral_conversions}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600">+{data.conversion_growth}%</span>
                </div>
              </div>
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-brand-500" />
                  <span className="text-[9px] font-black text-brand-700 uppercase tracking-widest">Revenue</span>
                </div>
                <p className="text-3xl font-black text-brand-900">${data.referral_revenue.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600">+{data.referral_revenue_growth}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="input-label mb-0">Top Referrers</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{filteredLeaderboard.length} referrers</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Referrer</th>
                    <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Referrals</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Conversions</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((referrer, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          referrer.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          referrer.rank === 2 ? 'bg-slate-100 text-slate-600' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {referrer.rank}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xs">
                            {referrer.name ? referrer.name[0] : (referrer.handle ? referrer.handle[0] : '?')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{referrer.name || referrer.handle}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{referrer.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-mono">{referrer.code}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-slate-800">{referrer.referrals}</td>
                      <td className="px-6 py-3 text-right font-bold text-slate-800">{referrer.conversions}</td>
                      <td className="px-6 py-3 text-right font-bold text-emerald-600">${referrer.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-rose-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Spend</span>
              </div>
              <p className="text-2xl font-black text-slate-900">${attribution.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proj. Revenue</span>
              </div>
              <p className="text-2xl font-black text-slate-900">${attribution.reduce((sum, s) => sum + s.revenue, 0).toFixed(2)}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. CAC</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                ${(attribution.reduce((sum, s) => sum + s.cost, 0) / (attribution.reduce((sum, s) => sum + s.signups, 0) || 1)).toFixed(2)}
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Overall ROI</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {((attribution.reduce((sum, s) => sum + s.revenue - s.cost, 0) / (attribution.reduce((sum, s) => sum + s.cost, 0) || 1)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500" />
                <span className="input-label mb-0">Visits vs. Signups (Trend)</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Visits</p>
                <MiniLineChart data={trend.map(t => t.visits)} height={50} color="brand" labels={trend.map(t => t.date.split('-')[2])} />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Signups</p>
                <MiniLineChart data={trend.map(t => t.signups)} height={50} color="emerald" labels={trend.map(t => t.date.split('-')[2])} />
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="input-label mb-0">Channel Performance</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Spend</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Visits</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Signups</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Conv. Rate</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">CAC</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                    <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {attribution.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-xs">
                      <td className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider">{s.source}</td>
                      <td className="px-6 py-4 text-right text-slate-600 font-bold">${s.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-600 font-bold">{s.visits}</td>
                      <td className="px-6 py-4 text-right text-slate-900 font-black">{s.signups}</td>
                      <td className="px-6 py-4 text-right text-brand-600 font-black">{s.conversion_rate}</td>
                      <td className="px-6 py-4 text-right text-rose-600 font-bold">${s.cac}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-black">${s.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded-lg font-black ${parseFloat(s.roi) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {s.roi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!localStorage.getItem('poshpal_pro') && (
        <div className="mt-5 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-white">Real-time Analytics & Referrals</p>
              <p className="text-xs text-slate-400 font-medium">Pro plan gets hourly refreshes, ROI tracking, and channel attribution</p>
            </div>
          </div>
          <span className="badge-accent text-[9px]">Pro</span>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboardPhase6

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
  CheckCircle2
} from 'lucide-react'

/**
 * AnalyticsDashboardPhase6 — Phase 6 Upgraded Analytics
 * 
 * Adds:
 *   a) User/Influencer filter bar (view scope selector + quick filter chips)
 *   b) Referral Campaign KPIs (referrals, conversions, revenue from referrals)
 *   c) Referral Leaderboard table
 *   d) Referral campaign trend chart
 * 
 * Usage: Same interface as existing AnalyticsDashboard
 * Props:
 *   onBack, userFetch, isPro — same as original
 */

// ─── Mini Line Chart ────────────────────────────────────────────────

const MiniLineChart = ({ data, height = 40, color = 'brand' }) => {
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
    <svg viewBox="0 0 100 100" className={`w-full ${colorMap[color] || colorMap.brand}`} preserveAspectRatio="none" style={{ height }}>
      <polyline fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-sm" />
      <polygon points={`0% 100%, ${points}, 100% 100%`} className="opacity-20" />
    </svg>
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
      <p className="text-[10px] font-bold text-slate-500">
        {unit === '$' ? `$${current.toLocaleString()}` : current.toLocaleString()} / {unit === '$' ? `$${target.toLocaleString()}` : target.toLocaleString()} {unit !== '$' && unit !== '%' ? unit : ''}
      </p>
    </div>
  )
}

// ─── View Filter Configuration ──────────────────────────────────────────

const VIEW_SCOPES = [
  { id: 'all', label: 'All Users' },
  { id: 'default_user', label: 'Default User' },
  { id: 'influencer_sarah', label: "Sarah's Closet" },
  { id: 'reseller_pro', label: 'Pro Reseller' },
  { id: 'new_user_123', label: 'New User' },
]

const QUICK_FILTERS = [
  { id: 'referrals', label: 'Referrals', icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'conversions', label: 'Conversions', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'top_performers', label: 'Top Performers', icon: Trophy, color: 'text-brand-600', bg: 'bg-brand-50' },
]

// ─── Mock Leaderboard Data ──────────────────────────────────────────────

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Sarah M.', handle: '@sarahscloset', code: 'SARAH20', referrals: 12, conversions: 8, revenue: 480, tier: '🔥 Lifetime Free' },
  { rank: 2, name: 'James K.', handle: '@jamesvintage', code: 'JAMES10', referrals: 7, conversions: 5, revenue: 320, tier: '🏆 50% Discount' },
  { rank: 3, name: 'Lisa R.', handle: '@lilysthrifts', code: 'LISAREF', referrals: 3, conversions: 2, revenue: 160, tier: '⭐ 1 Month Free' },
  { rank: 4, name: 'Mike T.', handle: '@mikethrifts', code: 'MIKEYT', referrals: 2, conversions: 1, revenue: 80, tier: '⭐ 1 Month Free' },
  { rank: 5, name: 'Emma W.', handle: '@emmascloset', code: 'EMMA20', referrals: 1, conversions: 1, revenue: 60, tier: '—' },
]

// ─── Main Component ──────────────────────────────────────────────────

const AnalyticsDashboardPhase6 = ({ onBack, userFetch, isPro }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewScope, setViewScope] = useState('all')
  const [scopeOpen, setScopeOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])

  const load = async () => {
    try {
      const response = await userFetch('/api/analytics/summary', {
        headers: {
          'X-View-Filter': viewScope,
          'X-User-ID': localStorage.getItem('poshpal_user_id') || 'default_user'
        }
      })
      if (response.ok) {
        const raw = await response.json()
        setData({
          share_volume: { current: parseInt(raw.total_shares) || 0, target: 1000, unit: 'shares' },
          offer_conversion_rate: { current: parseFloat(raw.conversion_rate) || 0, target: 20, unit: '%' },
          total_revenue: { current: parseFloat(raw.total_revenue) || 0, target: 5000.00, unit: '$' },
          listing_velocity: { current: raw.listing_velocity ?? 8, target: 15, unit: '/day' },
          top_categories: raw.top_categories || [
            { name: 'Jackets', count: 28, revenue: 820 },
            { name: 'Sneakers', count: 22, revenue: 1450 },
            { name: 'Tops', count: 18, revenue: 340 },
            { name: 'Accessories', count: 12, revenue: 210 },
          ],
          weekly_trend: raw.weekly_shares || [320, 410, 380, 490, 560, 620, 580],
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          // --- NEW: Referral KPIs ---
          referral_count: parseInt(raw.referral_count) || 23,
          referral_conversions: parseInt(raw.referral_conversions) || 14,
          referral_revenue: parseFloat(raw.referral_revenue) || 1280.00,
          referral_trend: raw.referral_weekly || [2, 3, 1, 5, 4, 6, 3],
          referral_growth: parseFloat(raw.referral_growth) || 12,
          conversion_growth: parseFloat(raw.conversion_growth) || 8,
          referral_revenue_growth: parseFloat(raw.referral_revenue_growth) || 22,
          leaderboard: raw.leaderboard || LEADERBOARD_DATA,
        })
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [viewScope])

  const toggleFilter = (id) => {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  // Memoize leaderboard filter
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

  const currentScopeLabel = VIEW_SCOPES.find(s => s.id === viewScope)?.label || 'All Users'

  if (loading) {
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
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="space-y-5">
        {/* ─── Header + Filter Bar ─────────────────────────────── */}
        <div className="card overflow-hidden">
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

          {/* ─── View Scope Selector ───────────────────────────── */}
          <div className="px-6 pt-4">
            <div className="filter-bar">
              {/* Scope Dropdown */}
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
                    {VIEW_SCOPES.map((scope) => (
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

              {/* Quick Filters */}
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

              {/* Clear filters */}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="text-[9px] font-bold text-slate-400 hover:text-danger underline ml-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ─── Progress Rings ────────────────────────────────── */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <ProgressRing current={data.share_volume.current} target={data.share_volume.target} label="Share Volume" unit={data.share_volume.unit} color="brand" />
              <ProgressRing current={data.offer_conversion_rate.current} target={data.offer_conversion_rate.target} label="Conversion Rate" unit={data.offer_conversion_rate.unit} color="emerald" />
              <ProgressRing current={data.total_revenue.current} target={data.total_revenue.target} label="Total Revenue" unit={data.total_revenue.unit} color="amber" />
            </div>
          </div>

          {/* ─── Weekly Trend ──────────────────────────────────── */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500" />
                <span className="input-label mb-0">Weekly Share Activity</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{data.weekly_trend.reduce((a, b) => a + b, 0).toLocaleString()} total</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <MiniLineChart data={data.weekly_trend} height={60} color="brand" />
              <div className="flex justify-between mt-1">
                {data.days.map((d, i) => (
                  <span key={i} className="text-[8px] font-bold text-slate-400 uppercase">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── NEW: Referral Campaign KPIs ─────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="input-label mb-0">Referral Campaign Performance</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Referral Count */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Referrals</span>
              </div>
              <p className="text-3xl font-black text-amber-900">{data.referral_count}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">+{data.referral_growth}% vs last month</span>
              </div>
            </div>

            {/* Conversion Count */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Conversions</span>
              </div>
              <p className="text-3xl font-black text-emerald-900">{data.referral_conversions}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">+{data.conversion_growth}% vs last month</span>
              </div>
            </div>

            {/* Revenue from Referrals */}
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-brand-500" />
                <span className="text-[9px] font-black text-brand-700 uppercase tracking-widest">Referral Revenue</span>
              </div>
              <p className="text-3xl font-black text-brand-900">${data.referral_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">+{data.referral_revenue_growth}% vs last month</span>
              </div>
            </div>
          </div>

          {/* Referral Campaign Trend Chart */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="input-label mb-0">Weekly Referral Signups</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{data.referral_trend.reduce((a, b) => a + b, 0)} total</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <MiniLineChart data={data.referral_trend} height={50} color="amber" />
              <div className="flex justify-between mt-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <span key={i} className="text-[8px] font-bold text-slate-400 uppercase">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── NEW: Referral Leaderboard ──────────────────────────── */}
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
                  <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-sm text-slate-400 font-medium">
                      No referrers match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((referrer, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          referrer.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          referrer.rank === 2 ? 'bg-slate-100 text-slate-600' :
                          referrer.rank === 3 ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {referrer.rank}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xs">
                            {referrer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{referrer.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{referrer.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-mono tracking-wider">
                          {referrer.code}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-bold text-slate-800">{referrer.referrals}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-bold text-slate-800">{referrer.conversions}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-bold text-emerald-600">${referrer.revenue}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] font-bold text-slate-600">{referrer.tier}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Offer Conversion */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="input-label mb-0">Offer Conversion</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.offer_conversion_rate.current}%</p>
            <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (data.offer_conversion_rate.current / data.offer_conversion_rate.target) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Target: {data.offer_conversion_rate.target}%</p>
          </div>

          {/* Listing Velocity */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="input-label mb-0">Listing Velocity</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.listing_velocity.current}<span className="text-lg text-slate-400">/day</span></p>
            <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (data.listing_velocity.current / data.listing_velocity.target) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Target: {data.listing_velocity.target}/day</p>
          </div>
        </div>

        {/* ─── Top Categories ──────────────────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              <span className="input-label mb-0">Top Categories</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {data.top_categories.map((cat, i) => {
                const maxRev = Math.max(...data.top_categories.map(c => c.revenue))
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <span className="font-bold text-slate-900">${cat.revenue}</span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-400 to-brand-500 h-full rounded-full" style={{ width: `${(cat.revenue / maxRev) * 100}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">{cat.count} items</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── Revenue Highlight ──────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Total Revenue Generated</span>
            </div>
            <p className="text-4xl font-black text-amber-900">
              ${data.total_revenue.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Target: ${data.total_revenue.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* ─── Pro Upsell ──────────────────────────────────────────── */}
        {!localStorage.getItem('poshpal_pro') && (
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-bold text-white">Real-time Analytics & Referrals</p>
                <p className="text-xs text-slate-400">Pro plan gets hourly refreshes, referral tracking, and exportable reports</p>
              </div>
            </div>
            <span className="badge-accent text-[9px]">Pro</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboardPhase6
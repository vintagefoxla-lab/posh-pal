import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  Calendar,
  CheckCircle2,
  Filter,
  BarChart3,
  MousePointer2,
  Gift,
  Activity,
  ArrowUpRight,
  Wallet,
  Download
} from 'lucide-react'

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
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className={`w-full ${colorMap[color] || colorMap.brand}`} preserveAspectRatio="none" style={{ height }}>
        <polyline fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        <polygon points={`0% 100%, ${points}, 100% 100%`} className="opacity-10" />
      </svg>
    </div>
  )
}

// ─── Funnel Step ──────────────────────────────────────────────────

const FunnelStep = ({ label, value, subValue, percentage, color = 'brand' }) => {
  const colorMap = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-full h-24 flex items-center justify-center relative z-10">
        <div 
          className={`${colorMap[color]} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg transition-all duration-700`}
          style={{ width: `${percentage}%`, height: '80%' }}
        >
          <span className="text-xl font-black">{value.toLocaleString()}</span>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</span>
        </div>
      </div>
      {subValue && (
        <div className="mt-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subValue}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────

const PartnerDashboard = ({ onBack, userFetch }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [payouts] = useState([
    { id: 'PAY-001', date: '2026-07-01', amount: 450.00, status: 'Paid', method: 'PayPal' },
    { id: 'PAY-002', date: '2026-06-01', amount: 320.00, status: 'Paid', method: 'PayPal' },
    { id: 'PAY-003', date: '2026-05-01', amount: 510.00, status: 'Paid', method: 'Direct Deposit' },
    { id: 'PAY-004', date: '2026-04-01', amount: 280.00, status: 'Paid', method: 'PayPal' },
  ])

  const copyLink = () => {
    const link = `https://poshpal.team/ref/${code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadData = async () => {
    try {
      // Get user info for code
      const userRes = await userFetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: localStorage.getItem('poshpal_user_id') || 'default_user' })
      })
      if (userRes.ok) {
        const user = await userRes.json()
        setCode(user.referral_code)
      }

      // We'll use the existing referrals API for global trends but could use a specific user one if we add it
      const response = await userFetch('/api/analytics/referrals')
      if (response.ok) {
        const stats = await response.json()
        setData({
          referrals: stats.referral_count || 0,
          conversions: stats.referral_conversions || 0,
          revenue: stats.referral_revenue || 0,
          growth: stats.referral_growth || 0,
          revGrowth: stats.referral_revenue_growth || 0,
          weekly: stats.referral_weekly || [0, 0, 0, 0, 0, 0, 0],
          clicks: Math.floor((stats.referral_count || 1) * 3.4), // Simulated clicks
        })
      }
    } catch (e) {
      console.error('Failed to load partner stats', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  const commissionEarned = data.revenue
  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0)
  const pendingPayout = commissionEarned > 0 ? 150.00 : 0 // Simulated

  return (
    <div className="fade-in-up pb-20">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-none shadow-xl shadow-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] font-black">+{data.revGrowth}%</span>
            </div>
          </div>
          <p className="text-3xl font-black">${commissionEarned.toLocaleString()}</p>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">Monthly Commission</p>
        </div>

        <div className="card p-6 bg-white border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-2 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Available</span>
          </div>
          <p className="text-3xl font-black text-slate-900">${pendingPayout.toLocaleString()}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Pending Payout</p>
        </div>

        <div className="card p-6 bg-white border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-2 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime</span>
          </div>
          <p className="text-3xl font-black text-slate-900">${totalPayouts.toLocaleString()}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Payouts</p>
        </div>
      </div>

      {/* Referral Info */}
      <div className="card p-6 mb-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Gift className="w-24 h-24 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">Your Partner Link</h3>
            <p className="text-slate-400 text-xs font-medium">Share this link to earn $15 per Pro subscription</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 font-mono font-bold text-brand-400">
              {`poshpal.team/ref/${code}`}
            </div>
            <button 
              onClick={copyLink}
              className="w-full sm:w-auto btn-primary bg-brand-500 hover:bg-brand-600 text-white border-none py-3 px-6 flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
              {copied ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Referral Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-500" />
              Referral Funnel
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Clock className="w-3 h-3" />
              Last 30 Days
            </div>
          </div>
          
          <div className="space-y-2">
            <FunnelStep 
              label="Clicks" 
              value={data.clicks} 
              percentage={100} 
              subValue="Link Impressions"
              color="brand" 
            />
            <FunnelStep 
              label="Signups" 
              value={data.referrals} 
              percentage={(data.referrals / data.clicks) * 100} 
              subValue={`${((data.referrals / data.clicks) * 100).toFixed(1)}% Conv.`}
              color="amber" 
            />
            <FunnelStep 
              label="Pro Conversions" 
              value={data.conversions} 
              percentage={(data.conversions / data.clicks) * 100} 
              subValue={`${((data.conversions / data.referrals) * 100).toFixed(1)}% Trial-to-Paid`}
              color="emerald" 
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Performance Trend
            </h3>
          </div>
          <div className="h-48 flex items-end">
            <MiniLineChart data={data.weekly} height={150} color="brand" />
          </div>
          <div className="flex justify-between mt-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <span key={i} className="text-[10px] font-black text-slate-300 uppercase">{day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="card overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            Payout History
          </h3>
          <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-1 hover:text-brand-700 transition-colors">
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="text-left px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="text-right px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{p.id}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{p.date}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-900">${p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PartnerDashboard

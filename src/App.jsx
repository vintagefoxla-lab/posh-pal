import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Tag, 
  Share2, 
  Calculator, 
  ExternalLink, 
  LayoutDashboard,
  CreditCard,
  Zap,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
  Target,
  Rocket,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Trophy
} from 'lucide-react'

import ListingGenerator from './components/ListingGenerator'
import PricingAssistant from './components/PricingAssistant'
import BundleCalculator from './components/BundleCalculator'
import SharingScheduler from './components/SharingScheduler'
import CrossListing from './components/CrossListing'
import { createCheckoutSession } from './services/stripeService'

const SubscriptionPage = ({ onBack, isPro }) => {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    await createCheckoutSession()
    setLoading(false)
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Pro Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="bg-brand-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-2 ring-brand-400/30">
              {isPro ? (
                <Trophy className="w-8 h-8 text-amber-400 fill-amber-400" />
              ) : (
                <Zap className="w-8 h-8 text-brand-400 fill-brand-400" />
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {isPro ? 'You are a Pro!' : 'Posh Pal Pro'}
            </h2>
            <p className="text-slate-400 mt-1 font-medium">
              {isPro ? 'Enjoy your unlimited reselling powers' : 'Supercharge your reselling business'}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-6 md:p-8">
          {!isPro && (
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-5xl font-black text-slate-900">$15</span>
              <span className="text-lg text-slate-400 font-medium">/month</span>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Sparkles, text: 'Unlimited AI Listing Generation', desc: 'Auto-generate titles, descriptions & tags from photos', color: 'text-brand-600', bg: 'bg-brand-50' },
              { icon: Target, text: 'Advanced Pricing Comps', desc: 'Real-time market analysis & optimal price suggestions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Clock, text: '24/7 Auto-Sharing Bot', desc: 'Automatic closet sharing around the clock', color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: ExternalLink, text: 'Cross-List to 4 Platforms', desc: 'eBay, Mercari, Depop & more with one click', color: 'text-rose-600', bg: 'bg-rose-50' },
              { icon: Rocket, text: 'Priority Support', desc: 'Fast-track responses & dedicated onboarding', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`${feat.bg} ${feat.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="font-bold text-sm text-slate-900">{feat.text}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isPro ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-emerald-700 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Your subscription is active
              </p>
            </div>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary text-base py-4 relative overflow-hidden group disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600" />
              <span className="relative z-10 flex items-center justify-center gap-2 w-full text-center">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Subscribe Now <ChevronRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
          )}
          
          <p className="text-center text-slate-400 text-xs mt-3 font-medium">
            <CreditCard className="w-3 h-3 inline mr-1" />
            Powered by Stripe · {isPro ? 'Manage your subscription' : 'Cancel anytime'}
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No commitments
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Easy cancellation
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Dashboard = ({ tools, setActiveTab, isPro }) => (
  <div className="space-y-6 fade-in-up">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Listings', value: '124', icon: BarChart3, color: 'text-brand-600', bg: 'bg-brand-50' },
        { label: 'Sales', value: '$2.4k', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Shares', value: '8.2k', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
      ].map((stat, i) => (
        <div key={i} className="stat-card group hover:border-brand-100 transition-all duration-200">
          <div className={`${stat.bg} ${stat.color} stat-icon group-hover:scale-110 transition-transform duration-200`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-slate-900">{stat.value}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* Pro Upgrade Card */}
    {!isPro && (
      <button 
        onClick={() => setActiveTab('subscription')}
        className="w-full card-pro group text-left cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950" />
        <div className="absolute top-0 right-0 p-6 opacity-[0.08] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
          <Zap className="w-32 h-32 text-brand-400 fill-brand-400" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-accent animate-pulse-glow">Limited Time</span>
            <span className="bg-white/10 text-white/70 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              Save 20%
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight leading-tight mb-2">
            Unleash the Bot
          </h3>
          <p className="text-slate-400 text-sm max-w-[240px] md:max-w-[320px] leading-relaxed">
            Get 24/7 auto-sharing, unlimited AI listings, and cross-platform selling.
          </p>
          <div className="mt-4 flex items-center gap-2 text-brand-400 font-bold text-sm group-hover:gap-3 transition-all">
            Upgrade to Pro <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    )}

    {/* Tools Grid */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-900">Your Tools</h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tools.length} available</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => setActiveTab(tool.id)}
            className="card-hover p-5 text-left group"
          >
            <div className={`${tool.bg} ${tool.color} tool-icon mb-4 group-hover:scale-110 transition-transform duration-200`}>
              <tool.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">{tool.name}</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">{tool.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
)

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isPro, setIsPro] = useState(localStorage.getItem('poshpal_pro') === 'true')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setIsPro(true)
      localStorage.setItem('poshpal_pro', 'true')
      // Clean up URL
      window.history.replaceState({}, document.title, "/")
    }
  }, [])

  const tools = [
    { id: 'listing', name: 'Listing Generator', icon: Camera, color: 'text-brand-600', bg: 'bg-brand-50', desc: 'AI description from photo' },
    { id: 'pricing', name: 'Pricing Assistant', icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Find optimal comp prices' },
    { id: 'sharing', name: 'Sharing Scheduler', icon: Share2, color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Auto-share closet items' },
    { id: 'bundle', name: 'Bundle Calculator', icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Calculate deal margins' },
    { id: 'cross', name: 'Cross-Listing', icon: ExternalLink, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Export to eBay & Mercari' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'listing': return <ListingGenerator onBack={() => setActiveTab('dashboard')} isPro={isPro} />
      case 'pricing': return <PricingAssistant onBack={() => setActiveTab('dashboard')} isPro={isPro} />
      case 'bundle': return <BundleCalculator onBack={() => setActiveTab('dashboard')} />
      case 'sharing': return <SharingScheduler onBack={() => setActiveTab('dashboard')} isPro={isPro} />
      case 'cross': return <CrossListing onBack={() => setActiveTab('dashboard')} isPro={isPro} />
      case 'subscription': return <SubscriptionPage onBack={() => setActiveTab('dashboard')} isPro={isPro} />
      default: return <Dashboard tools={tools} setActiveTab={setActiveTab} isPro={isPro} />
    }
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'listing', icon: Camera, label: 'List' },
    { id: 'sharing', icon: Share2, label: 'Share' },
    { id: 'subscription', icon: Zap, label: 'Pro', badge: !isPro },
  ]

  return (
    <div className="min-h-screen bg-surface-alt text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-5xl mx-auto px-4 py-3">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/30 transition-shadow">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-brand-600 tracking-tight italic leading-none">Posh Pal</h1>
                {isPro && (
                  <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Pro</span>
                )}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-tight">AI Reselling</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
              isPro 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200/20' 
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20 hover:shadow-brand-500/30'
            }`}
          >
            {isPro ? (
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            {isPro ? 'Pro Active' : 'Upgrade'}
            {!isPro && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 safe-area-bottom z-20">
        <div className="flex justify-between items-center max-w-lg mx-auto px-2 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-brand-600 bg-brand-50' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-sm' : ''}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
                {item.badge && !isActive && (
                  <div className="absolute -top-0.5 right-2 w-2 h-2 bg-amber-400 border-2 border-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App

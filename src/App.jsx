import React, { useState, useEffect } from 'react'
import { 
  Camera, Tag, Share2, Calculator, ExternalLink, LayoutDashboard,
  CreditCard, Zap, ShoppingBag, Package, TrendingUp, BarChart3,
  Users, Sparkles, ChevronRight, Clock, Target, Rocket,
  CheckCircle2, ArrowLeft, Loader2, Trophy, History, Gift,
  BookOpen, FileText, ArrowUpRight
} from 'lucide-react'

import FoxLogo from './components/FoxLogo'
import ListingGenerator from './components/ListingGenerator'
import PricingAssistant from './components/PricingAssistant'
import BundleCalculator from './components/BundleCalculator'
import SharingScheduler from './components/SharingScheduler'
import CrossListing from './components/CrossListing'
import InventoryManager from './components/InventoryManager'
import OfferManager from './components/OfferManager'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ReferralSection from './components/ReferralSection'
import ReferralLanding from './components/ReferralLanding'
import SwitchUser from './components/SwitchUser'
import InfluencerLandingPage from './components/InfluencerLandingPage'
import MediaKit from './components/MediaKit'
import BlogCMS from './components/BlogCMS'
import { Blog, BlogPost } from './components/Blog'
import { createCheckoutSession, cancelSubscription } from './services/stripeService'
import { SocialProofGrid } from './assets/marketing'

/* ═══════════════════════════════════════════════════════════════════════
   SUBSCRIPTION PAGE
   ═══════════════════════════════════════════════════════════════════════ */

const SubscriptionPage = ({ onBack, isPro, userId, subscriptionStatus, setSubscriptionStatus }) => {
  const [loading, setLoading] = useState(false)
  const handleSubscribe = async () => { setLoading(true); await createCheckoutSession(userId); setLoading(false) }
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You will keep Pro access until the end of your current period.')) return;
    setLoading(true);
    try {
      await cancelSubscription(userId);
      setSubscriptionStatus('canceled');
      alert('Your subscription has been canceled and will not renew.');
    } catch (e) {
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <button onClick={onBack} className="back-btn"><ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard</button>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            {!isPro && (
              <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-400/30 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-brand-300 text-[10px] font-black uppercase tracking-widest">Pro</span>
              </div>
            )}
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-2 ${isPro ? 'bg-amber-500/20 ring-amber-400/30' : 'bg-brand-500/20 ring-brand-400/30'}`}>
              {isPro ? <Trophy className="w-10 h-10 text-amber-400 fill-amber-400" /> : <Zap className="w-10 h-10 text-brand-400 fill-brand-400" />}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
              {isPro ? 'You are a Pro!' : 'Posh Pal Pro'}
            </h2>
            <p className="text-slate-400 text-base font-medium max-w-md mx-auto">
              {isPro ? 'Enjoy unlimited access to every Pro feature.' : 'AI-powered tools that turn hours of work into minutes.'}
            </p>
            {subscriptionStatus === 'canceled' && (
              <div className="mt-4 inline-block bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Subscription Canceled
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!isPro && (
            <div className="text-center mb-6">
              <span className="text-6xl font-black text-slate-900">$15</span>
              <span className="text-lg text-slate-400 font-medium ml-1">/month</span>
              <p className="text-xs text-slate-400 mt-1 font-medium">Full access to all automation tools</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            {[
              { icon: Sparkles, text: 'Unlimited AI Listing Generation', desc: 'Auto-generate titles, descriptions & tags from photos', color: 'text-brand-600', bg: 'bg-brand-50' },
              { icon: Target, text: 'Advanced Pricing Comps', desc: 'Real-time market analysis & optimal price suggestions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Clock, text: '24/7 Auto-Sharing Bot', desc: 'Automatic closet sharing around the clock', color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: History, text: 'Automated Offer Engine', desc: 'Send bulk offers to likers while you sleep', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: ExternalLink, text: 'Cross-List to 6 Platforms', desc: 'eBay, Mercari, Depop, Vinted, Grailed — one click', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-brand-200 hover:shadow-sm transition-all duration-200">
                <div className={`${feat.bg} ${feat.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /><span className="font-bold text-sm text-slate-900">{feat.text}</span></div>
                  <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {isPro ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-700 font-bold text-sm">Your subscription is {subscriptionStatus}</p>
                {subscriptionStatus === 'canceled' && (
                  <p className="text-rose-600 text-[10px] mt-1 font-medium">Will expire at end of current billing period</p>
                )}
              </div>
              
              {subscriptionStatus === 'active' && (
                <button 
                  onClick={handleCancel} 
                  disabled={loading}
                  className="w-full py-3 text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}
                </button>
              )}
            </div>
          ) : (
            <button onClick={handleSubscribe} disabled={loading} className="btn-primary text-base py-4 disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Subscribe Now <ArrowUpRight className="w-4 h-4" /></>}
            </button>
          )}
          <p className="text-center text-slate-400 text-xs mt-3"><CreditCard className="w-3 h-3 inline mr-1" />Powered by Stripe · Secure Checkout</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════ */

const Dashboard = ({ tools, setActiveTab, isPro }) => (
  <div className="space-y-6">
    {/* ─── Dashboard Hero ─────────────────────────────────────────── */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-8 md:p-10 mb-2">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-16 w-80 h-80 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-brand-300/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Fox logo */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 md:w-52 md:h-52 bg-amber-400/20 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <FoxLogo size={180} variant="image" className="md:w-[220px] md:h-[220px]" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight italic bg-gradient-to-r from-white via-brand-200 to-brand-300 bg-clip-text text-transparent mb-2 pr-2">
          Posh Pal
        </h1>
        <p className="text-brand-200/80 text-sm md:text-base font-medium max-w-lg mb-6">
          AI-powered tools that turn hours of reselling work into minutes
        </p>

        {/* Pro badge */}
        {isPro && (
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Pro Active</span>
          </div>
        )}
        
        {/* Quick stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-400" /> No active listings yet
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-amber-400" /> $0 revenue this month
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-violet-400" /> No auto shares yet
          </div>
        </div>
      </div>
    </div>

    {/* ─── Stat Cards ─────────────────────────────────────────────── */}
    <div className="grid grid-cols-3 gap-3 stagger-children">
      {[
        { label: 'Listings', value: '0', sub: 'No data yet', icon: Package, gradient: 'from-brand-500 to-brand-600', glow: 'shadow-brand-500/20' },
        { label: 'Revenue', value: '$0', sub: 'No data yet', icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/20' },
        { label: 'Shares', value: '0', sub: 'No data yet', icon: Share2, gradient: 'from-violet-500 to-violet-600', glow: 'shadow-violet-500/20' },
      ].map((stat, i) => (
        <div key={i} className="stat-card group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className={`stat-icon bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg ${stat.glow}`}>
            <stat.icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stat.value}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          <p className="text-[9px] font-medium text-slate-300 mt-0.5">{stat.sub}</p>
        </div>
      ))}
    </div>

    {/* ─── Pro Upgrade Card ──────────────────────────────────────── */}
    {!isPro && (
      <button onClick={() => setActiveTab('subscription')} className="w-full card-pro group text-left cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 animate-gradient" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #818CF8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
        <div className="absolute top-4 right-6 opacity-[0.07] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
          <Zap className="w-36 h-36 text-brand-400 fill-brand-400" />
        </div>
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight mb-1">Posh Pal Pro</h3>
            <p className="text-slate-400 text-sm">24/7 auto-sharing, unlimited AI listings, cross-platform selling — $15/month</p>
          </div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-sm bg-white/8 rounded-xl px-5 py-3 group-hover:bg-white/12 transition-all shrink-0">
            Upgrade to Pro <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    )}

    {/* ─── Social Proof ──────────────────────────────────────────── */}
    {!isPro && null}

    {/* ─── Tools Grid ────────────────────────────────────────────── */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-white">Your Tools</h2>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{tools.length} available</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
        {tools.map((tool, i) => {
          const accents = ['card-accent-brand', 'card-accent-emerald', 'card-accent-violet', 'card-accent-amber', 'card-accent-rose']
          const accent = accents[i % accents.length]
          return (
            <button key={tool.id} onClick={() => setActiveTab(tool.id)} className={`${accent} p-5 text-left group hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
              <div className={`tool-icon bg-gradient-to-br ${tool.gradient} group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                <tool.icon className={`w-5 h-5 ${tool.color}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight mt-3">{tool.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">{tool.desc}</p>
            </button>
          )
        })}
      </div>
    </div>

    <div className="text-center pb-2">
      <p className="text-[10px] font-medium text-slate-400">Posh Pal · AI-Powered Reselling</p>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════════════════════ */

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userId, setUserId] = useState(localStorage.getItem('poshpal_user_id') || 'default_user')
  const [isPro, setIsPro] = useState(localStorage.getItem('poshpal_pro') === 'true')
  const [subscriptionStatus, setSubscriptionStatus] = useState(localStorage.getItem('poshpal_sub_status') || 'none')
  const [activeBlogPost, setActiveBlogPost] = useState(null)
  const [referralCode, setReferralCode] = useState(null)

  useEffect(() => {
    localStorage.setItem('poshpal_user_id', userId)
    fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
      .then(res => res.json()).then(user => {
        setIsPro(user.is_pro === 1)
        setSubscriptionStatus(user.subscription_status || (user.is_pro === 1 ? 'active' : 'none'))
        localStorage.setItem('poshpal_pro', user.is_pro === 1 ? 'true' : 'false')
        localStorage.setItem('poshpal_sub_status', user.subscription_status || (user.is_pro === 1 ? 'active' : 'none'))
      })
  }, [userId])

  const userFetch = (url, options = {}) => fetch(url, { ...options, headers: { ...options.headers, 'X-User-ID': userId } })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      userFetch('/api/stripe/success', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: params.get('session_id') }) })
        .then(res => res.json()).then(data => { 
          if (data.success) { 
            setIsPro(true); 
            setSubscriptionStatus('active');
            localStorage.setItem('poshpal_pro', 'true');
            localStorage.setItem('poshpal_sub_status', 'active');
          } 
        })
        .catch(console.error).finally(() => window.history.replaceState({}, document.title, "/"))
    }
    const path = window.location.pathname
    const refMatch = path.match(/^\/ref\/(.+)$/)
    if (refMatch) { setReferralCode(refMatch[1]); setActiveTab('ref-landing'); return }
    if (path.startsWith('/blog/')) { const slug = path.split('/')[2]; if (slug) { setActiveBlogPost(slug); setActiveTab('blog-post') } }
    else if (path === '/blog') setActiveTab('blog')
  }, [])

  const tools = [
    { id: 'listing', name: 'Listing Generator', icon: Camera, color: 'text-brand-600', gradient: 'from-brand-50 to-indigo-100', desc: 'AI descriptions from photos' },
    { id: 'inventory', name: 'Inventory Manager', icon: ShoppingBag, color: 'text-indigo-600', gradient: 'from-indigo-50 to-blue-100', desc: 'Track all your items' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-brand-600', gradient: 'from-brand-50 to-indigo-100', desc: 'Performance dashboards' },
    { id: 'pricing', name: 'Pricing Assistant', icon: Tag, color: 'text-emerald-600', gradient: 'from-emerald-50 to-teal-100', desc: 'Optimal price suggestions' },
    { id: 'sharing', name: 'Sharing Scheduler', icon: Share2, color: 'text-violet-600', gradient: 'from-violet-50 to-purple-100', desc: 'Auto-share your closet' },
    { id: 'offers', name: 'Offer Engine', icon: History, color: 'text-amber-600', gradient: 'from-amber-50 to-yellow-100', desc: 'Auto-offer to likers' },
    { id: 'bundle', name: 'Bundle Calculator', icon: Calculator, color: 'text-amber-600', gradient: 'from-amber-50 to-yellow-100', desc: 'Calculate bundle margins' },
    { id: 'cross', name: 'Cross-Listing', icon: ExternalLink, color: 'text-rose-600', gradient: 'from-rose-50 to-pink-100', desc: 'Export to 6 platforms' },
    { id: 'blog', name: 'Success Blog', icon: BookOpen, color: 'text-brand-600', gradient: 'from-brand-50 to-indigo-100', desc: 'Reseller success stories' },
    { id: 'referral', name: 'Refer & Earn', icon: Gift, color: 'text-emerald-600', gradient: 'from-emerald-50 to-teal-100', desc: 'Share & get rewarded' },
    { id: 'cms', name: 'Blog Manager', icon: FileText, color: 'text-rose-600', gradient: 'from-rose-50 to-pink-100', desc: 'Content admin', adminOnly: true },
  ]

  const handlePostClick = (slug) => { setActiveBlogPost(slug); setActiveTab('blog-post'); window.history.pushState({}, '', `/blog/${slug}`) }

  const renderContent = () => {
    switch (activeTab) {
      case 'listing': return <ListingGenerator onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} />
      case 'inventory': return <InventoryManager onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} setActiveTab={setActiveTab} />
      case 'analytics': return <AnalyticsDashboard onBack={() => setActiveTab('dashboard')} userFetch={userFetch} />
      case 'pricing': return <PricingAssistant onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} />
      case 'bundle': return <BundleCalculator onBack={() => setActiveTab('dashboard')} userFetch={userFetch} />
      case 'sharing': return <SharingScheduler onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} />
      case 'offers': return <OfferManager onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} />
      case 'cross': return <CrossListing onBack={() => setActiveTab('dashboard')} isPro={isPro} userFetch={userFetch} />
      case 'blog': return <Blog onBack={() => setActiveTab('dashboard')} onPostClick={handlePostClick} userFetch={userFetch} />
      case 'blog-post': return <BlogPost slug={activeBlogPost} onBack={() => setActiveTab('blog')} userFetch={userFetch} />
      case 'referral': return <ReferralSection onBack={() => setActiveTab('dashboard')} userFetch={userFetch} />
      case 'referral-landing': return <ReferralLanding onBack={() => setActiveTab('dashboard')} userFetch={userFetch} />
      case 'media-kit': return <MediaKit onBack={() => setActiveTab('dashboard')} />
      case 'ref-landing': return <InfluencerLandingPage code={referralCode} onBack={() => setActiveTab('dashboard')} onStoryClick={(slug) => { setActiveBlogPost(slug); setActiveTab('blog-post'); window.history.pushState({}, '', `/blog/${slug}`) }} userFetch={userFetch} />
      case 'cms': return <BlogCMS onBack={() => setActiveTab('dashboard')} userFetch={userFetch} />
      case 'subscription': return <SubscriptionPage onBack={() => setActiveTab('dashboard')} isPro={isPro} userId={userId} subscriptionStatus={subscriptionStatus} setSubscriptionStatus={setSubscriptionStatus} />
      default: return <Dashboard tools={tools.filter(t => !t.adminOnly || userId === 'agent-lead')} setActiveTab={setActiveTab} isPro={isPro} />
    }
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'listing', icon: Camera, label: 'List' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'sharing', icon: Share2, label: 'Share' },
    { id: 'subscription', icon: Zap, label: 'Pro', badge: !isPro },
  ]

  return (
    <div className="min-h-screen pb-24 relative bg-slate-950">
      {/* ─── Ambient Background ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-slate-950" />
        {/* Stronger ambient blobs for depth */}
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] bg-brand-500/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/[0.03] rounded-full blur-3xl" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 glass-panel">
        <div className="flex justify-between items-center max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            {/* Fox Logo */}
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-500/30">
              <FoxLogo size={44} variant="image" className="md:w-[52px] md:h-[52px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight italic bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent pr-1.5">Posh Pal</h1>
                {isPro && <span className="badge-pro text-[9px]">Pro</span>}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">AI Reselling</p>
            </div>
          </div>
          <div className="hidden md:flex"><SwitchUser currentUserId={userId} onSwitch={setUserId} userFetch={userFetch} /></div>
          <button onClick={() => setActiveTab('subscription')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
              isPro ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20'
            }`}>
            {isPro ? <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Zap className="w-4 h-4 fill-current" />}
            {isPro ? 'Pro' : 'Upgrade'}
            {!isPro && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full animate-pulse" />}
          </button>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-6 pb-6">
        {renderContent()}
      </main>

      {/* ─── Bottom Nav ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 glass-panel safe-area-bottom">
        <div className="flex justify-between items-center max-w-lg mx-auto px-2 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-brand-600 bg-brand-50/80' : 'text-slate-400 hover:text-slate-600'
                }`}>
                <item.icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>{item.label}</span>
                {item.badge && !isActive && <div className="absolute -top-0.5 right-2 w-2 h-2 bg-amber-400 border-2 border-white rounded-full" />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App

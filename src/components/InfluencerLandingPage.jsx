import React, { useState, useEffect, useCallback } from 'react'
import InfluencerROI from './InfluencerROI'
import { useABTest } from '../services/abService'
import { SocialProofGrid } from '../assets/marketing'
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Star,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Users,
  TrendingUp,
  Clock,
  ExternalLink,
  Gift,
  Shield,
  ShoppingBag,
  Quote,
  Rocket,
  Loader2,
  X,
  Bell,
  ChevronDown,
  ArrowRightLeft,
  Timer,
  Share2,
  DollarSign,
  Flame,
  BadgeCheck,
  Trophy,
  BarChart3,
  Heart,
  Globe
} from 'lucide-react'

/**
 * InfluencerLandingPage — Dedicated /ref/:code Referral Landing
 * 
 * Phase 7+: Maximum-conversion landing page for influencer referral campaigns.
 * 
 * CRO Strategy (Social Proof · Urgency · Objection Handling):
 *  - Hero urgency badge + time-saved counter
 *  - "Why Resellers Choose Posh Pal" value-prop section  
 *  - Risk-Free Guarantee panel
 *  - Urgency banner between sections
 *  - Enhanced Final CTA with scarcity language
 *  - Before/After visual comparison
 *  - Live Activity social proof toasts
 *  - FAQ with objection-focused questions
 *  - Sticky mobile CTA with pulse animation
 * 
 * Route: /ref/:code
 * 
 * Usage:
 *   <InfluencerLandingPage code="SARAH20" onBack={handleBack} userFetch={userFetch} />
 */

const PRO_FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Listing Generator',
    desc: 'Turn photos into optimized titles, descriptions & tags in seconds',
    color: 'text-brand-600',
    bg: 'bg-brand-50'
  },
  {
    icon: TrendingUp,
    title: 'Smart Pricing Comps',
    desc: 'Real-time market analysis with optimal price recommendations',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    icon: Clock,
    title: '24/7 Auto-Sharing Bot',
    desc: 'Keep your closet active around the clock without lifting a finger',
    color: 'text-violet-600',
    bg: 'bg-violet-50'
  },
  {
    icon: ExternalLink,
    title: 'Cross-List Anywhere',
    desc: 'Export listings to eBay, Mercari, Depop, Vinted & Grailed',
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
  {
    icon: Gift,
    title: 'Automated Offer Engine',
    desc: 'Send bulk offers to likers automatically — even while you sleep',
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    icon: ShoppingBag,
    title: 'Smart Bundle Assistant',
    desc: 'Calculate profitable bundle offers and suggest item pairings',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  }
]

const HOW_IT_WORKS = [
  { num: '01', title: 'Create Account', desc: 'Sign up free in under 60 seconds — no credit card needed' },
  { num: '02', title: 'Import Your Closet', desc: 'Connect your Poshmark closet or upload items manually' },
  { num: '03', title: 'Let AI Do the Work', desc: 'Auto-generate listings, share 24/7, and watch sales grow' }
]

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    handle: '@sarahscloset',
    text: 'Posh Pal doubled my listing output. I went from 5 items/week to 15! The AI listing generator is a total game changer.',
    items: '342',
    revenue: '+$4,200',
    verified: true
  },
  {
    name: 'James K.',
    handle: '@jamesvintage',
    text: 'The auto-sharing bot alone is worth the subscription. My engagement is up 3x and I\'m actually making sales while I sleep.',
    items: '189',
    revenue: '+$2,800',
    verified: true
  },
  {
    name: 'Lisa R.',
    handle: '@lilysthrifts',
    text: 'Cross-listing used to take me hours. Now I export to 4 platforms in one click. Best $15 I spend every month.',
    items: '521',
    revenue: '+$6,100',
    verified: true
  }
]

const BEFORE_AFTER = [
  {
    icon: Timer,
    metric: 'Listing Speed',
    before: '15–20 min/item',
    after: '2–3 min/item',
    improvement: '6x faster',
    beforeIcon: Clock,
    afterIcon: Zap
  },
  {
    icon: Share2,
    metric: 'Daily Sharing',
    before: 'Manual, 2–3x/day',
    after: 'Auto, 24/7',
    improvement: 'Unlimited',
    beforeIcon: Clock,
    afterIcon: Sparkles
  },
  {
    icon: ExternalLink,
    metric: 'Platform Reach',
    before: 'Poshmark only',
    after: '6 platforms',
    improvement: '6x wider',
    beforeIcon: ShoppingBag,
    afterIcon: ExternalLink
  },
  {
    icon: DollarSign,
    metric: 'Monthly Revenue',
    before: '$800 avg',
    after: '$2,400+ avg',
    improvement: '3x growth',
    beforeIcon: TrendingUp,
    afterIcon: Rocket
  }
]

const SUCCESS_STORIES = [
  {
    slug: 'sarah-success-story',
    name: 'Sarah M.',
    growth: '+$2,000/mo',
    niche: 'Vintage & Designer',
    imageInitial: 'S'
  },
  {
    slug: 'mike-success-story',
    name: 'Mike T.',
    growth: '+$3,500/mo',
    niche: 'Streetwear & Sneakers',
    imageInitial: 'M'
  },
  {
    slug: 'mogibeth-success-story',
    name: 'Mogibeth',
    growth: '+$1,500/mo',
    niche: 'Vintage Clothing',
    imageInitial: 'M'
  }
]

const WHY_POSH_PAL = [
  {
    icon: BarChart3,
    title: 'Sell More, Work Less',
    desc: 'Our users average 3x more listings per week while spending 10+ fewer hours on manual tasks.',
    stat: '3x',
    statLabel: 'more output',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    icon: Shield,
    title: '100% Risk-Free Trial',
    desc: 'No credit card required. Try every Pro feature free for 14 days. Cancel anytime — you won\'t be charged a cent.',
    stat: '$0',
    statLabel: 'to start',
    color: 'text-brand-600',
    bg: 'bg-brand-50'
  },
  {
    icon: Globe,
    title: 'Sell on 6 Platforms',
    desc: 'One-click cross-listing to Poshmark, eBay, Mercari, Depop, Vinted, and Grailed. 6x the exposure, zero extra effort.',
    stat: '6',
    statLabel: 'marketplaces',
    color: 'text-violet-600',
    bg: 'bg-violet-50'
  }
]

const FAQ_ITEMS = [
  {
    q: 'Is Posh Pal safe to use with my Poshmark account?',
    a: 'Yes! Posh Pal uses Poshmark\'s public API and follows all platform guidelines. We never store your Poshmark password — you connect securely and can disconnect anytime. Thousands of resellers use Posh Pal daily without issues.'
  },
  {
    q: 'Does Posh Pal work with my existing listings?',
    a: 'Absolutely. When you connect your closet, Posh Pal automatically imports all your active listings. You can start optimizing, sharing, and managing them immediately — no need to recreate anything.'
  },
  {
    q: 'What\'s the catch with the free trial?',
    a: 'No catch. Your 14-day Pro trial gives you full access to every feature — AI listing generator, auto-sharing bot, cross-listing, offer engine, and more. No credit card required. Cancel anytime before the trial ends with zero charges.'
  },
  {
    q: 'How is this only $15/month? Is it really worth it?',
    a: 'Most resellers save 10–15 hours per week with Posh Pal. At just $15/month, that\'s less than $0.25/hour of time saved. Plus, features like auto-sharing and cross-listing typically increase sales by 2-3x, making the ROI immediate. We keep it affordable because we believe every reseller deserves access to professional tools.'
  },
  {
    q: 'Can I cross-list to other platforms besides Poshmark?',
    a: 'Yes! Posh Pal supports one-click cross-listing exports to eBay, Mercari, Depop, Vinted, and Grailed. Each listing is automatically reformatted for each platform\'s requirements so you can list everywhere instantly.'
  },
  {
    q: 'What if I don\'t like it? Can I cancel?',
    a: 'You can cancel anytime with a single click — no phone calls, no emails, no hassle. Your trial is completely free with no credit card required, so there\'s literally zero risk. If you decide to subscribe and later want to cancel, you won\'t be charged again.'
  },
  {
    q: 'Do I need to be tech-savvy to use Posh Pal?',
    a: 'Not at all! Posh Pal was designed for resellers, not developers. The interface is clean, intuitive, and mobile-friendly. Most users are up and running in under 5 minutes, and we provide step-by-step guides for every feature.'
  }
]

// ─── Live Activity Data ───────────────────────────────────────────────
const LIVE_ACTIVITIES = [
  { name: 'Alex', location: 'New York', action: 'just joined Posh Pal!' },
  { name: 'Maria', location: 'Los Angeles', action: 'upgraded to Pro!' },
  { name: 'Jordan', location: 'Chicago', action: 'created 5 new listings with AI' },
  { name: 'Taylor', location: 'Miami', action: 'just crossed $5K in sales!' },
  { name: 'Casey', location: 'Austin', action: 'exported 20 listings to 3 platforms' },
  { name: 'Riley', location: 'Denver', action: 'saved 12 hours this week' },
  { name: 'Morgan', location: 'Seattle', action: 'auto-shared 500 items today' },
  { name: 'Sam', location: 'Portland', action: 'just joined Posh Pal!' },
  { name: 'Jamie', location: 'Nashville', action: 'sent 30 offers to likers' },
  { name: 'Drew', location: 'Atlanta', action: 'listed 10 items in under 30 min' }
]

const InfluencerLandingPage = ({ code, onBack, onStoryClick, userFetch }) => {
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [signingUp, setSigningUp] = useState(false)
  
  // A/B Test for Hero CTA
  const { variant, convert } = useABTest('hero_cta_text', userFetch)
  
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null)
  
  // Live activity toast state
  const [liveActivity, setLiveActivity] = useState(null)
  const [activityVisible, setActivityVisible] = useState(false)

  // Load influencer info from API based on code
  useEffect(() => {
    const loadInfluencer = async () => {
      try {
        if (userFetch) {
          const res = await userFetch(`/api/referral/code/${code}`)
          if (res.ok) {
            const data = await res.json()
            setInfluencer({
              name: data.name || 'a Top Reseller',
              handle: data.handle || `influencer_${code.toLowerCase()}`,
              avatarInitial: (data.name || code)[0].toUpperCase(),
              bio: data.bio || 'I\'ve been using Posh Pal to scale my reselling business and now you can too!',
              referralCount: data.referral_count || 0
            })
          } else {
            // Fallback: derive from the code
            const name = code.charAt(0).toUpperCase() + code.slice(1).replace(/[0-9]/g, '')
            setInfluencer({
              name: name + ' the Reseller',
              handle: `@${code.toLowerCase()}`,
              avatarInitial: code[0].toUpperCase(),
              bio: 'I use Posh Pal to supercharge my reselling business — try it free with my code!',
              referralCount: 0
            })
          }
        } else {
          // Minimal fallback
          setInfluencer({
            name: 'a Top Reseller',
            handle: `@${code.toLowerCase()}`,
            avatarInitial: code[0].toUpperCase(),
            bio: 'I use Posh Pal to supercharge my reselling business — try it free with my code!',
            referralCount: 0
          })
        }
      } catch (err) {
        console.error('Failed to load influencer:', err)
        setInfluencer({
          name: 'a Top Reseller',
          handle: `@${code.toLowerCase()}`,
          avatarInitial: code[0].toUpperCase(),
          bio: 'I use Posh Pal to supercharge my reselling business — try it free with my code!',
          referralCount: 0
        })
      }
      setLoading(false)
    }
    loadInfluencer()
  }, [code, userFetch])

  // ─── Live Activity Toast Logic ──────────────────────────────────────
  const showActivity = useCallback(() => {
    const activity = LIVE_ACTIVITIES[Math.floor(Math.random() * LIVE_ACTIVITIES.length)]
    setLiveActivity(activity)
    setActivityVisible(true)
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setActivityVisible(false)
    }, 4000)
  }, [])

  useEffect(() => {
    // Show first activity after 5 seconds
    const initialTimer = setTimeout(() => {
      showActivity()
    }, 5000)
    
    // Then show random activities every 15-30 seconds
    const interval = setInterval(() => {
      const delay = 15000 + Math.random() * 15000 // 15-30 seconds
      setTimeout(() => {
        showActivity()
      }, delay)
    }, 30000)
    
    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [showActivity])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignUp = () => {
    setSigningUp(true)
    // Log conversion for A/B test
    convert();
    
    // In production: redirect to signup with prefilled code
    // window.location.href = `/signup?ref=${code}`
    setTimeout(() => {
      setSigningUp(false)
    }, 1200)
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const getCtaText = () => {
    if (variant === 'B') return 'Claim Your Discount'
    return 'Start Free Trial'
  }

  if (loading) {
    return (
      <div className="fade-in-up">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Posh Pal
        </button>
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-400">Loading referral...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in-up pb-20 md:pb-0">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Posh Pal
      </button>

      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-12 text-center relative">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* ─── Urgency Badge ─────────────────────────────────── */}
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">
                Limited Time — Free Pro Trial
              </span>
            </div>

            {/* Sparkle icon */}
            <div className="bg-brand-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-2 ring-brand-400/30">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>

            {/* Invitation */}
            <p className="text-brand-300 text-sm font-bold uppercase tracking-widest mb-2">
              You've Been Invited
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
              Try Posh Pal Pro <span className="text-brand-400 italic">Free</span> for 14 Days
            </h1>
            <p className="text-slate-400 text-base max-w-lg mx-auto mb-3 leading-relaxed">
              "{influencer.bio}"
            </p>

            {/* ─── Time Saved Counter ────────────────────────────── */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Save 10+ hrs/week</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold text-white">Join 10K+ resellers</span>
              </div>
            </div>

            {/* Influencer credit */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-lg ring-2 ring-white/20">
                {influencer.avatarInitial}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">{influencer.name}</p>
                <p className="text-slate-500 text-xs font-medium">{influencer.handle}</p>
              </div>
            </div>

            {/* Code + CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              {/* Code pill */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-slate-400">Code:</span>
                <span className="text-lg font-black text-white tracking-widest">{code}</span>
                <button
                  onClick={copyCode}
                  className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>

              {/* CTA */}
              <button
                onClick={handleSignUp}
                disabled={signingUp}
                className="bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70 animate-pulse-glow"
              >
                {signingUp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    {getCtaText()}
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                4.9★ from 2,000+ reviews
              </span>
            </div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <div className="p-4 md:p-5 text-center">
            <p className="text-2xl md:text-3xl font-black text-brand-600">10K+</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Resellers</p>
          </div>
          <div className="p-4 md:p-5 text-center">
            <p className="text-2xl md:text-3xl font-black text-emerald-600">50K+</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listings Created</p>
          </div>
          <div className="p-4 md:p-5 text-center">
            <p className="text-2xl md:text-3xl font-black text-amber-600">$2M+</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seller Revenue</p>
          </div>
        </div>
      </div>

      {/* ─── Pro Features ──────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 text-center">
          Unlock <span className="text-brand-600">Pro Features</span> Free
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6 font-medium">
          Everything you need to scale your reselling business — included in your trial
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRO_FEATURES.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-100 hover:shadow-sm transition-all">
                <div className={`${feat.bg} ${feat.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{feat.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Urgency Banner ────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-200/60 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-800">
                Your free trial is waiting — no credit card needed
              </p>
              <p className="text-[10px] font-medium text-amber-600">
                Join 10,000+ resellers already growing with Posh Pal
              </p>
            </div>
          </div>
          <button
            onClick={handleSignUp}
            disabled={signingUp}
            className="shrink-0 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-70"
          >
            {signingUp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                {getCtaText()}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Why Resellers Choose Posh Pal ─────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg md:text-xl font-black text-slate-900">
            Why Resellers Choose Posh Pal
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">
          The numbers don't lie — here's what you get
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WHY_POSH_PAL.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 hover:shadow-sm transition-all text-center group">
                <div className={`${item.bg} ${item.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`text-3xl font-black ${item.color} mb-1`}>{item.stat}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{item.statLabel}</p>
                <p className="text-sm font-bold text-slate-800 mb-1.5">{item.title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Risk-Free Guarantee ───────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5 bg-gradient-to-br from-emerald-50/50 to-white">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2">
              Zero Risk. <span className="text-emerald-600">100% Free to Try.</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              We're so confident you'll love Posh Pal that we don't even ask for a credit card. 
              Get full access to every Pro feature for 14 days. If it's not for you, simply cancel — 
              no charges, no hassle, no hard feelings.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cancel in one click
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full feature access
              </span>
            </div>
          </div>
          <button
            onClick={handleSignUp}
            disabled={signingUp}
            className="shrink-0 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70"
          >
            {signingUp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Start My Free Trial
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── How It Works ──────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-6 text-center">
          Getting Started Is Easy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-brand-500/20">
                  {step.num}
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute -right-6 top-1/2 -translate-y-1/2 text-slate-200">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">{step.title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Before vs After — Enhanced Social Proof ───────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg md:text-xl font-black text-slate-900">
            Before <span className="text-slate-300 font-medium">&</span> After Posh Pal
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">
          See the difference our Pro tools make for real resellers
        </p>

        {/* Desktop: side-by-side cards */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BEFORE_AFTER.map((item, i) => {
            const Icon = item.icon
            const BeforeIcon = item.beforeIcon
            const AfterIcon = item.afterIcon
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center group hover:border-brand-100 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{item.metric}</p>
                
                {/* Before */}
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BeforeIcon className="w-3 h-3 text-slate-300" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Before</p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-through decoration-slate-300">{item.before}</p>
                </div>
                
                {/* Arrow */}
                <ChevronDown className="w-4 h-4 text-brand-300 mx-auto my-1" />
                
                {/* After */}
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <AfterIcon className="w-3 h-3 text-emerald-400" />
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">After</p>
                  </div>
                  <p className="text-xs text-slate-800 font-bold">{item.after}</p>
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                    {item.improvement}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile: stacked list with horizontal before/after */}
        <div className="sm:hidden space-y-3">
          {BEFORE_AFTER.map((item, i) => {
            const Icon = item.icon
            const BeforeIcon = item.beforeIcon
            const AfterIcon = item.afterIcon
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-brand-500" />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">{item.metric}</p>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                    {item.improvement}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BeforeIcon className="w-3 h-3 text-slate-300" />
                      <p className="text-[9px] font-black text-slate-400 uppercase">Before</p>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{item.before}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AfterIcon className="w-3 h-3 text-emerald-400" />
                      <p className="text-[9px] font-black text-emerald-500 uppercase">After</p>
                    </div>
                    <p className="text-xs text-slate-800 font-bold">{item.after}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Testimonials (Marketing Asset) ────────────────────────── */}
      <div className="mb-5">
        <SocialProofGrid className="card p-6 md:p-8" />
      </div>

      {/* ─── Success Stories ────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-black text-slate-900">Real Reseller Results</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUCCESS_STORIES.map((story, i) => (
            <button 
              key={i} 
              onClick={() => onStoryClick && onStoryClick(story.slug)}
              className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-sm">
                  {story.imageInitial}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{story.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{story.niche}</p>
                </div>
              </div>
              <p className="text-xl font-black text-emerald-600 mb-1">{story.growth}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-600 transition-colors">
                Read Full Story <ChevronRight className="w-3 h-3" />
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Influencer ROI ─────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-black text-slate-900">Partner with Posh Pal</h2>
        </div>
        <InfluencerROI />
      </div>

      {/* ─── FAQ Section ────────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg md:text-xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-5 font-medium">
          Everything you need to know before getting started
        </p>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div 
                key={i} 
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen 
                    ? 'border-brand-200 bg-brand-50/30 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 hover:border-brand-100'
                }`}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <span className={`text-sm font-bold pr-4 transition-colors ${
                    isOpen ? 'text-brand-700' : 'text-slate-800'
                  }`}>
                    {item.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-500' : 'text-slate-400'
                  }`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Final CTA ─────────────────────────────────────────────── */}
      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 md:p-10 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            {/* Urgency ribbon */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
              <Flame className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">
                Don't miss out — free trial available now
              </span>
            </div>
            <Rocket className="w-10 h-10 text-white mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Ready to Supercharge Your Reselling?
            </h2>
            <p className="text-brand-200 text-sm mb-3 max-w-md mx-auto">
              Join {influencer.name} and 10,000+ resellers growing with Posh Pal — 
              start your free trial today, cancel anytime.
            </p>
            {/* Key benefit bullets */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-6 text-xs text-brand-200">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Save 10+ hrs/week
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sell on 6 platforms
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 3x more sales avg.
              </span>
            </div>
            <button
              onClick={handleSignUp}
              disabled={signingUp}
              className="bg-white text-brand-600 px-10 py-4 rounded-xl font-black text-base hover:bg-brand-50 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
            >
              {signingUp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Claim Your Free Trial
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-brand-200">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live Activity Toast ────────────────────────────────────── */}
      <div 
        className={`fixed bottom-20 md:bottom-6 right-4 z-50 transition-all duration-500 ease-out ${
          activityVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {liveActivity && (
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700 max-w-xs">
            {/* Pulse dot */}
            <div className="relative shrink-0">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white leading-tight">
                <span className="font-bold">{liveActivity.name}</span>
                <span className="text-slate-400 font-medium"> from {liveActivity.location} </span>
                <span className="text-slate-300">{liveActivity.action}</span>
              </p>
            </div>
            <button 
              onClick={() => setActivityVisible(false)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Sticky Mobile CTA ──────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 p-3 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3">
          {/* Info with pulse dot */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="relative shrink-0">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
              </div>
              <p className="text-xs font-black text-slate-900 truncate">
                Free Trial Active — Claim Now
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate ml-3.5">
              Code: <span className="font-bold text-brand-600">{code}</span> · No credit card
            </p>
          </div>
          {/* CTA Button */}
          <button
            onClick={handleSignUp}
            disabled={signingUp}
            className="shrink-0 bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-600 active:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-70 animate-pulse-glow"
          >
            {signingUp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                {getCtaText()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfluencerLandingPage

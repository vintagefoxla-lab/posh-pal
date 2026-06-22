import React, { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'

/**
 * InfluencerLandingPage — Dedicated /ref/:code Referral Landing
 * 
 * Phase 6: A high-conversion landing page for influencer referral campaigns.
 * Dynamically loads influencer info based on the referral code from the URL.
 * 
 * Route: /ref/:code
 * 
 * Usage:
 *   <InfluencerLandingPage code="SARAH20" onBack={handleBack} userFetch={userFetch} />
 * 
 * Props:
 *   code: string — the referral code from URL params
 *   onBack: () => void — navigate back
 *   userFetch: function — authenticated fetch
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
    revenue: '+$4,200'
  },
  {
    name: 'James K.',
    handle: '@jamesvintage',
    text: 'The auto-sharing bot alone is worth the subscription. My engagement is up 3x and I\'m actually making sales while I sleep.',
    items: '189',
    revenue: '+$2,800'
  },
  {
    name: 'Lisa R.',
    handle: '@lilysthrifts',
    text: 'Cross-listing used to take me hours. Now I export to 4 platforms in one click. Best $15 I spend every month.',
    items: '521',
    revenue: '+$6,100'
  }
]

const InfluencerLandingPage = ({ code, onBack, userFetch }) => {
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [signingUp, setSigningUp] = useState(false)

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

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignUp = () => {
    setSigningUp(true)
    // In production: redirect to signup with prefilled code
    // window.location.href = `/signup?ref=${code}`
    setTimeout(() => {
      setSigningUp(false)
    }, 1200)
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
    <div className="fade-in-up">
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
            {/* Sparkle icon */}
            <div className="bg-brand-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-2 ring-brand-400/30">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>

            {/* Invitation */}
            <p className="text-brand-300 text-sm font-bold uppercase tracking-widest mb-2">
              You've Been Invited
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
              Try Posh Pal Pro <span className="text-brand-400 italic">Free</span>
            </h1>
            <p className="text-slate-400 text-base max-w-lg mx-auto mb-6 leading-relaxed">
              "{influencer.bio}"
            </p>

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
                className="bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {signingUp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Start Free Trial
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {influencer.referralCount > 0
                  ? `${influencer.referralCount} friends already joined`
                  : '14 days free'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cancel anytime
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
            <p className="text-2xl md:text-3xl font-black text-amber-600">4.9★</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Rating</p>
          </div>
        </div>
      </div>

      {/* ─── Pro Features ──────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 text-center">
          Unlock <span className="text-brand-600">Pro Features</span> Free
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6 font-medium">
          Everything you need to scale your reselling business
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

      {/* ─── Testimonials ──────────────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Quote className="w-4 h-4 text-brand-500" />
          <h2 className="text-lg font-black text-slate-900">What Resellers Are Saying</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center font-black text-brand-600 text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t.handle}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">"{t.text}"</p>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="text-brand-600">{t.items} items</span>
                <span className="text-emerald-600">{t.revenue} revenue</span>
              </div>
            </div>
          ))}
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
            <Rocket className="w-10 h-10 text-white mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Ready to Supercharge Your Reselling?
            </h2>
            <p className="text-brand-200 text-sm mb-6 max-w-md mx-auto">
              Join {influencer.name} and thousands of resellers using Posh Pal to automate, optimize, and grow.
            </p>
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
                <CheckCircle2 className="w-3.5 h-3.5" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfluencerLandingPage

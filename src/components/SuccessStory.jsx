import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  User,
  Star,
  Zap,
  Sparkles,
  Share2,
  ExternalLink,
  ShoppingBag,
  Calculator,
  Tag,
  Gift,
  BarChart3,
  Quote,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Rocket,
  Shield,
  BookOpen
} from 'lucide-react'

import { FeaturedSuccessStoryHeader } from '../assets/marketing'

/**
 * SuccessStoryTemplate
 * 
 * A rich, visually structured blog post template for reseller success stories.
 * Designed to be rendered when the blog post has tags containing "success story".
 * 
 * Route: /blog/:slug (success story posts)
 * 
 * Data shape (extends existing blog_posts table):
 *   meta: {
 *     resellerName,        // "Posh Pal Reseller"
 *     resellerHandle,      // ""
 *     earningsGrowth,      // "+$2,000/mo"
 *     niche,               // "Women's Vintage & Designer"
 *     avatarInitial,       // "S"
 *     beforeStats: {        // Manual stats
 *       listingsPerWeek, hoursSpent, monthlyRevenue, shareEngagement
 *     },
 *     afterStats: {         // Posh Pal stats
 *       listingsPerWeek, hoursSpent, monthlyRevenue, shareEngagement
 *     },
 *     testimonialQuote,     // "Posh Pal completely changed how I run my business..."
 *     appStack: [           // Features they use most
 *       { name, icon, description, benefit }
 *     ]
 *   }
 * 
 * Falls back to the existing generic BlogPost display if meta is missing.
 */

// ─── App Stack Feature Map ────────────────────────────────────────────

const FEATURE_MAP = {
  'listing-generator': { icon: Sparkles, label: 'AI Listing Generator', color: 'text-brand-600', bg: 'bg-brand-50' },
  'pricing': { icon: Tag, label: 'Pricing Assistant', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'sharing': { icon: Share2, label: 'Auto-Sharing Bot', color: 'text-violet-600', bg: 'bg-violet-50' },
  'offers': { icon: Gift, label: 'Offer Engine', color: 'text-amber-600', bg: 'bg-amber-50' },
  'cross-listing': { icon: ExternalLink, label: 'Cross-Listing', color: 'text-rose-600', bg: 'bg-rose-50' },
  'bundle': { icon: Calculator, label: 'Bundle Assistant', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'inventory': { icon: ShoppingBag, label: 'Inventory Manager', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'market-insights': { icon: BarChart3, label: 'Market Insights', color: 'text-sky-600', bg: 'bg-sky-50' },
}

// ─── Stat Comparison Row ─────────────────────────────────────────────

const StatComparisonRow = ({ label, before, after, format = 'number' }) => {
  const pctIncrease = before > 0 ? Math.round(((after - before) / before) * 100) : 0

  const fmt = (val) => {
    if (format === 'currency') return `$${val.toLocaleString()}`
    if (format === 'hours') return `${val}h`
    if (format === 'percent') return `${val}%`
    return val.toLocaleString()
  }

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors">
      {/* Label */}
      <div className="w-32 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>

      {/* Before */}
      <div className="flex-1 text-center">
        <span className="text-xs font-bold text-slate-400 line-through">{fmt(before)}</span>
      </div>

      {/* Arrow */}
      <div className="shrink-0">
        <ChevronRight className="w-4 h-4 text-brand-400" />
      </div>

      {/* After */}
      <div className="flex-1 text-center">
        <span className="text-sm font-black text-emerald-600">{fmt(after)}</span>
      </div>

      {/* Improvement */}
      <div className="w-16 shrink-0 text-right">
        {pctIncrease > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            <TrendingUp className="w-2.5 h-2.5" />
            +{pctIncrease}%
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

const SuccessStoryTemplate = ({ post, onBack }) => {
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  // Parse success story metadata from post content
  // In production, this would come from a dedicated API or structured field
  // For design purposes, we derive mock data keyed to the post slug
  useEffect(() => {
    if (!post) return

    // Simulate loading metadata
    const timer = setTimeout(() => {
      // Example success story data — in production, fetch from API
      const mockMeta = {}
      setMeta(mockMeta[post.slug] || null)
            setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [post])

  if (loading) {
    return (
      <div className="fade-in-up">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </button>
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-400">Loading success story...</p>
        </div>
      </div>
    )
  }

  // If no structured metadata exists, fall back to generic blog display
  if (!meta) {
    return (
      <div className="fade-in-up">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </button>
        <div className="card p-6 md:p-8">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.split(',').map((tag, i) => (
                <span key={i} className="badge bg-brand-50 text-brand-600 text-[10px]">{tag.trim()}</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.read_time}</span>
              <span>{post.date}</span>
            </div>
          </div>
          <div className="text-slate-600 leading-relaxed space-y-4">
            {post.content.split('\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in-up space-y-6">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
      </button>

      {/* ═══ Hero Section (Marketing Asset) ════════════════════════ */}
      <div className="card overflow-hidden shadow-2xl shadow-brand-500/10 ring-1 ring-slate-800">
        <FeaturedSuccessStoryHeader 
          name={meta.resellerName}
          handle={meta.resellerHandle}
          growth={meta.earningsGrowth}
          growthPercent={meta.beforeStats.monthlyRevenue > 0
            ? '+' + Math.round(((meta.afterStats.monthlyRevenue - meta.beforeStats.monthlyRevenue) / meta.beforeStats.monthlyRevenue) * 100) + '%'
            : '0%'}
          niche={meta.niche}
          avatarInitial={meta.avatarInitial}
          beforeRevenue={`$${meta.beforeStats.monthlyRevenue}/mo`}
          afterRevenue={`$${meta.afterStats.monthlyRevenue}/mo`}
        />
      </div>

      {/* ═══ Before & After Stats ════════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <span className="input-label mb-0">Before & After: Posh Pal Impact</span>
          </div>
        </div>

        {/* Header row */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-4">
            <div className="w-32 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Before (Manual)</span>
            </div>
            <div className="w-4 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">After (Posh Pal)</span>
            </div>
            <div className="w-16 shrink-0" />
          </div>
        </div>

        <div className="p-4 pt-2 space-y-0 divide-y divide-slate-50">
          <StatComparisonRow
            label="Listings/Week"
            before={meta.beforeStats.listingsPerWeek}
            after={meta.afterStats.listingsPerWeek}
          />
          <StatComparisonRow
            label="Hours Spent"
            before={meta.beforeStats.hoursSpent}
            after={meta.afterStats.hoursSpent}
            format="hours"
          />
          <StatComparisonRow
            label="Monthly Revenue"
            before={meta.beforeStats.monthlyRevenue}
            after={meta.afterStats.monthlyRevenue}
            format="currency"
          />
          <StatComparisonRow
            label="Share Engagement"
            before={meta.beforeStats.shareEngagement}
            after={meta.afterStats.shareEngagement}
          />
        </div>

        {/* Mini summary card */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/60">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">The Bottom Line</span>
            </div>
            <p className="text-sm font-bold text-emerald-900">
              {meta.resellerName} went from {meta.beforeStats.listingsPerWeek} listings/week at ${meta.beforeStats.monthlyRevenue}/mo
              to <span className="text-emerald-600">{meta.afterStats.listingsPerWeek} listings/week</span> at
              <span className="text-emerald-600"> ${meta.afterStats.monthlyRevenue.toLocaleString()}/mo</span> —
              a <span className="text-emerald-600">{Math.round((meta.afterStats.monthlyRevenue / meta.beforeStats.monthlyRevenue) * 100 - 100)}% increase</span> in monthly revenue.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Testimonial Pull-Quote ═══════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="p-8 md:p-10 text-center relative">
          <div className="absolute top-6 left-8 text-brand-100">
            <Quote className="w-12 h-12" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium italic mb-6">
              "{meta.testimonialQuote}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-sm">
                {meta.avatarInitial}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">{meta.resellerName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{meta.resellerHandle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ App Stack ═══════════════════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="input-label mb-0">{meta.resellerName}'s App Stack</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{meta.appStack.length} features</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meta.appStack.map((item, i) => {
              const featureDef = FEATURE_MAP[item.id]
              if (!featureDef) return null
              const Icon = featureDef.icon
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-100 hover:shadow-sm transition-all">
                  <div className={`${featureDef.bg} ${featureDef.color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-bold text-slate-800">{featureDef.label}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-1">{item.description}</p>
                    <p className="text-[10px] font-bold text-emerald-600">
                      <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                      {item.benefit}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ═══ Narrative Section ═══════════════════════════════════════ */}
      {post.content && (
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            The Full Story
          </h2>
          <div className="text-slate-600 leading-relaxed space-y-4 text-sm">
            {post.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Footer CTA ══════════════════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 md:p-10 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="bg-white/15 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-2 ring-white/20">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Ready to Write Your Own Success Story?
            </h2>
            <p className="text-brand-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              {meta.resellerName} uses Posh Pal to automate listings, optimize pricing, and scale their business.
            </p>
            <button className="bg-white text-brand-600 px-10 py-4 rounded-xl font-black text-base hover:bg-brand-50 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto">
              <Zap className="w-5 h-5 fill-current" />
              Start with Posh Pal Pro
            </button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-brand-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> $15/mo flat price
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Every feature included
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessStoryTemplate
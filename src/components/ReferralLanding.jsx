import React from 'react'
import { ArrowLeft, Zap, ShoppingBag, Sparkles, Star, Users, CheckCircle2, ChevronRight, TrendingUp, Clock, ExternalLink, Gift, Shield, Award } from 'lucide-react'
import { SocialProofGrid } from '../assets/marketing'

const ReferralLanding = ({ onBack }) => {
  const perks = [
    { icon: Zap, text: 'AI Listing Generator', desc: 'Turn photos into optimized listings in seconds' },
    { icon: TrendingUp, text: 'Smart Pricing', desc: 'Real-time market analysis for maximum profit' },
    { icon: Clock, text: '24/7 Auto-Sharing', desc: 'Keep your closet active around the clock' },
    { icon: Gift, text: 'Free Pro Trial', desc: 'Your friends get 14 days free, you get rewards' },
  ]

  const steps = [
    { num: '01', title: 'Share Your Code', desc: 'Send your unique referral link to friends' },
    { num: '02', title: 'They Sign Up', desc: 'They get 14 days of Pro features free' },
    { num: '03', title: 'Earn Rewards', desc: '1 month free at 3 referrals, lifetime at 10' },
  ]

  const testimonials = [
    { name: 'Sarah M.', handle: '@sarahscloset', text: 'Posh Pal doubled my listing output. I went from 5 items/week to 15!', items: '342', revenue: '+$4,200' },
    { name: 'James K.', handle: '@jamesvintage', text: 'The auto-sharing bot alone is worth it. My engagement is up 3x.', items: '189', revenue: '+$2,800' },
  ]

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Hero */}
      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-12 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="bg-brand-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ring-2 ring-brand-400/30">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              Your AI Reselling<br />Assistant
            </h1>
            <p className="text-slate-400 text-base max-w-md mx-auto mb-6">
              Automate listings, optimize pricing, and grow your reselling business — 
              all from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 fill-current" />
                Start Free Trial
              </button>
              <button className="bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                See How It Works
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-brand-600">10K+</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Resellers</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">50K+</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listings Created</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-amber-600">4.9★</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Rating</p>
        </div>
      </div>

      {/* Perks */}
      <div className="card p-6 mb-5">
        <h2 className="text-lg font-black text-slate-900 mb-4">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="bg-brand-50 text-brand-600 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <perk.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{perk.text}</p>
                <p className="text-[10px] text-slate-400">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-6 mb-5">
        <h2 className="text-lg font-black text-slate-900 mb-4 text-center">How Referrals Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="bg-brand-500 text-white w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">
                {step.num}
              </div>
              <p className="text-sm font-bold text-slate-800">{step.title}</p>
              <p className="text-[10px] text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials (Marketing Asset) */}
      <div className="mb-5">
        <SocialProofGrid className="card p-6 md:p-8" />
      </div>

      {/* SEO Blog Template Placeholder */}
      <div className="card overflow-hidden mb-5">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-500" />
            <span className="input-label mb-0">Reseller Success Blog Template</span>
            <span className="badge bg-amber-50 text-amber-600 text-[8px]">SEO Optimized</span>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Blog Post Template</p>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              How [Reseller Name] Scaled to [Number] Sales Using [PRODUCT_NAME]
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-4">
              <span>By Posh Pal Team</span>
              <span>•</span>
              <span>5 min read</span>
              <span>•</span>
              <span>Published [Date]</span>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-800">[RESELLER_NAME]</strong> started their Poshmark journey in [Year]. 
                Like many resellers, they struggled with <strong className="text-slate-800">[PAIN_POINT: e.g., manual sharing, pricing uncertainty]</strong>.
              </p>
              <p>
                That's when they discovered <strong className="text-brand-600">Posh Pal</strong> — an AI-powered productivity suite 
                that automates the tedious parts of reselling. Using the <strong className="text-slate-800">[FEATURE: e.g., Listing Generator]</strong>, 
                they were able to <strong className="text-slate-800">[BENEFIT: e.g., create 50 listings in one afternoon]</strong>.
              </p>
              <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                <p className="text-xs font-bold text-brand-800 mb-1">📊 Key Results</p>
                <ul className="text-xs text-brand-700 space-y-1">
                  <li>• <strong>[X]%</strong> increase in monthly sales</li>
                  <li>• <strong>[Y] hours</strong> saved per week on listing/sharing</li>
                  <li>• <strong>$[Z]</strong> additional monthly revenue</li>
                </ul>
              </div>
              <p>
                Ready to write your own success story? <strong className="text-brand-600">Try Posh Pal free for 14 days →</strong>
              </p>
            </div>
            {/* SEO Keywords */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">SEO Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {['Poshmark automation', 'AI listing generator', 'Poshmark sharing bot', 'reseller tools', 'Poshmark pricing tool', 'cross-listing app'].map((kw, i) => (
                  <span key={i} className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-500">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Templates */}
      <div className="card overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-brand-500" />
            <span className="input-label mb-0">Social Share Templates</span>
            <span className="badge bg-brand-50 text-brand-600 text-[8px]">Copy & Paste</span>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {[
            {
              platform: 'Twitter / X',
              icon: '𝕏',
              template: '🤖 Just doubled my Poshmark output with @PoshPalApp! AI listings + auto-sharing = game changer.\n\nTry it free → https://poshpal.app/ref/[CODE]',
            },
            {
              platform: 'TikTok / Instagram',
              icon: '📱',
              template: '✨ The tool every Poshmark reseller needs!\n\nPosh Pal automates your listings, sharing, and cross-listing so you can focus on sourcing.\n\nUse code [CODE] for 14 days free → Link in bio',
            },
            {
              platform: 'Facebook / Groups',
              icon: '👥',
              template: '🚀 Poshmark Resellers! I\'ve been using Posh Pal for [X] weeks and it\'s been a game changer for my closet.\n\n✅ AI listing generator\n✅ 24/7 auto-sharing\n✅ Cross-list to eBay, Mercari & Depop\n\nGet 14 days free with my code: [CODE]\nhttps://poshpal.app/ref/[CODE]',
            },
          ].map((share, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{share.icon}</span>
                <span className="text-xs font-bold text-slate-600">{share.platform}</span>
                <span className="badge bg-slate-100 text-slate-400 text-[8px]">Copy</span>
              </div>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {share.template}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReferralLanding
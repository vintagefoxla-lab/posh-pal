import React, { useState, useEffect } from 'react'
import { ArrowLeft, Gift, Copy, Check, Users, Zap, Share2, Star, Sparkles, Trophy, ChevronRight, Link2, Twitter, MessageCircle } from 'lucide-react'

// ─── Tiers ──────────────────────────────────────────────────────────

const rewardTiers = [
  { referrals: 1, reward: '1 Month Free Pro', icon: Star, color: 'text-brand-600', bg: 'bg-brand-50' },
  { referrals: 3, reward: '3 Months Free Pro', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  { referrals: 5, reward: 'Lifetime 50% Discount', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
  { referrals: 10, reward: 'Lifetime Free Pro', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

// ─── Component ──────────────────────────────────────────────────────

const ReferralSection = ({ onBack, userFetch }) => {
  const [code, setCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  const load = () => {
    userFetch('/api/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: localStorage.getItem('poshpal_user_id') || 'default_user' })
    })
    .then(res => res.json())
    .then(user => {
      setCode(user.referral_code)
      setReferralCount(user.referral_count || 0)
      setLoading(false)
    })
    .catch(err => {
      console.error('Failed to load referral data:', err)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [userFetch])

  const referralLink = `https://poshpal.team/ref/${code}`

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const simulateReferral = () => {
    setSimulating(true)
    // In a real app, this would be a real event. 
    // Here we just refresh to see if the count changed (it won't unless another user uses the code)
    // To actually simulate, we'd need an API that adds a referral.
    setTimeout(() => {
      load()
      setSimulating(false)
    }, 800)
  }

  // Find current tier and next tier
  const nextTier = rewardTiers.find(t => t.referrals > referralCount)
  const progressToNext = nextTier
    ? (referralCount / nextTier.referrals) * 100
    : 100

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 md:p-8 text-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-2 ring-white/20">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Refer & Earn</h2>
            <p className="text-brand-200 mt-1 text-sm font-medium">Share Posh Pal with friends and earn rewards</p>
          </div>
        </div>

        <div className="p-6">
          {/* Referral Code */}
          <div className="mb-6">
            <label className="input-label mb-2">Your Referral Code</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-black text-brand-600 tracking-wider">{code}</span>
                <button onClick={copyCode} className="copy-btn">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mb-6">
            <label className="input-label mb-2">Share Your Link</label>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 py-3 bg-brand-50 text-brand-600 rounded-xl font-bold text-sm hover:bg-brand-100 transition-all flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Copy Link
              </button>
              <button className="flex-1 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold text-sm hover:bg-sky-100 transition-all flex items-center justify-center gap-2">
                <Twitter className="w-4 h-4" />
                Tweet
              </button>
              <button className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Text
              </button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center">
              <p className="text-3xl font-black text-brand-700">{referralCount}</p>
              <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Friends Referred</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-3xl font-black text-emerald-700">
                {referralCount >= 10 ? '🔥' : Math.max(0, 10 - referralCount)}
              </p>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                {referralCount >= 10 ? 'Max Rewards!' : 'To Next Reward'}
              </p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Progress to {nextTier.reward}</span>
                <span className="text-xs font-bold text-brand-600">{referralCount}/{nextTier.referrals}</span>
              </div>
              <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-400 to-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressToNext)}%` }}
                />
              </div>
            </div>
          )}

          {/* Reward Tiers */}
          <div className="mb-6">
            <label className="input-label mb-3">Reward Tiers</label>
            <div className="space-y-2">
              {rewardTiers.map((tier, i) => {
                const unlocked = referralCount >= tier.referrals
                const Icon = tier.icon
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      unlocked
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className={`${unlocked ? tier.bg : 'bg-slate-100'} ${unlocked ? tier.color : 'text-slate-300'} w-10 h-10 rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${unlocked ? 'text-emerald-800' : 'text-slate-700'}`}>
                          {tier.reward}
                        </span>
                        {unlocked && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            Unlocked!
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Refer {tier.referrals} friend{tier.referrals > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      unlocked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'
                    }`}>
                      {unlocked && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-800 mb-1.5">Note</p>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Referral counts are updated when your friends sign up using your link or code. 
              Influencer codes grant 90 days of Pro, while standard codes grant 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralSection

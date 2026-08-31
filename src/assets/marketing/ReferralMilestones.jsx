import React from 'react'
import { 
  Trophy, Medal, Star, Zap, Sparkles, Crown, 
  Gift, CheckCircle2, ChevronRight, Users, ArrowUp 
} from 'lucide-react'

/**
 * ReferralMilestones — Tier Progression Visualization (Bronze → Silver → Gold)
 * 
 * A visual graphic showing the referral reward tiers for the user dashboard.
 * Designed to motivate users to unlock higher tiers through referrals.
 * 
 * Tiers:
 *   🥉 Bronze — 1 referral   → 1 Month Free Pro
 *   🥈 Silver — 3 referrals   → 3 Months Free Pro  
 *   🥇 Gold   — 5 referrals   → Lifetime 50% Discount
 *   💎 Diamond — 10 referrals  → Lifetime Free Pro
 * 
 * Exports:
 *   ReferralMilestones — Full tier progression component
 *   ReferralMilestoneCard — Individual tier card
 *   ReferralProgressBar — Horizontal progress bar
 * 
 * Usage:
 *   <ReferralMilestones currentReferrals={2} />
 *   <ReferralMilestoneCard tier={...} achieved={true} current={false} />
 */

const TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    referrals: 1,
    reward: '1 Month Free Pro',
    icon: Medal,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    gradient: 'from-amber-100 to-amber-50',
    iconBg: 'bg-amber-100',
    badge: '🥉'
  },
  {
    id: 'silver',
    name: 'Silver',
    referrals: 3,
    reward: '3 Months Free Pro',
    icon: Trophy,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    gradient: 'from-slate-100 to-slate-50',
    iconBg: 'bg-slate-200',
    badge: '🥈'
  },
  {
    id: 'gold',
    name: 'Gold',
    referrals: 5,
    reward: 'Lifetime 50% Discount',
    icon: Crown,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    gradient: 'from-amber-100 to-yellow-50',
    iconBg: 'bg-amber-100',
    badge: '🥇'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    referrals: 10,
    reward: 'Lifetime Free Pro',
    icon: Sparkles,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    gradient: 'from-brand-100 to-indigo-50',
    iconBg: 'bg-brand-100',
    badge: '💎'
  }
]

// ─── Individual Milestone Card ────────────────────────────────────────

export const ReferralMilestoneCard = ({ 
  tier, 
  achieved = false, 
  current = false,
  progress = 0 // 0-100
}) => {
  const Icon = tier.icon
  const isLocked = !achieved && !current

  return (
    <div className={`
      relative p-5 rounded-2xl border transition-all duration-300
      ${achieved 
        ? `${tier.border} bg-gradient-to-br ${tier.gradient} shadow-sm` 
        : current
          ? 'border-brand-300 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20'
          : 'border-slate-100 bg-slate-50/50 opacity-60'
      }
    `}>
      {/* Current badge */}
      {current && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-lg shadow-brand-500/20 flex items-center gap-1">
          <ArrowUp className="w-2.5 h-2.5" />
          You are here
        </div>
      )}

      {/* Achieved checkmark */}
      {achieved && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="text-center">
        {/* Badge + Icon */}
        <div className="mb-3">
          <span className="text-2xl">{tier.badge}</span>
        </div>
        
        <div className={`w-12 h-12 rounded-xl ${tier.iconBg} flex items-center justify-center mx-auto mb-3 ${isLocked ? 'opacity-50' : ''}`}>
          <Icon className={`w-6 h-6 ${tier.color}`} />
        </div>

        {/* Tier name */}
        <p className={`text-sm font-black mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
          {tier.name}
        </p>

        {/* Referral count */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Users className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-300' : 'text-slate-500'}`} />
          <span className={`text-xs font-bold ${isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
            {tier.referrals} referral{tier.referrals > 1 ? 's' : ''}
          </span>
        </div>

        {/* Reward */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          achieved 
            ? 'bg-emerald-100 text-emerald-700' 
            : current 
              ? 'bg-brand-100 text-brand-700' 
              : 'bg-slate-100 text-slate-400'
        }`}>
          <Gift className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-wider">{tier.reward}</span>
        </div>

        {/* Progress bar (only for current tier) */}
        {current && !achieved && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Full Milestone Progression ───────────────────────────────────────

export const ReferralMilestones = ({ 
  currentReferrals = 0, 
  className = '' 
}) => {
  // Determine which tier is current / achieved
  const getTierState = (tier) => {
    if (currentReferrals >= tier.referrals) return 'achieved'
    // Find the first unachieved tier
    const nextTier = TIERS.find(t => currentReferrals < t.referrals)
    if (nextTier && tier.id === nextTier.id) return 'current'
    return 'locked'
  }

  // Calculate progress to next tier
  const getProgress = (tier) => {
    if (currentReferrals >= tier.referrals) return 100
    const prevRequired = TIERS.find(t => t.referrals <= currentReferrals && TIERS.indexOf(t) < TIERS.indexOf(tier))
    const prevCount = prevRequired ? prevRequired.referrals : 0
    const tierRange = tier.referrals - prevCount
    const progressInTier = currentReferrals - prevCount
    return Math.round((progressInTier / tierRange) * 100)
  }

  const nextTier = TIERS.find(t => currentReferrals < t.referrals)
  const referralsNeeded = nextTier ? nextTier.referrals - currentReferrals : 0
  const achievedCount = TIERS.filter(t => currentReferrals >= t.referrals).length

  return (
    <div className={`card p-6 md:p-8 ${className}`}>
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-3">
          <Trophy className="w-4 h-4 text-brand-500" />
          <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
            Referral Rewards
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-1">
          Unlock Pro Access by Sharing
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          Refer fellow resellers and earn free Pro months
        </p>
      </div>

      {/* ─── Current Progress Summary ──────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="text-center">
          <p className="text-2xl font-black text-brand-600">{currentReferrals}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Referrals</p>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-600">{achievedCount}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tiers Unlocked</p>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <p className="text-2xl font-black text-amber-600">{referralsNeeded}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To Next Tier</p>
        </div>
      </div>

      {/* ─── Tier Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TIERS.map((tier, i) => {
          const state = getTierState(tier)
          return (
            <ReferralMilestoneCard
              key={tier.id}
              tier={tier}
              achieved={state === 'achieved'}
              current={state === 'current'}
              progress={state === 'current' ? getProgress(tier) : 0}
            />
          )
        })}
      </div>
      
      {/* ─── Connector Line (Desktop) ──────────────────────────────── */}
      <div className="hidden md:flex items-center justify-center gap-2 mb-6">
        {TIERS.map((tier, i) => {
          const state = getTierState(tier)
          return (
            <React.Fragment key={tier.id}>
              {/* Dot */}
              <div className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${state === 'achieved' 
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                  : state === 'current' 
                    ? 'bg-brand-500 ring-4 ring-brand-500/20 shadow-sm shadow-brand-500/30' 
                    : 'bg-slate-200'
                }
              `} />
              {/* Connecting line (except after last) */}
              {i < TIERS.length - 1 && (
                <div className="flex-1 h-0.5 max-w-[60px] bg-slate-200 relative overflow-hidden rounded-full">
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
                      state === 'achieved' ? 'bg-emerald-500 w-full' : 
                      state === 'current' ? 'bg-brand-500' : 'bg-transparent'
                    }`}
                    style={state === 'current' ? { width: `${getProgress(tier)}%` } : {}}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* ─── Motivational CTA ──────────────────────────────────────── */}
      {nextTier && (
        <div className="text-center p-4 bg-brand-50 rounded-2xl border border-brand-100">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Zap className="w-4 h-4 text-brand-500 fill-current" />
            <p className="text-sm font-black text-brand-700">
              {referralsNeeded} more referral{referralsNeeded > 1 ? 's' : ''} to unlock{' '}
              <span className="text-brand-600">{nextTier.name}</span>
            </p>
          </div>
          <p className="text-[11px] text-brand-500 font-medium">
            Share your link and earn <span className="font-bold">{nextTier.reward}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Compact Progress Bar Variant ─────────────────────────────────────

export const ReferralProgressBar = ({ currentReferrals = 0, className = '' }) => {
  const maxTier = TIERS[TIERS.length - 1]
  const progressPercent = Math.min((currentReferrals / maxTier.referrals) * 100, 100)
  const nextTier = TIERS.find(t => currentReferrals < t.referrals)
  const referralsNeeded = nextTier ? nextTier.referrals - currentReferrals : 0

  return (
    <div className={`${className}`}>
      {/* Tier dots + bar */}
      <div className="flex items-center gap-1.5 mb-2">
        {TIERS.map((tier, i) => {
          const achieved = currentReferrals >= tier.referrals
          return (
            <React.Fragment key={tier.id}>
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all shrink-0 ${
                  achieved 
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                    : nextTier && tier.id === nextTier.id
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 ring-2 ring-brand-500/20'
                      : 'bg-slate-100 text-slate-400'
                }`}
                title={`${tier.name}: ${tier.reward}`}
              >
                {tier.referrals}
              </div>
              {i < TIERS.length - 1 && (
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden max-w-[40px]">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: achieved ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Labels */}
      <div className="flex justify-between">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {currentReferrals} referral{currentReferrals !== 1 ? 's' : ''}
        </span>
        {referralsNeeded > 0 && (
          <span className="text-[9px] font-bold text-brand-600">
            {referralsNeeded} to {nextTier?.name}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Default Export ───────────────────────────────────────────────────

export default ReferralMilestones

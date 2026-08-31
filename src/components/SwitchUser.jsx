import React, { useState, useRef, useEffect } from 'react'
import {
  Users,
  ChevronDown,
  Check,
  Crown,
  Star,
  Zap,
  Sparkles,
  LogOut
} from 'lucide-react'

/**
 * SwitchUser — Multi-User Switcher Component
 * 
 * Phase 6: Designed for simulating user account switching.
 * Replaces the hidden md:flex native <select> with a polished dropdown.
 * 
 * Usage:
 *   <SwitchUser currentUserId={userId} onSwitch={setUserId} />
 * 
 * Props:
 *   currentUserId: string — the currently active user ID
 *   onSwitch: (userId: string) => void — callback when user changes
 *   userFetch: function — authenticated fetch for API calls
 */

const USER_ACCOUNTS = [
  {
    id: 'agent-lead',
    label: 'Platform Owner',
    role: 'Admin',
    icon: Crown,
    badge: 'bg-rose-100 text-rose-700',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-rose-700',
    initials: 'O'
  },
  {
    id: 'influencer_sarah',
    label: "Sarah's Closet",
    role: 'Influencer',
    icon: Star,
    badge: 'bg-amber-100 text-amber-700',
    avatarBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    initials: 'S'
  },
  {
    id: 'default_user',
    label: 'Default User',
    role: 'Standard',
    icon: Users,
    badge: 'bg-slate-100 text-slate-500',
    avatarBg: 'bg-gradient-to-br from-slate-400 to-slate-600',
    initials: 'D'
  },
  {
    id: 'reseller_pro',
    label: 'Pro Reseller',
    role: 'Power User',
    icon: Zap,
    badge: 'bg-brand-100 text-brand-600',
    avatarBg: 'bg-gradient-to-br from-brand-500 to-brand-700',
    initials: 'P'
  },
  {
    id: 'new_user_123',
    label: 'New User',
    role: 'New',
    icon: Sparkles,
    badge: 'bg-emerald-100 text-emerald-600',
    avatarBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    initials: 'N'
  }
]

const SwitchUser = ({ currentUserId, onSwitch, userFetch }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const dropdownRef = useRef(null)

  const currentUser = USER_ACCOUNTS.find(u => u.id === currentUserId) || USER_ACCOUNTS[1]
  const CurrentIcon = currentUser.icon

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = async (userId) => {
    if (userId === currentUserId) {
      setIsOpen(false)
      return
    }

    setSwitching(true)
    try {
      // In production, this would call an API to validate the user session
      if (userFetch) {
        await userFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      }
      onSwitch(userId)
      localStorage.setItem('poshpal_user_id', userId)
    } catch (err) {
      console.error('User switch failed:', err)
    } finally {
      setSwitching(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`
          flex items-center gap-2.5 px-3 py-1.5 rounded-xl 
          bg-white border border-slate-200 hover:border-brand-200 
          hover:shadow-sm transition-all duration-200
          ${switching ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full ${currentUser.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-sm`}>
          {switching ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            currentUser.initials
          )}
        </div>

        {/* User Info — hidden on small screens */}
        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.label}</span>
            <span className={`text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-widest ${currentUser.badge}`}>
              {currentUser.role}
            </span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Switch Account</p>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="user-dropdown fade-in-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Switch User</p>
          </div>

          {/* User List */}
          <div className="py-1">
            {USER_ACCOUNTS.map((user) => {
              const isActive = user.id === currentUserId
              const UserIcon = user.icon
              return (
                <button
                  key={user.id}
                  onClick={() => handleSwitch(user.id)}
                  disabled={switching || isActive}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    transition-all duration-150 text-left
                    ${isActive
                      ? 'bg-brand-50 cursor-default'
                      : 'hover:bg-slate-50 cursor-pointer'
                    }
                    ${switching ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full ${user.avatarBg} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}>
                    {user.initials}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${isActive ? 'text-brand-600' : 'text-slate-800'}`}>
                        {user.label}
                      </span>
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-widest ${user.badge}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-medium">
                        ID: {user.id}
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[9px] font-medium text-slate-400 text-center">
              <Users className="w-3 h-3 inline mr-1" />
              Simulation mode — changes affect all views
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwitchUser

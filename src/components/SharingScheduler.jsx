import React, { useState, useEffect } from 'react'
import { Share2, Clock, Calendar, CheckCircle2, Play, Pause, Trash2, Plus, ArrowLeft, Bell, Zap, TrendingUp, Lock, Trophy } from 'lucide-react'

const SharingScheduler = ({ onBack, isPro }) => {
  const [active, setActive] = useState(false)
  const [shares, setShares] = useState(847)
  const [views, setViews] = useState(3210)
  
  const [schedule, setSchedule] = useState([
    { id: 1, time: '09:00', label: 'Morning Share' },
    { id: 2, time: '12:00', label: 'Lunch Break' },
    { id: 3, time: '19:00', label: 'Evening Peak' },
    { id: 4, time: '22:00', label: 'Night Owl' },
  ])

  useEffect(() => {
    let interval
    if (active && isPro) {
      interval = setInterval(() => {
        setShares(prev => prev + Math.floor(Math.random() * 2) + 1)
        setViews(prev => prev + Math.floor(Math.random() * 5) + 2)
      }, 8000)
    }
    return () => clearInterval(interval)
  }, [active, isPro])

  const toggleActive = () => {
    if (!isPro) return
    setActive(!active)
  }

  const removeSlot = (id) => {
    setSchedule(schedule.filter(s => s.id !== id))
  }

  const stats = [
    { label: 'Today', value: shares.toLocaleString(), sub: 'Shares sent' },
    { label: 'Engagement', value: '+23%', sub: 'vs yesterday' },
    { label: 'Views', value: (views / 1000).toFixed(1) + 'k', sub: 'Generated today' },
  ]

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-violet-50 text-violet-600 tool-icon">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Sharing Scheduler</h2>
                <p className="text-xs text-slate-500 font-medium">Automate your closet sharing</p>
              </div>
            </div>
            {isPro && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                <Trophy className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">Pro Enabled</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Bot Status + Stats */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bot Toggle */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 mb-6 relative overflow-hidden ${
            active 
              ? 'bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-500/10' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            {!isPro && (
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-200 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upgrade to Start Bot</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  {active ? <Play className="w-5 h-5 text-white fill-white" /> : <Pause className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${active ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {active ? 'Bot is Running' : 'Bot is Paused'}
                  </p>
                  <p className={`text-xs ${active ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {active ? 'Next share at 12:00 PM' : 'Tap to start auto-sharing'}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleActive}
                disabled={!isPro}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  active ? 'bg-emerald-500' : 'bg-slate-300'
                } ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  active ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {active && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100/50 px-3 py-2 rounded-lg fade-in-up">
                <Bell className="w-3 h-3" />
                Auto-sharing is active — your closet is being shared on schedule
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="input-label mb-0">{isPro ? 'Daily Schedule' : 'Schedule Preview'}</label>
              <span className="text-[10px] font-black text-slate-400">{schedule.length} slots</span>
            </div>
            <div className="space-y-2">
              {schedule.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-violet-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-center font-black text-violet-700 text-sm">
                      {slot.time}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{slot.label}</p>
                      <p className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </p>
                    </div>
                  </div>
                  {isPro && (
                    <button 
                      onClick={() => removeSlot(slot.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {isPro && (
              <button className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:border-violet-200 hover:text-violet-500 hover:bg-violet-50/30 transition-all">
                <Plus className="w-4 h-4 inline mr-1.5" />
                Add Schedule Slot
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-5 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl border border-violet-200/60">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-violet-900">Strategy Tips</h3>
            </div>
            <ul className="text-xs text-violet-700 space-y-2">
              <li className="flex gap-2 items-start">
                <span className="text-violet-500 mt-0.5">•</span>
                Sharing during <strong>"Party" times (9pm ET)</strong> increases visibility by 3x.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-violet-500 mt-0.5">•</span>
                Weekend mornings are <strong>high-traffic</strong> for luxury brands.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-violet-500 mt-0.5">•</span>
                Aim for <strong>4-6 shares per day</strong> for optimal closet activity.
              </li>
            </ul>
          </div>

          {/* Pro upsell */}
          <div className="mt-4 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <p className="text-sm font-bold text-white">24/7 Auto-Sharing</p>
                <p className="text-xs text-slate-400">Unlimited shares with Pro plan</p>
              </div>
            </div>
            <span className="badge-accent text-[9px]">Pro</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharingScheduler
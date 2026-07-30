import React, { useState, useEffect } from 'react'
import { ArrowLeft, Zap, Settings, History, Tag, Clock, CheckCircle2, AlertCircle, Loader2, Play, Pause, Save, Trash2, RefreshCw } from 'lucide-react'

const OfferManager = ({ onBack, isPro, userFetch }) => {
  const [offers, setOffers] = useState([])
  const [rules, setRules] = useState({ discount_percent: 15, delay_minutes: 10, is_active: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const [offersRes, rulesRes] = await Promise.all([
        userFetch('/api/offers'),
        userFetch('/api/offer-rules')
      ])
      if (offersRes.ok) setOffers(await offersRes.json())
      if (rulesRes.ok) setRules(await rulesRes.json())
    } catch (error) {
      console.error('Failed to fetch offer data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(false), 20000)
    return () => clearInterval(interval)
  }, [])

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer entry from history?')) return
    try {
      const response = await userFetch(`/api/offers/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setOffers(offers.filter(o => o.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete offer:', error)
    }
  }

  const handleSaveRules = async () => {
    if (!isPro) return
    setSaving(true)
    try {
      const response = await userFetch('/api/offer-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules)
      })
      if (response.ok) {
        // Success
      }
    } catch (error) {
      console.error('Failed to save rules:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Initializing Offer Engine...</p>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 text-amber-600 tool-icon">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Offer Rules</h2>
                <p className="text-xs text-slate-500 font-medium">Configure auto-responses</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label">Discount Percentage</label>
                <div className="relative">
                   <input 
                    type="number" 
                    className="input-field pr-10" 
                    value={rules.discount_percent}
                    onChange={(e) => setRules({...rules, discount_percent: parseInt(e.target.value)})}
                    disabled={!isPro}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="input-label">Response Delay</label>
                <div className="relative">
                   <input 
                    type="number" 
                    className="input-field pr-16" 
                    value={rules.delay_minutes}
                    onChange={(e) => setRules({...rules, delay_minutes: parseInt(e.target.value)})}
                    disabled={!isPro}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Mins</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-bold text-sm text-slate-900">Engine Status</p>
                    <p className="text-xs text-slate-500">{rules.is_active ? 'Currently active' : 'Paused'}</p>
                  </div>
                  <button 
                    onClick={() => setRules({...rules, is_active: rules.is_active ? 0 : 1})}
                    disabled={!isPro}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      rules.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                      rules.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <button 
                  onClick={handleSaveRules}
                  disabled={!isPro || saving}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Configuration
                </button>
              </div>
            </div>
            
            {!isPro && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                 <p className="text-[10px] text-amber-800 leading-relaxed">
                   <Zap className="w-3 h-3 inline mr-1 mb-0.5" />
                   <strong>Pro Feature:</strong> Automated offers require a Pro subscription. Upgrade to start converting likes into sales while you sleep.
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* History Main */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden h-full">
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-violet-50 text-violet-600 tool-icon">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Offer History</h2>
                  <p className="text-xs text-slate-500 font-medium">Recent automated activity</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fetchData(true)} 
                  className={`p-2 text-slate-400 hover:text-violet-600 transition-colors ${refreshing ? 'animate-spin text-violet-600' : ''}`}
                  title="Refresh History"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{offers.length} entries</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item / Title</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <Tag className="w-10 h-10 mb-2" />
                          <p className="text-sm font-bold">No offers sent yet</p>
                          <p className="text-xs">Likes will appear here as they happen</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-slate-900 truncate max-w-[200px]">{offer.item_title || 'Unnamed Offer'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {offer.inventory_id ? `ID: ${offer.inventory_id}` : `Bundle: ${offer.item_count} items`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            offer.type === 'Bundle' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {offer.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs font-black">
                            -{offer.discount_percent}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            {offer.status === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            {offer.status === 'Sent' && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            {offer.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-slate-400" />}
                            <span className={
                              offer.status === 'Accepted' ? 'text-emerald-700' :
                              offer.status === 'Sent' ? 'text-amber-700' : 'text-slate-500'
                            }>
                              {offer.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <div className="text-right mr-2">
                               <p className="text-[10px] font-bold text-slate-500">{new Date(offer.created_at).toLocaleTimeString()}</p>
                               <p className="text-[10px] text-slate-400">{new Date(offer.created_at).toLocaleDateString()}</p>
                             </div>
                             <button 
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete Entry"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferManager

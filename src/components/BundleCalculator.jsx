import React, { useState, useEffect } from 'react'
import { Calculator, Plus, Trash2, ArrowLeft, TrendingDown, ShieldCheck, Info, Zap, Lightbulb, ShoppingBag, Tag, Check, Sparkles, Gift, Eye, Package, CheckCircle2 } from 'lucide-react'

// ─── Poshmark Fee Calculation ────────────────────────────────────────

function calcPoshmarkFee(price) {
  if (price < 15) {
    return { amount: 2.95, rate: 'flat', label: '$2.95 flat fee (under $15)' }
  }
  return { amount: Math.round(price * 0.20 * 100) / 100, rate: 'percent', label: '20% commission ($15+)' }
}

// ─── Load inventory from API ─────────────────────────────────────────

async function fetchInventory() {
  try {
    const response = await fetch('/api/inventory')
    if (response.ok) {
      const data = await response.json()
      return data.filter(i => i.status !== 'Sold')
    }
    return []
  } catch {
    console.warn('API unavailable, falling back to localStorage')
    try {
      const raw = localStorage.getItem('poshpal_inventory')
      return raw ? JSON.parse(raw).filter(i => i.status !== 'Sold') : []
    } catch { return [] }
  }
}

async function fetchOffers() {
  try {
    const response = await fetch('/api/offers')
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch {
    console.warn('Offers API unavailable, falling back to localStorage')
    try {
      const raw = localStorage.getItem('poshpal_bundle_offers')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }
}

async function saveOfferToAPI(offer) {
  try {
    const response = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    })
    return response.ok
  } catch {
    console.warn('Offers API unavailable, saving to localStorage')
    try {
      const existing = JSON.parse(localStorage.getItem('poshpal_bundle_offers') || '[]')
      localStorage.setItem('poshpal_bundle_offers', JSON.stringify([offer, ...existing]))
      return true
    } catch { return false }
  }
}

async function deleteOfferFromAPI(id) {
  try {
    const response = await fetch(`/api/offers/${id}`, { method: 'DELETE' })
    return response.ok
  } catch {
    console.warn('Offers API unavailable, removing from localStorage')
    try {
      const existing = JSON.parse(localStorage.getItem('poshpal_bundle_offers') || '[]')
      localStorage.setItem('poshpal_bundle_offers', JSON.stringify(existing.filter(o => o.id !== id)))
      return true
    } catch { return false }
  }
}

// ─── Generate category-matched recommendations ──────────────────────

function findRecommendations(inventory, currentItems) {
  const usedTitles = currentItems.map(i => i.title?.toLowerCase() || '')
  const candidates = inventory.filter(item => !usedTitles.includes(item.title?.toLowerCase() || ''))

  // Build category groups
  const groups = {}
  candidates.forEach(item => {
    const cat = item.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })

  // Find pairs: items from different categories that complement each other
  const recs = []
  const categories = Object.keys(groups)
  
  categories.forEach((cat, ci) => {
    if (ci + 1 < categories.length) {
      const nextCat = categories[ci + 1]
      const items1 = groups[cat].slice(0, 3)
      const items2 = groups[nextCat].slice(0, 3)
      
      items1.forEach((a, ai) => {
        if (ai < 3 && items2[ai]) {
          const b = items2[ai]
          const totalPrice = (parseFloat(a.price) || 0) + (parseFloat(b.price) || 0)
          const discount = Math.round(totalPrice * 0.2 * 100) / 100
          const bundlePrice = totalPrice - discount
          
          recs.push({
            items: [a, b],
            totalPrice,
            discount,
            bundlePrice,
            savings: discount,
            match: `${a.category || 'Item'} + ${b.category || 'Item'}`,
          })
        }
      })
    }
  })

  return recs.slice(0, 6)
}

// ─── Generate ID ────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

// ─── Component ──────────────────────────────────────────────────────

const SmartBundleAssistant = ({ onBack, isPro = false, userFetch }) => {
  // Prices the user manually enters
  const [customPrices, setCustomPrices] = useState([{ id: 1, price: '' }])
  const [margin, setMargin] = useState('20')
  const [result, setResult] = useState(null)
  const [savedToOffers, setSavedToOffers] = useState(false)
  const [activeTab, setActiveTab] = useState('calculate')
  const [offersCollapsed, setOffersCollapsed] = useState(true)

  // Inventory & recommendations
  const [inventory, setInventory] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [savedOffers, setSavedOffers] = useState([])

  const _fetchInventory = async () => {
    try {
      const response = await userFetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        return data.filter(i => i.status !== 'Sold')
      }
      return []
    } catch { return [] }
  }

  const _fetchOffers = async () => {
    try {
      const response = await userFetch('/api/offers')
      if (response.ok) return await response.json()
      return []
    } catch { return [] }
  }

  const _saveOfferToAPI = async (offer) => {
    try {
      const response = await userFetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      })
      return response.ok
    } catch { return false }
  }

  const _deleteOfferFromAPI = async (id) => {
    try {
      const response = await userFetch(`/api/offers/${id}`, { method: 'DELETE' })
      return response.ok
    } catch { return false }
  }

  // Load data from API on mount + listen for updates
  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [inv, offers] = await Promise.all([_fetchInventory(), _fetchOffers()])
      if (!mounted) return
      setInventory(inv)
      setSavedOffers(offers)
    }
    load()
    const handler = () => load()
    window.addEventListener('inventory-updated', handler)
    return () => {
      mounted = false
      window.removeEventListener('inventory-updated', handler)
    }
  }, [userFetch])

  useEffect(() => {
    setRecommendations(findRecommendations(inventory, []))
  }, [inventory])

  // ── Custom price handlers ────────────────────────────────────────
  const addCustomPrice = () => {
    setCustomPrices([...customPrices, { id: Date.now(), price: '' }])
  }

  const removeCustomPrice = (id) => {
    if (customPrices.length > 1) {
      setCustomPrices(customPrices.filter(item => item.id !== id))
    }
  }

  const updateCustomPrice = (id, price) => {
    setCustomPrices(customPrices.map(item => item.id === id ? { ...item, price } : item))
  }

  // ── Add inventory item to bundle ─────────────────────────────────
  const addInventoryItem = (item) => {
    const price = parseFloat(item.price) || 0
    setCustomPrices([...customPrices, { id: Date.now(), price: String(price) }])
  }

  // ── Load recommendation into calculator ───────────────────────────
  const loadRecommendation = (rec) => {
    setCustomPrices([
      { id: 1, price: String(rec.items[0]?.price || '') },
      { id: Date.now(), price: String(rec.items[1]?.price || '') },
    ])
    setMargin('20')
    setResult(null)
    setActiveTab('calculate')
    // Set the result directly
    const totalValue = rec.totalPrice
    const discountPct = 20
    const discountAmount = rec.discount
    const bundlePrice = rec.bundlePrice
    const feeInfo = calcPoshmarkFee(bundlePrice)
    const fee = feeInfo.amount
    const netProfit = Math.round((bundlePrice - fee) * 100) / 100
    const buyerSavingPercent = Math.round((discountAmount / totalValue) * 100)

    setResult({
      totalValue: Math.round(totalValue * 100) / 100,
      discountPct,
      discountAmount: Math.round(discountAmount * 100) / 100,
      bundlePrice,
      fee,
      feeInfo,
      netProfit,
      buyerSavingPercent,
      itemCount: 2,
      savedFrom: rec,
    })
  }

  // ── Calculate ────────────────────────────────────────────────────
  const calculate = () => {
    const totalValue = customPrices.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    const discountPct = parseFloat(margin) || 0
    const discountAmount = totalValue * (discountPct / 100)
    const bundlePrice = Math.round((totalValue - discountAmount) * 100) / 100

    const feeInfo = calcPoshmarkFee(bundlePrice)
    const fee = feeInfo.amount
    const netProfit = Math.round((bundlePrice - fee) * 100) / 100
    const buyerSavingPercent = totalValue > 0 ? Math.round((discountAmount / totalValue) * 100) : 0

    setResult({
      totalValue: Math.round(totalValue * 100) / 100,
      discountPct,
      discountAmount: Math.round(discountAmount * 100) / 100,
      bundlePrice,
      fee,
      feeInfo,
      netProfit,
      buyerSavingPercent,
      itemCount: customPrices.length,
    })
  }

  // ── Save to Offers ───────────────────────────────────────────────
  const saveToOffers = async () => {
    if (!result) return
    const offer = {
      id: Math.random().toString(36).substring(2, 11),
      title: `Bundle of ${result.itemCount} items`,
      total_value: result.totalValue,
      discount_percent: result.discountPct,
      bundle_price: result.bundlePrice,
      net_profit: result.netProfit,
      item_count: result.itemCount,
      type: 'Manual',
      status: 'Draft',
    }
    const ok = await _saveOfferToAPI(offer)
    if (ok) {
      const offers = await _fetchOffers()
      setSavedOffers(offers)
      setSavedToOffers(true)
      window.dispatchEvent(new Event('inventory-updated'))
      setTimeout(() => setSavedToOffers(false), 3000)
    }
  }

  // ── Delete offer ─────────────────────────────────────────────────
  const deleteOffer = async (id) => {
    const ok = await _deleteOfferFromAPI(id)
    if (ok) {
      const offers = await _fetchOffers()
      setSavedOffers(offers)
    }
  }

  // ── Offer stats ──────────────────────────────────────────────────
  const totalOfferValue = savedOffers.reduce((s, o) => s + (o.bundlePrice || 0), 0)
  const pendingOffers = savedOffers.length

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 tool-icon">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Smart Bundle Assistant</h2>
                <p className="text-xs text-slate-500 font-medium">Create bundles, save offers, get recommendations</p>
              </div>
            </div>
            {/* Saved Offers badge */}
            {savedOffers.length > 0 && (
              <button 
                onClick={() => setOffersCollapsed(!offersCollapsed)}
                className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl border border-brand-100 text-xs font-bold hover:bg-brand-100 transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                {savedOffers.length} Offer{savedOffers.length !== 1 && 's'}
              </button>
            )}
          </div>
        </div>

        {/* Saved Offers Drawer */}
        {!offersCollapsed && savedOffers.length > 0 && (
          <div className="border-b border-slate-100 bg-slate-50/50 fade-in-up">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="input-label mb-0">Saved Bundle Offers</span>
                <span className="text-[10px] font-bold text-slate-400">${totalOfferValue.toFixed(2)} total</span>
              </div>
              {savedOffers.map(offer => (
                <div key={offer.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">${offer.bundlePrice.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{offer.itemCount} items · ${offer.netProfit.toFixed(2)} take-home</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="badge bg-slate-100 text-slate-500 text-[8px]">{offer.status}</span>
                    <button 
                      onClick={() => deleteOffer(offer.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {inventory.length > 0 && (
          <div className="px-6 pt-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'In Stock', value: inventory.length, icon: Package, color: 'text-brand-600', bg: 'bg-brand-50' },
                { label: 'Offers Saved', value: pendingOffers, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Recs Found', value: recommendations.length, icon: Lightbulb, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className={`${stat.bg} ${stat.color} w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-lg font-black text-slate-900">{stat.value}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* ── Tab: Calculate / Recommendations ────────────────── */}
          <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('calculate')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'calculate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 inline mr-1" />
              Calculate
            </button>
            <button
              onClick={() => setActiveTab('recommend')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'recommend' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
              Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
            </button>
          </div>

          {activeTab === 'calculate' && (
            <>
              {/* ── Price Inputs ─────────────────────────────────── */}
              <div className="space-y-3 mb-5">
                <label className="input-label">Items in Bundle</label>
                {customPrices.map((item, index) => (
                  <div key={item.id} className="flex gap-2 group">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field pl-7 text-sm"
                        placeholder={`Item ${index + 1} price`}
                        value={item.price}
                        onChange={(e) => updateCustomPrice(item.id, e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => removeCustomPrice(item.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      disabled={customPrices.length <= 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button 
                    onClick={addCustomPrice}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:text-brand-500 hover:border-brand-200 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Price
                  </button>
                </div>
              </div>

              {/* ── Discount ────────────────────────────────────── */}
              <div className="mb-5">
                <label className="input-label mb-2">Bundle Discount</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className="input-field pr-10"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <button 
                onClick={calculate}
                className="btn-primary"
              >
                <Calculator className="w-4 h-4" />
                Calculate Bundle Deal
              </button>

              {/* ── Results ─────────────────────────────────────── */}
              {result && (
                <div className="fade-in-up space-y-4 mt-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Retail Total ({result.itemCount} items)</span>
                      <span className="font-bold text-slate-900">${result.totalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Bundle Discount ({result.discountPct}%)</span>
                      <span className="font-bold text-rose-500">-${result.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-slate-800">Bundle Offer</span>
                      <span className="font-black text-brand-600 text-2xl">${result.bundlePrice.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-slate-500">Poshmark Fee</span>
                        <p className="text-[10px] text-slate-400">{result.feeInfo.label}</p>
                      </div>
                      <span className="text-slate-500 font-medium">-${result.fee.toFixed(2)}</span>
                    </div>
                    <div className={`p-4 rounded-xl flex justify-between items-center ${
                      result.netProfit > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${result.netProfit > 0 ? 'text-emerald-600' : 'text-rose-500'}`} />
                        <span className={`font-bold ${result.netProfit > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                          Your Take Home
                        </span>
                      </div>
                      <span className={`font-black text-xl ${result.netProfit > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                        ${result.netProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-2.5">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-800 mb-0.5">Fee Structure</p>
                        <p className="text-[10px] text-indigo-700/80">{result.feeInfo.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Save to Offers */}
                  <button 
                    onClick={saveToOffers}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      savedToOffers
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                        : 'bg-white border-2 border-brand-100 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {savedToOffers ? (
                      <><CheckCircle2 className="w-4 h-4" /> Saved as Draft Offer!</>
                    ) : (
                      <><Tag className="w-4 h-4" /> Save to Bundle Offers</>
                    )}
                  </button>

                  <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex gap-3">
                    <TrendingDown className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-brand-800 mb-0.5">Buyer Saves ${result.discountAmount.toFixed(2)}</p>
                      <p className="text-xs text-brand-700/80">
                        Bundles sell <strong>2x faster</strong> than individual items.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'recommend' && (
            <div className="fade-in-up space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">No recommendations yet</p>
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
                    Add items to your inventory with categories, and we'll suggest smart bundle pairings here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <label className="input-label mb-0">Smart Bundle Matches</label>
                    <span className="text-[10px] text-slate-400">from your inventory</span>
                  </div>
                  
                  {recommendations.filter(r => r.items.length === 2).map((rec, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-brand-100 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className="badge bg-brand-50 text-brand-600 text-[8px]">{rec.match}</span>
                        <span className="text-sm font-black text-brand-600">${rec.bundlePrice.toFixed(2)}</span>
                      </div>
                      <div className="space-y-2 mb-3">
                        {rec.items.map((item, ii) => (
                          <div key={ii} className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                              {item.title?.charAt(0) || '?'}
                            </div>
                            <span className="flex-1 text-slate-700 truncate font-medium">{item.title}</span>
                            <span className="font-bold text-slate-900">${parseFloat(item.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3">
                        <span>Retail: ${rec.totalPrice.toFixed(2)}</span>
                        <span>-${rec.discount.toFixed(2)} (20% off)</span>
                        <span>Fee: ${calcPoshmarkFee(rec.bundlePrice).amount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => loadRecommendation(rec)}
                        className="w-full py-2.5 border-2 border-brand-100 rounded-xl text-xs font-bold text-brand-600 hover:bg-brand-50 transition-all"
                      >
                        <Calculator className="w-3.5 h-3.5 inline mr-1" />
                        Calculate This Bundle
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* Quick add from inventory */}
              {inventory.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Add from Inventory</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {inventory.slice(0, 8).map(item => (
                      <button
                        key={item.id}
                        onClick={() => { addInventoryItem(item); setActiveTab('calculate'); }}
                        className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        {item.title?.substring(0, 18) || 'Item'} ${parseFloat(item.price || 0).toFixed(0)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro upsell */}
              {!isPro && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Unlimited Bundle Matches</p>
                      <p className="text-xs text-slate-400">Pro plan gets priority matching across all inventory</p>
                    </div>
                  </div>
                  <span className="badge-accent text-[9px]">Pro</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartBundleAssistant
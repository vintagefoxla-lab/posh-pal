import React, { useState } from 'react'
import { Calculator, Plus, Trash2, ArrowLeft, TrendingDown, ShieldCheck, Info, Zap } from 'lucide-react'

// ─── Poshmark Fee Calculation ────────────────────────────────────────
// - Items $15+: 20% commission
// - Items <$15: flat $2.95 fee

function calcPoshmarkFee(price) {
  if (price < 15) {
    return { amount: 2.95, rate: 'flat', label: '$2.95 flat fee (under $15)' }
  }
  return { amount: Math.round(price * 0.20 * 100) / 100, rate: 'percent', label: '20% commission ($15+)' }
}

const BundleCalculator = ({ onBack }) => {
  const [items, setItems] = useState([{ id: 1, price: '' }])
  const [margin, setMargin] = useState('20')
  const [result, setResult] = useState(null)

  const addItem = () => {
    setItems([...items, { id: Date.now(), price: '' }])
  }

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updatePrice = (id, price) => {
    setItems(items.map(item => item.id === id ? { ...item, price } : item))
  }

  const calculate = () => {
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
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
      itemCount: items.length,
    })
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 text-amber-600 tool-icon">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Bundle Calculator</h2>
              <p className="text-xs text-slate-500 font-medium">Calculate deal margins with accurate Poshmark fees</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-5 mb-6">
            {/* Items */}
            <div>
              <label className="input-label mb-3">Items in Bundle</label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-2 group">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field pl-7"
                        placeholder={`Item ${index + 1} price`}
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={addItem}
                className="mt-3 flex items-center gap-1.5 text-brand-600 text-sm font-bold hover:text-brand-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                Add Item
              </button>
            </div>

            {/* Discount */}
            <div>
              <label className="input-label mb-3">Desired Bundle Discount</label>
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
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Recommended: 15-25% for bundles of 2-3 items
              </p>
            </div>

            <button 
              onClick={calculate}
              className="btn-primary"
            >
              <Calculator className="w-4 h-4" />
              Calculate Deal
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="fade-in-up space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                {/* Retail Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Retail Total ({result.itemCount} items)</span>
                  <span className="font-bold text-slate-900">${result.totalValue.toFixed(2)}</span>
                </div>

                {/* Discount */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Bundle Discount ({result.discountPct}%)</span>
                  <span className="font-bold text-rose-500">-${result.discountAmount.toFixed(2)}</span>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Bundle Offer */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-800">Bundle Offer Price</span>
                  <span className="font-black text-brand-600 text-2xl">${result.bundlePrice.toFixed(2)}</span>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Poshmark Fee */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-slate-500">Poshmark Fee</span>
                    <p className="text-[10px] text-slate-400">{result.feeInfo.label}</p>
                  </div>
                  <span className="text-slate-500 font-medium">-${result.fee.toFixed(2)}</span>
                </div>

                {/* Take Home */}
                <div className={`p-4 rounded-xl flex justify-between items-center ${
                  result.netProfit > 0 
                    ? 'bg-emerald-50 border border-emerald-200' 
                    : 'bg-rose-50 border border-rose-200'
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

                {/* Fee structure note */}
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-2.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-indigo-800 mb-0.5">Fee Structure Applied</p>
                    <p className="text-[10px] text-indigo-700/80 leading-relaxed">
                      {result.bundlePrice >= 15 
                        ? `At $${result.bundlePrice.toFixed(2)}, the 20% Poshmark commission applies.`
                        : `At $${result.bundlePrice.toFixed(2)} (under $15), the flat $2.95 fee applies. Consider raising the bundle price above $15 to reduce the effective fee rate.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings for buyer */}
              <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex gap-3">
                <TrendingDown className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-brand-800 mb-0.5">Savings for Buyer</p>
                  <p className="text-xs text-brand-700/80">
                    Your buyer saves <strong>${result.discountAmount.toFixed(2)}</strong> ({result.buyerSavingPercent}%) with this bundle. 
                    Bundles typically sell <strong>2x faster</strong> than individual items.
                  </p>
                </div>
              </div>

              {/* Pro Upsell */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Automated Bundle Suggestions</p>
                    <p className="text-xs text-slate-400">Pro plan auto-suggests bundle pricing based on item pairs</p>
                  </div>
                </div>
                <span className="badge-accent text-[9px]">Pro</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BundleCalculator
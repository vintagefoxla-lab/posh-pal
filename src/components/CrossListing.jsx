import React, { useState, useRef } from 'react'
import { ExternalLink, Send, CheckCircle2, Download, ArrowLeft, Zap, Globe, Copy, Check, Sparkles, FileText, Edit3, Eye, Trash2, ListPlus, Info } from 'lucide-react'

// ─── Marketplace Formatting Rules ────────────────────────────────────

const marketplaceRules = {
  ebay: {
    name: 'eBay',
    titleMax: 80,
    descMin: 0,
    descMax: 8000,
    maxPhotos: 24,
    categoryMap: {
      'Jackets': '57989',
      'Tops': '57990',
      'Bottoms': '57991',
      'Shoes': '57992',
      'Accessories': '57993',
      'Dresses': '57994',
      'Sweaters': '57989',
      'Other': '57997',
    },
    csvHeaders: ['Title', 'Description', 'Price', 'Quantity', 'Condition', 'Category ID', 'Photos URL'],
    formatTitle: (title) => title.slice(0, 80).trim(),
    formatDescription: (desc) => {
      // eBay prefers HTML-ish formatting with <br> for newlines
      return desc
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .slice(0, 8000)
    },
  },
  mercari: {
    name: 'Mercari',
    titleMax: 80,
    descMax: 2000,
    maxPhotos: 12,
    categoryMap: {
      'Jackets': 'Mens > Jackets & Coats',
      'Tops': 'Mens > Tops & Tees',
      'Bottoms': 'Mens > Pants',
      'Shoes': 'Mens > Shoes',
      'Accessories': 'Accessories',
      'Dresses': 'Womens > Dresses',
      'Sweaters': 'Mens > Sweaters',
      'Other': 'Other',
    },
    csvHeaders: ['Title', 'Description', 'Price', 'Condition', 'Category', 'Brand', 'Size'],
    formatTitle: (title) => title.slice(0, 80).trim(),
    formatDescription: (desc) => {
      // Mercari limits and wants clean text
      return desc
        .replace(/•/g, '-')
        .replace(/\n{2,}/g, '\n\n')
        .slice(0, 2000)
    },
  },
  depop: {
    name: 'Depop',
    titleMax: 100,
    descMax: 2500,
    maxPhotos: 4,
    categoryMap: {
      'Jackets': 'Jackets',
      'Tops': 'Tops',
      'Bottoms': 'Trousers',
      'Shoes': 'Shoes',
      'Accessories': 'Accessories',
      'Dresses': 'Dresses',
      'Sweaters': 'Jumpers',
      'Other': 'Other',
    },
    csvHeaders: ['Title', 'Description', 'Price', 'Brand', 'Size', 'Category', 'Tags'],
    formatTitle: (title) => title.slice(0, 100).trim(),
    formatDescription: (desc) => {
      // Depop is very visual, short descriptions with hashtags work best
      return desc
        .split('\n')
        .slice(0, 8)
        .join('\n')
        .slice(0, 2500)
    },
  },
}

// ─── Platform-specific formatting ────────────────────────────────────

function generateMarketplaceData(listing, platformId) {
  const rules = marketplaceRules[platformId]
  const categoryKey = Object.keys(rules.categoryMap).find(
    k => listing.category?.toLowerCase().includes(k.toLowerCase())
  ) || 'Other'

  return {
    title: rules.formatTitle(listing.title),
    description: rules.formatDescription(listing.description),
    price: listing.price,
    condition: listing.condition || 'Excellent',
    category: rules.categoryMap[categoryKey],
    categoryId: typeof rules.categoryMap[categoryKey] === 'string' && !isNaN(Number(rules.categoryMap[categoryKey])) 
      ? rules.categoryMap[categoryKey] 
      : '',
    brand: listing.brand || '',
    size: listing.size || '',
    tags: listing.hashtags || '',
    photos: listing.photoCount || 8,
    maxPhotos: rules.maxPhotos,
  }
}

// ─── CSV Generator ──────────────────────────────────────────────────

function generateCSV(data, platformId) {
  const rules = marketplaceRules[platformId]
  const headers = rules.csvHeaders
  
  // Build row based on platform
  const row = []
  for (const header of headers) {
    switch (header) {
      case 'Title': row.push(data.title); break
      case 'Description': row.push(data.description); break
      case 'Price': row.push(data.price); break
      case 'Quantity': row.push('1'); break
      case 'Condition': row.push(data.condition); break
      case 'Category ID': row.push(data.categoryId); break
      case 'Category': row.push(data.category); break
      case 'Brand': row.push(data.brand); break
      case 'Size': row.push(data.size); break
      case 'Tags': row.push(data.tags); break
      case 'Photos URL': row.push(''); break // User fills in photo URLs
      default: row.push('')
    }
  }

  // Escape CSV values
  const escapeCsv = (val) => {
    const str = String(val || '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerLine = headers.map(escapeCsv).join(',')
  const dataLine = row.map(escapeCsv).join(',')

  // Add instructions row
  return `${headerLine}\n${dataLine}\n`
}

// ─── Default sample listing ─────────────────────────────────────────

const defaultListing = {
  title: "Patagonia Better Sweater 1/4 Zip Pullover - Men's M",
  description: "Excellent condition Patagonia Better Sweater in classic grey. This quarter-zip fleece is perfect for layering and provides exceptional warmth without the weight.\n\n• Stand-up collar with zipper garage for chin comfort\n• Raglan sleeves for pack-wearing comfort\n• Shape-holding micropolyester jersey trim at cuffs and hem\n• Flat-seam construction reduces bulk and helps eliminate seam chafe",
  price: '65.00',
  brand: 'Patagonia',
  size: 'M',
  condition: 'Excellent',
  category: 'Jackets',
  photoCount: 8,
  hashtags: '#patagonia #bettersweater #outdoors #hiking #fleece',
}

// ─── Component ──────────────────────────────────────────────────────

const CrossListing = ({ onBack, isPro }) => {
  const [platform, setPlatform] = useState(null)
  const [exported, setExported] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [showListingForm, setShowListingForm] = useState(false)
  const [listing, setListing] = useState(defaultListing)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const rules = platform ? marketplaceRules[platform] : null
  const formatted = platform ? generateMarketplaceData(listing, platform) : null

  // ── CSV Download ──────────────────────────────────────────────────
  const handleDownload = () => {
    if (!formatted || !platform || !isPro) return
    
    const csv = generateCSV(formatted, platform)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `poshpal-export-${platform}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  // ── Copy to clipboard ────────────────────────────────────────────
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // ── Copy all formatted listing as JSON ───────────────────────────
  const copyAllAsText = () => {
    if (!formatted) return
    const text = `Title: ${formatted.title}\n\nDescription:\n${formatted.description}\n\nPrice: $${formatted.price}\nCondition: ${formatted.condition}\nBrand: ${formatted.brand}\nSize: ${formatted.size}\nCategory: ${formatted.category}`
    copyToClipboard(text, 'all')
  }

  // ── Listing form handlers ────────────────────────────────────────
  const updateListing = (field, value) => {
    setListing(prev => ({ ...prev, [field]: value }))
  }

  const resetToListing = () => {
    setListing(defaultListing)
  }

  // ── Platform Details (expandable) ────────────────────────────────
  const platformDetails = {
    ebay: {
      tips: [
        'eBay titles are capped at 80 characters — keep it punchy',
        'Use item specifics (brand, size, color) for better search visibility',
        'eBay promotes listings with "Free Shipping" labels',
        'Set a reserve price for high-value items',
      ],
    },
    mercari: {
      tips: [
        'Mercari buyers love fast shipping — mention "ships today"',
        'First 3 photos determine 90% of buyer interest',
        'Price slightly higher than your floor — Mercari users like to offer',
        'Use all 12 photo slots for maximum engagement',
      ],
    },
    depop: {
      tips: [
        'Depop is style-focused — use fashion-forward keywords',
        'Keep descriptions short and visual with relevant hashtags',
        'Only 4 photos allowed — make each one count',
        'Tag items with multiple relevant style tags',
      ],
    },
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 text-rose-600 tool-icon">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Cross-Listing Export</h2>
              <p className="text-xs text-slate-500 font-medium">Format and export listings to other marketplaces</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Listing Configuration */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <label className="input-label mb-0">Your Listing</label>
              </div>
              <button
                onClick={() => setShowListingForm(!showListingForm)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {showListingForm ? 'Done Editing' : 'Edit'}
              </button>
            </div>

            {/* Listing Summary (read-only mode) */}
            {!showListingForm && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-medium text-slate-500">${listing.price}</span>
                      <span className="text-[10px] text-slate-300">|</span>
                      <span className="text-xs font-medium text-slate-500">{listing.brand}</span>
                      <span className="text-[10px] text-slate-300">|</span>
                      <span className="text-xs font-medium text-slate-500">Size {listing.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowListingForm(true)}
                    className="text-brand-600 hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50 transition-all shrink-0 ml-2"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {showListingForm && (
              <div className="space-y-3 fade-in-up">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Title</label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={listing.title}
                    onChange={(e) => updateListing('title', e.target.value)}
                    placeholder="Listing title"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{listing.title.length} chars</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Description</label>
                  <textarea
                    ref={textareaRef}
                    className="input-field text-sm resize-none"
                    rows={4}
                    value={listing.description}
                    onChange={(e) => updateListing('description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Price ($)</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={listing.price}
                      onChange={(e) => updateListing('price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Brand</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={listing.brand}
                      onChange={(e) => updateListing('brand', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Size</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={listing.size}
                      onChange={(e) => updateListing('size', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Category</label>
                    <select
                      className="input-field text-sm appearance-none"
                      value={listing.category}
                      onChange={(e) => updateListing('category', e.target.value)}
                    >
                      <option>Jackets</option>
                      <option>Tops</option>
                      <option>Bottoms</option>
                      <option>Shoes</option>
                      <option>Accessories</option>
                      <option>Dresses</option>
                      <option>Sweaters</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Condition</label>
                    <select
                      className="input-field text-sm appearance-none"
                      value={listing.condition}
                      onChange={(e) => updateListing('condition', e.target.value)}
                    >
                      <option>New with Tags</option>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Photos</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={listing.photoCount}
                      onChange={(e) => updateListing('photoCount', parseInt(e.target.value) || 0)}
                      min={1}
                      max={24}
                    />
                  </div>
                </div>
                <button
                  onClick={resetToListing}
                  className="text-xs text-slate-400 font-medium hover:text-slate-600 transition-colors"
                >
                  ← Reset to sample listing
                </button>
              </div>
            )}
          </div>

          {!platform ? (
            /* ── Platform Selection ────────────────────────────── */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-rose-500" />
                <label className="input-label mb-0">Export To</label>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(marketplaceRules).map(([id, r]) => (
                  <button 
                    key={id}
                    onClick={() => setPlatform(id)}
                    className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-xl group-hover:scale-110 transition-transform ${
                        id === 'ebay' ? 'bg-blue-50 text-blue-600' :
                        id === 'mercari' ? 'bg-purple-50 text-purple-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {r.name[0]}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800">{r.name}</span>
                        <p className="text-xs text-slate-400 font-medium">
                          Max {r.titleMax} chars · {r.maxPhotos} photos · CSV export
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 group-hover:text-rose-500 transition-colors">
                      <span className="text-xs font-bold hidden sm:inline">Export</span>
                      <Send className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Banner */}
              <div className="mt-6 p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-2xl border border-rose-200/60 flex gap-3">
                <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-800 mb-0.5">AI-Optimized Formatting</p>
                  <p className="text-xs text-rose-700/80 leading-relaxed">
                    We automatically reformat your listing for each platform's requirements — title length limits, 
                    description formatting, category mapping, and optimal photo counts.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Export View — Platform-specific ────────────────── */
            <div className="space-y-5 fade-in-up">
              {/* Success Banner */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-2xl border border-emerald-200/60">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-emerald-900">
                    Formatted for {rules.name}
                  </h3>
                </div>
                <p className="text-xs text-emerald-700 mb-5 leading-relaxed">
                  Your listing has been reformatted for {rules.name}'s requirements. 
                  Title trimmed to {rules.titleMax} chars, description formatted, 
                  and category mapped to the closest match.
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleDownload}
                    disabled={!isPro}
                    className={`btn-primary py-3 text-sm flex-1 ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {exported ? (
                      <><Check className="w-4 h-4" /> Downloaded ✓</>
                    ) : (
                      <><Download className="w-4 h-4" /> {isPro ? `Download ${rules.name} CSV` : 'CSV Export (Pro Only)'}</>
                    )}
                  </button>
                  <button 
                    onClick={copyAllAsText}
                    className="btn-secondary py-3 text-sm flex-1 border-brand-100"
                  >
                    {copiedField === 'all' ? (
                      <><Check className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Listing Text</>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Formatted Preview ──────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <label className="input-label mb-0">Formatted Preview</label>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPro && (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-amber-100">
                        <Trophy className="w-2 h-2 fill-current" /> Pro
                      </div>
                    )}
                    <span className="badge text-[8px] bg-slate-100 text-slate-500">{rules.name}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                  {/* Title */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Title <span className="text-slate-300">({formatted.title.length}/{rules.titleMax} chars)</span>
                      </span>
                      <button 
                        onClick={() => copyToClipboard(formatted.title, 'title')}
                        className="copy-btn text-[10px]"
                      >
                        {copiedField === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'title' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatted.title}</p>
                    {listing.title.length > rules.titleMax && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Trimmed from {listing.title.length} to {rules.titleMax} characters
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Description <span className="text-slate-300">({formatted.description.length} chars)</span>
                      </span>
                      <button 
                        onClick={() => copyToClipboard(formatted.description, 'desc')}
                        className="copy-btn text-[10px]"
                      >
                        {copiedField === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'desc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {formatted.description}
                    </div>
                  </div>

                  {/* Listing Details Grid */}
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Price', value: `${formatted.price}` },
                      { label: 'Condition', value: formatted.condition },
                      { label: 'Brand', value: formatted.brand },
                      { label: 'Size', value: formatted.size },
                      { label: 'Category', value: formatted.category },
                      { label: 'Photos', value: `${Math.min(listing.photoCount, formatted.maxPhotos)}/${formatted.maxPhotos} max` },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── CSV Preview (Pro Only) ────────────────────────── */}
              {isPro && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListPlus className="w-4 h-4 text-slate-400" />
                      <label className="input-label mb-0">CSV Preview</label>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </button>
                  </div>
                  <div className="bg-slate-900 text-green-400 rounded-2xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {generateCSV(formatted, platform)}
                    </pre>
                  </div>
                </div>
              )}

              {/* ── Platform Tips ──────────────────────────────── */}
              {platformDetails[platform] && (
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-200/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-indigo-900">{rules.name} Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {platformDetails[platform].tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-xs text-indigo-700 items-start">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Back + Pro Upsell ──────────────────────────── */}
              <button 
                onClick={() => setPlatform(null)}
                className="w-full text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors py-2"
              >
                ← Choose a different platform
              </button>

              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Bulk Cross-Listing</p>
                    <p className="text-xs text-slate-400">Export up to 50 listings at once with Pro</p>
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

export default CrossListing
import React, { useState, useEffect } from 'react'
import { Package, Search, Plus, Edit3, Trash2, ArrowLeft, Tag, DollarSign, Clock, Eye, X, Save, Archive, AlertCircle, CheckCircle2, ChevronRight, Filter, Grid3X3, List, SlidersHorizontal, Loader2 } from 'lucide-react'
import MarketInsights from './MarketInsights'

import ListingGenerator from './ListingGenerator'

// ─── Status Badge ───────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: 'bg-slate-100 text-slate-600 border-slate-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Sold: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  const icons = {
    Draft: Clock,
    Active: CheckCircle2,
    Sold: Archive,
  }
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.Draft}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}

// ─── Empty State ────────────────────────────────────────────────────

const EmptyState = ({ setActiveTab }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-5">
      <Package className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-1">No items yet</h3>
    <p className="text-slate-400 text-sm max-w-[260px] mb-6">
      Generate listings and save them here to build your inventory.
    </p>
    <button 
      onClick={() => setActiveTab('listing')}
      className="btn-primary inline-flex w-auto px-8"
    >
      <Plus className="w-4 h-4" />
      Create Your First Listing
    </button>
  </div>
)

// ─── Item Card (List View) ──────────────────────────────────────────

const ItemCard = ({ item, onSelect, onDelete }) => (
  <div 
    onClick={() => onSelect(item)}
    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-100 hover:shadow-md transition-all cursor-pointer group"
  >
    {/* Thumbnail placeholder */}
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 text-slate-400 font-black italic text-lg group-hover:scale-105 transition-transform">
      {item.title.charAt(0)}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-brand-600">${parseFloat(item.price || 0).toFixed(2)}</span>
        <span className="text-[10px] text-slate-300">|</span>
        <StatusBadge status={item.status} />
      </div>
      {item.created_at && (
        <p className="text-[10px] text-slate-400 mt-1">
          Saved {new Date(item.created_at).toLocaleDateString()}
        </p>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1">
      <button 
        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
        className="p-2 text-slate-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
    </div>
  </div>
)

// ─── Item Detail Modal ──────────────────────────────────────────────

const ItemDetail = ({ item, onSave, onDelete, onClose, isPro }) => {
  const [form, setForm] = useState({ ...item })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl fade-in-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Edit Item</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Status selector */}
          <div>
            <label className="input-label mb-2">Status</label>
            <div className="flex gap-2">
              {['Draft', 'Active', 'Sold'].map(s => (
                <button
                  key={s}
                  onClick={() => setForm({...form, status: s})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.status === s
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="input-label">Title</label>
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>

          {/* Price */}
          <div>
            <label className="input-label">Price ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                className="input-field pl-7"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Description</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={form.description || ''}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="input-label">Tags</label>
            <input
              type="text"
              className="input-field"
              value={form.tags || ''}
              onChange={(e) => setForm({...form, tags: e.target.value})}
            />
          </div>

          {/* Market Insights — powered by the new component */}
          {(form.category?.toLowerCase().includes('shoe') || form.category?.toLowerCase().includes('sneaker')) && (
            <MarketInsights 
              brand={form.brand} 
              category={form.category} 
              condition={form.condition}
              tierName="Premium"
              demand={75}
              poshpal_pro={isPro}
            />
          )}

          {/* Saved date info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Created: {new Date(form.created_at || Date.now()).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 space-y-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-full py-3 text-sm font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4 inline mr-1.5" />
            Delete Item
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main InventoryManager Component ────────────────────────────────

const InventoryManager = ({ onBack, setActiveTab, isPro = false, userFetch }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('newest')

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await userFetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load items from API on mount
  useEffect(() => {
    fetchInventory()
  }, [])

  // Listen for inventory-save events (from ListingGenerator)
  useEffect(() => {
    const handler = () => {
      fetchInventory()
    }
    window.addEventListener('inventory-updated', handler)
    return () => window.removeEventListener('inventory-updated', handler)
  }, [])

  // Delete item
  const handleDelete = async (id) => {
    try {
      const response = await userFetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setItems(items.filter(i => i.id !== id))
        if (selectedItem?.id === id) setSelectedItem(null)
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // Save edited item
  const handleSaveItem = async (updated) => {
    try {
      const response = await userFetch(`/api/inventory/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (response.ok) {
        setItems(items.map(i => i.id === updated.id ? updated : i))
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  // Filters & sorting
  const filtered = items
    .filter(item => filter === 'All' || item.status === filter)
    .filter(item => 
      !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      if (sortBy === 'price-high') return parseFloat(b.price || 0) - parseFloat(a.price || 0)
      if (sortBy === 'price-low') return parseFloat(a.price || 0) - parseFloat(b.price || 0)
      return 0
    })

  const filters = ['All', 'Draft', 'Active', 'Sold']
  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)

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
              <div className="bg-indigo-50 text-indigo-600 tool-icon">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Inventory Manager</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {loading ? 'Loading...' : `${items.length} items · $${totalValue.toFixed(2)} total`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Inventory...</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState setActiveTab={setActiveTab} />
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total Items', value: items.length, color: 'text-brand-600', bg: 'bg-brand-50' },
                  { label: 'Active', value: items.filter(i => i.status === 'Active').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Sold', value: items.filter(i => i.status === 'Sold').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Search + Filter Bar */}
              <div className="space-y-3 mb-5">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="input-field pl-9 text-sm"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter pills + Sort */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
                    {filters.map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                          filter === f
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {f} {f === 'All' ? `(${items.length})` : `(${items.filter(i => i.status === f).length})`}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button 
                      onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      {viewMode === 'list' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                    <select
                      className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="price-high">Price ↑</option>
                      <option value="price-low">Price ↓</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Item List */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 gap-3' 
                : 'space-y-2'
              }>
                {filtered.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-sm text-slate-400 font-medium">
                    No items match "{filter}" filter
                  </div>
                ) : viewMode === 'grid' ? (
                  filtered.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-100 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black italic text-2xl mb-3 group-hover:scale-[1.02] transition-transform">
                        {item.title.charAt(0)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mb-1">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-brand-600">${parseFloat(item.price || 0).toFixed(2)}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  filtered.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onSelect={setSelectedItem}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onSave={handleSaveItem}
          onDelete={handleDelete}
          onClose={() => setSelectedItem(null)}
          isPro={isPro}
        />
      )}
    </div>
  )
}

export default InventoryManager

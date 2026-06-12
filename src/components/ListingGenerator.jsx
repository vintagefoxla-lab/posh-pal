import React, { useState, useEffect } from 'react'
import { Camera, Copy, Check, Loader2, AlertCircle, Sparkles, ArrowLeft, Zap, Trophy, Package, CheckCircle2 } from 'lucide-react'
import { generateListingFromImage } from '../services/aiService'

const ListingGenerator = ({ onBack, isPro }) => {
  const [image, setImage] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [generationsCount, setGenerationsCount] = useState(() => {
    const saved = localStorage.getItem('poshpal_daily_generations')
    if (!saved) return 0
    try {
      const { date, count } = JSON.parse(saved)
      const today = new Date().toLocaleDateString()
      return date === today ? count : 0
    } catch (e) {
      return 0
    }
  })

  const handleUpload = async (e) => {
    if (!isPro && generationsCount >= 3) {
      setError("Daily limit reached (3/3). Upgrade to Pro for unlimited AI generations!")
      return
    }
    const file = e.target.files[0]
    if (file) {
      setError(null)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result
        setImage(base64Data)
        await processImage(base64Data)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (base64Data) => {
    setGenerating(true)
    try {
      const data = await generateListingFromImage(base64Data)
      setResult(data)
      
      // Increment count for free users
      if (!isPro) {
        const newCount = generationsCount + 1
        setGenerationsCount(newCount)
        localStorage.setItem('poshpal_daily_generations', JSON.stringify({
          date: new Date().toLocaleDateString(),
          count: newCount
        }))
      }
    } catch (err) {
      console.error(err)
      setError("Failed to analyze image. Please try again.")
      setImage(null)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveToInventory = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Math.random().toString(36).substring(2, 11),
          title: result.title,
          description: result.description,
          price: "0", // Default price
          brand: "", // To be filled by user
          size: "",
          condition: "Good",
          category: "",
          status: "Draft"
        })
      })

      if (!response.ok) throw new Error('Failed to save to inventory')
      
      // Dispatch refresh event
      window.dispatchEvent(new CustomEvent('inventory-updated'))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="card p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tight">
            <Camera className="w-5 h-5 text-brand-600" />
            Listing Generator
          </h2>
          {!isPro ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Daily Limit: {generationsCount}/3
              </span>
              <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${generationsCount >= 3 ? 'bg-red-500' : 'bg-brand-500'}`}
                  style={{ width: `${(generationsCount / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
              <Trophy className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Unlimited Pro</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${!isPro && generationsCount >= 3 ? 'bg-brand-50 border border-brand-100 text-brand-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">{error}</p>
              {!isPro && generationsCount >= 3 && (
                <p className="text-xs mt-1 opacity-80">Pro users get unlimited AI generations, 24/7 sharing, and more.</p>
              )}
            </div>
          </div>
        )}

        {!image && !result && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center group hover:border-brand-300 transition-colors">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload}
              disabled={!isPro && generationsCount >= 3}
            />
            <label 
              htmlFor="file-upload"
              className={`${(!isPro && generationsCount >= 3) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-4">Upload a photo to generate your listing</p>
              <span className={`btn-primary inline-flex w-auto px-8 ${(!isPro && generationsCount >= 3) ? 'bg-slate-400 cursor-not-allowed shadow-none' : ''}`}>
                Upload Photo
              </span>
            </label>
          </div>
        )}

        {image && generating && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-slate-900 text-lg font-black italic uppercase tracking-tight">AI is analyzing...</p>
            <p className="text-slate-400 text-sm mt-1">Generating optimized keywords and tags</p>
          </div>
        )}

        {result && !generating && (
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl">
              <img src={image} alt="Uploaded item" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button 
                onClick={() => {setImage(null); setResult(null); setError(null)}}
                className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/40 transition-colors"
              >
                Change Photo
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="input-label flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Generated Title
                  </label>
                  <button onClick={() => copyToClipboard(result.title)} className="copy-btn">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="result-card font-bold text-slate-900">
                  {result.title}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="input-label flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Description
                  </label>
                  <button onClick={() => copyToClipboard(result.description)} className="copy-btn">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="result-card text-sm leading-relaxed whitespace-pre-wrap">
                  {result.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label block mb-1.5">Style Tags</label>
                  <div className="result-card text-xs font-medium">
                    {result.tags}
                  </div>
                </div>
                <div>
                  <label className="input-label block mb-1.5">Hashtags</label>
                  <div className="result-card text-xs font-bold text-brand-600 bg-brand-50 border-brand-100">
                    {result.hashtags}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleSaveToInventory}
                disabled={saving || saved}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  saved ? 'bg-emerald-500 text-white' : 'btn-primary'
                }`}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 saved ? <><CheckCircle2 className="w-5 h-5" /> Saved!</> : 
                 <><Package className="w-5 h-5" /> Save to Inventory</>}
              </button>
              <button 
                onClick={() => {setImage(null); setResult(null); setError(null); setSaved(false)}}
                className="btn-secondary flex-1"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListingGenerator

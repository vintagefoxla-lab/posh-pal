import React, { useState, useEffect } from 'react'
import { Camera, Copy, Check, Loader2, AlertCircle, Sparkles, ArrowLeft, Zap, Trophy, Package, CheckCircle2, X, Plus, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { generateListingFromImages } from '../services/aiService'

const ListingGenerator = ({ onBack, isPro, userFetch }) => {
  const [images, setImages] = useState([])
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

  const [analysisStep, setAnalysisStep] = useState(0)

  useEffect(() => {
    let interval
    if (generating) {
      setAnalysisStep(0)
      interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev < images.length) return prev + 1
          return prev
        })
      }, 800)
    } else {
      setAnalysisStep(0)
    }
    return () => clearInterval(interval)
  }, [generating, images.length])

  const compressImageFile = (file) => new Promise((resolve, reject) => {
    const MAX_DIM = 1200  // max pixels on the long edge
    const JPEG_QUALITY = 0.8
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          let { width, height } = img
          const scale = Math.min(1, MAX_DIM / Math.max(width, height))
          width = Math.max(1, Math.round(width * scale))
          height = Math.max(1, Math.round(height * scale))
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
          // JPEG at 0.8 → a phone photo (~2-4MB) becomes ~150-400KB
          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const handleUpload = (e) => {
    if (!isPro && generationsCount >= 3) {
      setError("Daily limit reached (3/3). Upgrade to Pro for unlimited AI generations!")
      return
    }
    
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit check for free users
    if (!isPro && images.length + files.length > 1) {
      setError("Multi-photo analysis is a Pro feature. Free users can upload 1 photo.")
      return
    }

    // Limit check for Pro users
    if (images.length + files.length > 5) {
      setError("Maximum 5 photos allowed for analysis.")
      return
    }

    setError(null)
    
    files.forEach(file => {
      compressImageFile(file).then(data => {
        setImages(prev => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 9), data }
        ])
      }).catch(() => {
        setError("Couldn't read that photo. Please try a different image.")
      })
    })
    
    // Clear input
    e.target.value = null
  }

  const moveImage = (index, direction) => {
    const newImages = [...images]
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    } else if (direction === 'right' && index < images.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]]
    }
    setImages(newImages)
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one photo.")
      return
    }

    setGenerating(true)
    setError(null)
    
    try {
      const base64Images = images.map(img => img.data)
      const data = await generateListingFromImages(base64Images, userFetch)
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
      setError(err.message || "Failed to analyze images. Please try again.")
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
      const response = await userFetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Math.random().toString(36).substring(2, 11),
          title: result.title,
          description: result.description,
          price: "0", 
          brand: "", 
          size: "",
          condition: "Good",
          category: "",
          status: "Draft"
        })
      })

      if (!response.ok) throw new Error('Failed to save to inventory')
      
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
          <div>
            <h2 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tight">
              <Camera className="w-5 h-5 text-brand-600" />
              Listing Generator
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Multi-Photo AI Analysis
            </p>
          </div>
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
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Pro Unlimited</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${!isPro && error.includes('limit') ? 'bg-brand-50 border border-brand-100 text-brand-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">{error}</p>
              {!isPro && error.includes('Multi-photo') && (
                <p className="text-xs mt-1 opacity-80 font-medium">Pro users can upload up to 5 photos for 5x more accurate listings.</p>
              )}
            </div>
          </div>
        )}

        {!result && !generating && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group hover:border-brand-300 transition-colors">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*" 
                multiple={isPro}
                onChange={handleUpload}
                disabled={!isPro && generationsCount >= 3}
              />
              <label 
                htmlFor="file-upload"
                className={`${(!isPro && generationsCount >= 3) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium mb-4">
                  {images.length === 0 ? "Upload item photos" : "Add more photos"}
                </p>
                <span className={`btn-primary inline-flex w-auto px-8 ${(!isPro && generationsCount >= 3) ? 'bg-slate-400 cursor-not-allowed shadow-none' : ''}`}>
                  {images.length === 0 ? "Choose Photos" : "Add Photo"}
                </span>
              </label>
              {!isPro && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest">
                  <Zap className="w-3 h-3 fill-current" /> Multi-Photo analysis is Pro only
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Selected Photos ({images.length}/5)
                  </h3>
                  {images.length > 0 && (
                    <button onClick={() => setImages([])} className="text-[10px] font-bold text-red-500 hover:text-red-600">
                      Remove All
                    </button>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                  {images.map((img, index) => (
                    <div key={img.id} className="relative shrink-0 group">
                      <img src={img.data} alt="Thumbnail" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm" />
                      
                      {/* Move controls */}
                      {images.length > 1 && (
                        <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-black/20 backdrop-blur-sm rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => moveImage(index, 'left')} 
                            disabled={index === 0}
                            className={`p-0.5 rounded ${index === 0 ? 'text-white/20' : 'text-white hover:bg-white/20'}`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveImage(index, 'right')} 
                            disabled={index === images.length - 1}
                            className={`p-0.5 rounded ${index === images.length - 1 ? 'text-white/20' : 'text-white hover:bg-white/20'}`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 bg-white border border-slate-200 text-slate-400 rounded-full p-1 hover:text-red-500 hover:border-red-200 shadow-sm z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleGenerate}
                  className="btn-primary w-full py-4 text-base"
                >
                  Generate Listing with {images.length} Photo{images.length > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}

        {generating && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin relative z-10" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce z-10" />
            </div>
            <p className="text-slate-900 text-lg font-black italic uppercase tracking-tight">
              Analyzing Photos... ({analysisStep}/{images.length})
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              {analysisStep === 0 && "Initializing vision engine..."}
              {analysisStep > 0 && analysisStep < images.length && `Processing angle ${analysisStep}...`}
              {analysisStep === images.length && "Synthesizing insights..."}
            </p>
            
            <div className="mt-8 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Vision Pipeline</span>
                <span>{Math.round((analysisStep / images.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-700 ease-out"
                  style={{ width: `${(analysisStep / images.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {result && !generating && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((img, idx) => (
                <div key={img.id} className="relative shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={img.data} alt={`Photo ${idx + 1}`} className="w-32 h-32 object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {idx + 1}/{images.length}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="input-label flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Optimized Title
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
                    Detailed Description
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
                onClick={() => {setImages([]); setResult(null); setError(null); setSaved(false)}}
                className="btn-secondary flex-1"
              >
                New Generation
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!isPro && (
        <div className="mt-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
            <Zap className="w-16 h-16 text-brand-400 fill-brand-400" />
          </div>
          <div className="relative z-10">
            <h4 className="text-white font-black italic uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
              Upgrade to Multi-Photo
            </h4>
            <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
              Pro users analyze up to 5 photos at once to identify brand, size, and flaws automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingGenerator

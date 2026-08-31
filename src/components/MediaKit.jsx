import React, { useState } from 'react'
import InstagramGridPost from './InstagramGridPost'
import InfluencerROI from './InfluencerROI'
import { BeforeAfter, PoshPalIn15 } from './TikTokTemplates'
import { CheckCircle2, Copy, Download } from 'lucide-react'

/**
 * SocialAssetsPreview — Preview page for all social media marketing assets.
 * 
 * Displays Instagram posts at thumbnail size and TikTok templates at preview size.
 * Includes copy/download references for the marketer.
 * 
 * Route idea: /brand-kit/social (accessible from the Brand Kit)
 */

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
      active
        ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}
  >
    {label}
  </button>
)

const SocialAssetsPreview = () => {
  const [activeTab, setActiveTab] = useState('instagram')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-50 text-brand-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="14" width="28" height="22" rx="4" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="2.5" />
              <path d="M14 14V11C14 7.686 16.686 5 20 5C23.314 5 26 7.686 26 11V14" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 22L22 20L24 18L26 20L24 22Z" fill="#6366F1" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Social Media Assets</h1>
            <p className="text-sm text-slate-500">Instagram grid posts & TikTok/Reels templates for influencer campaigns</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-8">
        <TabButton label="📸 Instagram Grid" active={activeTab === 'instagram'} onClick={() => setActiveTab('instagram')} />
        <TabButton label="🎬 TikTok / Reels" active={activeTab === 'tiktok'} onClick={() => setActiveTab('tiktok')} />
        <TabButton label="💰 Earnings Calculator" active={activeTab === 'roi'} onClick={() => setActiveTab('roi')} />
      </div>

      {/* ─── Instagram Grid Tab ─────────────────────────────── */}
      {activeTab === 'instagram' && (
        <div className="space-y-8">
          {/* Post 1: Earnings Growth */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Post 1</span>
                <h2 className="text-lg font-black text-slate-900">📈 Earnings Growth — Success Story Teaser</h2>
              </div>
              <span className="badge bg-emerald-50 text-emerald-600 text-[9px]">Best Performer</span>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[400px] shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <InstagramGridPost variant="earnings-growth" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Showcases a real reseller's income transformation with a bold "+$2,000/mo" stat. 
                  Features a side-by-side "Before vs After" comparison (5→25 listings/wk, $800→$2,800/mo).
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Usage</p>
                  <ul className="space-y-1.5">
                    {[
                      'Lead magnet for influencer referral campaigns',
                      'Instagram carousel cover image',
                      'Pinterest pin graphic',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-800">
                    💡 Pro tip: Pair with the Success Story Blog Template for the full story link in bio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Post 2: AI Listing Generator */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Post 2</span>
                <h2 className="text-lg font-black text-slate-900">✨ AI Listing Generator — Feature Spotlight</h2>
              </div>
              <span className="badge bg-brand-50 text-brand-600 text-[9px]">Feature Demo</span>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[400px] shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <InstagramGridPost variant="ai-listing" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Highlights Posh Pal's flagship feature with the headline "Snap a Photo. Get a Listing." 
                  Shows the AI speed callout (10 seconds → 1 listing) and feature tags.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Usage</p>
                  <ul className="space-y-1.5">
                    {[
                      'Feature introduction for new audiences',
                      'Product launch / update announcement',
                      'Instagram story highlight cover',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Post 3: Did You Know? */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Post 3</span>
                <h2 className="text-lg font-black text-slate-900">💡 Did You Know? — Educational Post</h2>
              </div>
              <span className="badge bg-violet-50 text-violet-600 text-[9px]">Educational</span>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[400px] shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <InstagramGridPost variant="did-you-know" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Educational content that teaches resellers about Poshmark's sharing algorithm. 
                  Big "3x" stat shows engagement boost, with a manual-vs-auto time comparison.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Usage</p>
                  <ul className="space-y-1.5">
                    {[
                      'Value-driven content for new followers',
                      'Educational carousel starter',
                      'Community engagement post',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TikTok / Reels Tab ───────────────────────────────── */}
      {activeTab === 'tiktok' && (
        <div className="space-y-8">
          {/* Template 1: Before vs After */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Template 1</span>
                <h2 className="text-lg font-black text-slate-900">🎬 Before vs After — Video Overlay</h2>
              </div>
              <span className="badge bg-emerald-50 text-emerald-600 text-[9px]">High Conversion</span>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[280px] shrink-0 mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <div className="aspect-[9/16] overflow-hidden bg-slate-900 rounded-2xl">
                  <BeforeAfter />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  A dark-themed split comparison overlay showing "Before" (manual, 2h/day, $800/mo) 
                  vs "After" (Posh Pal auto, 0h/day, $2,800/mo). Perfect as a static title card 
                  or overlay for talking-head style videos.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions</p>
                    <p className="text-xs font-bold text-slate-700">1080 × 1920 (9:16)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Safe Area</p>
                    <p className="text-xs font-bold text-slate-700">Bottom 200px for captions</p>
                  </div>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                  <p className="text-[10px] font-bold text-violet-800">
                    💡 Video idea: Show your manual routine (2h of sharing) then cut to "With Posh Pal, I do this instead" — overlay this template at that moment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template 2: Posh Pal in 15 Seconds */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Template 2</span>
                <h2 className="text-lg font-black text-slate-900">⚡ Posh Pal in 15 Seconds — Feature Highlight</h2>
              </div>
              <span className="badge bg-amber-50 text-amber-600 text-[9px]">Quick Demo</span>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[280px] shrink-0 mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <div className="aspect-[9/16] overflow-hidden bg-white rounded-2xl">
                  <PoshPalIn15 />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  A clean, light-themed highlight card that summarizes Posh Pal's 3 core features 
                  (Snap & List, Auto-Share, Optimize & Profit) with a "15 sec setup" timer badge. 
                  Perfect for the opening or closing frame of a short video.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions</p>
                    <p className="text-xs font-bold text-slate-700">1080 × 1920 (9:16)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Style</p>
                    <p className="text-xs font-bold text-slate-700">Light background, brand accents</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-800">
                    💡 Video idea: Use as the opening title card → cut to each feature demo → close with a CTA. Total video: 15-30 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ROI Calculator Tab ─────────────────────────────── */}
      {activeTab === 'roi' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-slate-900 mb-2">💰 Influencer Partner ROI</h2>
            <p className="text-sm text-slate-500 mb-8">
              A high-fidelity tool to show potential partners their earning potential. 
              Embed this directly on landing pages or use it during outreach calls to visualize recurring revenue.
            </p>
            
            <div className="max-w-4xl mx-auto">
              <InfluencerROI />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">Outreach Strategy</p>
                <p className="text-xs text-indigo-900/70 leading-relaxed">
                  "Most resellers don't realize they can turn their audience into a recurring revenue stream. 
                  With a $15 payout per signup and our 12% conversion rate, a single post to 25k followers 
                  can generate over $1,000/mo."
                </p>
              </div>
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">Partner Benefits</p>
                <ul className="space-y-1">
                  {[
                    'Lifetime Pro access for partner',
                    'Custom referral code & dashboard',
                    'Direct support & training assets',
                    'Early access to new AI features'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-emerald-900/70">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          All assets are 1080×1080 (Instagram) or 1080×1920 (TikTok) SVG React components.
          Export by rendering and right-clicking the SVG, or use the React components directly in your landing page.
        </p>
      </div>
    </div>
  )
}

export default SocialAssetsPreview
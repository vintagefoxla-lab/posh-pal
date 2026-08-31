import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  FileText, 
  Tag as TagIcon, 
  User, 
  Layout, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react'
import { refineBlogContent } from '../services/aiService'

const TEMPLATES = [
  {
    id: 1,
    name: 'Hustle at Home Mom',
    title: 'How One Mom Paid Off Her Mortgage Flipping Thrift Store Finds (And How AI Can Help You Do It Too)',
    summary: 'Discover how Hustle at Home Mom turned Goodwill finds into a mortgage payoff — and how AI tools like Posh Pal are changing the game for home-based resellers.',
    tags: 'success story, home business, growth',
    content: `## The Journey to Financial Freedom

Hustle at Home Mom started with zero experience and a busy family life. Today, they've built a six-figure reselling business that paid off their mortgage. 

### The Secret Sauce
Their secret? Consistent listing, smart pricing, and now — AI tools that do the heavy lifting. Specializing in vintage and estate sale finds, she proved that you don't need a massive warehouse to make massive profits.

### Scaling with AI
With Posh Pal's AI listing generator, automated sharing, and cross-listing, you can follow the same path with half the effort. Automation allows you to focus on sourcing while the bot handles the repetitive tasks.`
  },
  {
    id: 2,
    name: 'Frizzy\'s Finds',
    title: "How Frizzy's Finds Sells on 6 Platforms Without Burning Out — The Cross-Listing Playbook",
    summary: "Johnny & Frizzy built a thriving reselling business across eBay, Poshmark, and more. Learn their cross-listing strategy.",
    tags: "cross-listing, efficiency, strategy",
    content: `## Mastering the Multi-Platform Game

Frizzy's Finds, a power couple in the reselling world, built their business selling across eBay, Poshmark, and Depop. They were already using cross-listing tools to stay efficient.

### Data-Driven Success
With a keywords-heavy, data-driven approach, they ensure every item is seen by the right buyer. But juggling 6 platforms is a full-time job in itself.

### The Posh Pal Advantage
With Posh Pal, everything — listing generation, sharing, pricing, and cross-listing — happens in one place, AI-powered and automated. That means more time sourcing and less time copy-pasting listings.`
  },
  {
    id: 3,
    name: 'Trash Pandas Thrift',
    title: "$850,000 From Goodwill Bins? How Trash Pandas Thrift Built a Keyword-Driven Reselling Empire",
    summary: "Bethany & Sean turned Goodwill outlet bins into $850K+ in sales. Learn their keyword-first strategy.",
    tags: "sourcing, SEO, keywords",
    content: `## Profit in the Bins

Trash Pandas Thrift proved that you don't need high-end brands to make six figures reselling. Their keyword-first approach — finding what buyers are searching for, not what's trendy — turned Goodwill bins into an $850K business.

### Beyond the Brand
They don't chase brands — they chase keywords. By understanding SEO and buyer intent, they flip "bad brands" for big profits.

### Supercharging SEO
Posh Pal supercharges this strategy with AI-generated titles and descriptions optimized for search, so your listings get found first. Our AI understands the high-value keywords that drive sales.`
  }
]

const BlogCMS = ({ onBack, userFetch }) => {
  const [title, setTitle] = useState('')
  const [versionBTitle, setVersionBTitle] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Team Posh Pal')
  const [isPublishing, setIsIsPublishing] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [message, setMessage] = useState(null)

  const applyTemplate = (template) => {
    setTitle(template.title)
    setVersionBTitle('')
    setIsVerified(false)
    setSummary(template.summary)
    setTags(template.tags)
    setContent(template.content)
    setMessage({ type: 'success', text: `Applied "${template.name}" template!` })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleRefine = async () => {
    if (!content) return
    setIsRefining(true)
    try {
      const refined = await refineBlogContent(content)
      setContent(refined)
      setMessage({ type: 'success', text: 'Draft refined with AI!' })
    } catch (e) {
      setMessage({ type: 'error', text: 'AI Refine failed.' })
    } finally {
      setIsRefining(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handlePublish = async () => {
    if (!title || !content) {
      setMessage({ type: 'error', text: 'Title and Content are required.' })
      return
    }

    setIsIsPublishing(true)
    try {
      const res = await userFetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, version_b_title: versionBTitle, is_verified: isVerified ? 1 : 0, summary, tags, content, author })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Post published successfully!' })
        // Clear form
        setTitle('')
        setVersionBTitle('')
        setIsVerified(false)
        setSummary('')
        setTags('')
        setContent('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to publish.' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setIsIsPublishing(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="fade-in-up pb-10">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="back-btn mb-0">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
            Admin CMS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-4 h-4 text-brand-500" />
              <h3 className="font-bold text-slate-800">Draft Templates</h3>
            </div>
            <div className="space-y-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-brand-200 hover:bg-white transition-all group"
                >
                  <p className="text-[10px] font-black text-brand-500 uppercase mb-1">{t.name}</p>
                  <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-brand-600">
                    {t.title.substring(0, 60)}...
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Choose a template to pre-fill the editor. These are optimized for SEO and reseller success stories.
              </p>
            </div>
          </div>
        </div>

        {/* Editor Main */}
        <div className="lg:col-span-2 space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-bounce-subtle ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-bold">{message.text}</p>
            </div>
          )}

          <div className="card p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Post Title (Version A)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field pl-10"
                    placeholder="e.g. How Sarah Scaled to 500+ Sales..."
                  />
                </div>
              </div>
              <div>
                <label className="input-label">A/B Test Title (Version B - Optional)</label>
                <div className="relative">
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={versionBTitle}
                    onChange={(e) => setVersionBTitle(e.target.value)}
                    className="input-field pl-10 border-dashed border-brand-200"
                    placeholder="e.g. 500 Sales? Sarah's AI Strategy Revealed"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">Verified Success Story</h4>
                <p className="text-[10px] text-slate-400 font-medium">Adds a 'Verified' badge to the post to build trust.</p>
              </div>
              <button 
                onClick={() => setIsVerified(!isVerified)}
                className={`w-12 h-6 rounded-full transition-all duration-200 relative ${isVerified ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${isVerified ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Author</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Team Posh Pal"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Tags (comma separated)</label>
                <div className="relative">
                  <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="input-field pl-10"
                    placeholder="reselling, growth, tips"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Summary / Meta Description</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="input-field min-h-[80px] py-3"
                placeholder="A brief overview for search engines and social cards..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label mb-0">Content (Markdown)</label>
                <button
                  onClick={handleRefine}
                  disabled={isRefining || !content}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all disabled:opacity-50"
                >
                  {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Refine
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field min-h-[400px] font-mono text-sm py-4 leading-relaxed"
                placeholder="Write your post here... Use ## for headings, * for lists, etc."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {content.split(/\s+/).filter(Boolean).length} Words
              </p>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !title || !content}
                className="btn-primary py-3 px-8 w-auto flex items-center gap-2 relative overflow-hidden"
              >
                {isPublishing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogCMS

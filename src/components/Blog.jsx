import React, { useState, useEffect } from 'react'
import { ArrowLeft, Clock, User, Tag, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react'
import SuccessStory from './SuccessStory'
import { FeaturedSuccessStoryHeader } from '../assets/marketing'

const Blog = ({ onBack, onPostClick, userFetch }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userFetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch blog posts:', err)
        setLoading(false)
      })
  }, [])

  const getDisplayTitle = (post) => {
    if (!post.version_b_title) return post.title;
    // Simulation: Deterministically show A or B based on post ID
    const useVersionB = (post.id % 2 === 1);
    return useVersionB ? post.version_b_title : post.title;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-500" />
          Reseller Success Blog
        </h1>
        <p className="text-slate-500 text-sm">
          Tips, strategies, and success stories from the Posh Pal community.
        </p>
      </div>

      {/* Featured Story (Marketing Asset) */}
      {posts.find(p => p.is_verified === 1) && (
        <div 
          className="mb-8 card overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all shadow-xl"
          onClick={() => onPostClick(posts.find(p => p.is_verified === 1).slug)}
        >
          <FeaturedSuccessStoryHeader 
            name="Hustle at Home Mom"
            growth="+$3,200/mo"
            growthPercent="+150%"
            niche="Family & Kids Resale"
            avatarInitial="H"
            beforeRevenue="$2,100/mo"
            afterRevenue="$5,300/mo"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="card p-5 cursor-pointer hover:border-brand-200 transition-all group"
            onClick={() => onPostClick(post.slug)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-wrap gap-1.5 items-center">
                {post.is_verified === 1 && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {post.tags.split(',').map((tag, i) => (
                  <span key={i} className="badge bg-brand-50 text-brand-600 text-[9px] px-2 py-0.5">
                    {tag.trim()}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{post.date}</span>
            </div>
            
            <h2 className="text-lg font-black text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
              {getDisplayTitle(post)}
            </h2>
            
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
              {post.summary}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.read_time}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {post.author}
                </span>
              </div>
              <div className="text-brand-500 flex items-center gap-1 text-xs font-black">
                Read Story <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const BlogPost = ({ slug, onBack, userFetch }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userFetch(`/api/blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch blog post:', err)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">Post not found.</p>
        <button onClick={onBack} className="btn-secondary mt-4">Go Back</button>
      </div>
    )
  }

  const getDisplayTitle = (post) => {
    if (!post.version_b_title) return post.title;
    const useVersionB = (post.id % 2 === 1);
    return useVersionB ? post.version_b_title : post.title;
  }

  if (post.tags.toLowerCase().includes('success story')) {
    return <SuccessStory post={{...post, displayTitle: getDisplayTitle(post)}} onBack={onBack} />
  }

  return (
    <div className="fade-in-up">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
      </button>

      <div className="card p-6 md:p-8">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.is_verified === 1 && (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Verified Success
              </span>
            )}
            {post.tags.split(',').map((tag, i) => (
              <span key={i} className="badge bg-brand-50 text-brand-600 text-[10px]">
                {tag.trim()}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
            {getDisplayTitle(post)}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {post.read_time}
            </span>
            <span>{post.date}</span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="text-slate-600 leading-relaxed space-y-4">
            {post.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-900 mb-4">Ready to write your own success story?</p>
          <button className="btn-primary inline-flex">Start Your Free Trial</button>
        </div>
      </div>
    </div>
  )
}

export { Blog, BlogPost }

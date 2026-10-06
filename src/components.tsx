import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Bookmark, Check, ChevronDown, Copy, Heart, Menu, Moon, PenLine, Search, Share2, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { Post } from './types'
import { useApp } from './store'
import { formatCount, formatDate } from './utils'

export function Header() {
  const { theme, toggleTheme } = useApp()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const navItems = [
    { to: '/', label: 'Explore' },
    { to: '/bookmarks', label: 'Reading list' },
    { to: '/my-posts', label: 'My posts' },
  ]

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" aria-label="INKFRAME home">
          <span className="wordmark-mark">I</span><span>INKFRAME</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{item.label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => navigate('/?focus=search')} aria-label="Search stories" title="Search stories"><Search size={18} /></button>
          <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/create" className="button button-dark header-create"><PenLine size={16} /> Write</Link>
          <button className="mobile-menu-button icon-button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="mobile-navigation" aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.nav id="mobile-navigation" className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} aria-label="Mobile navigation">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>{item.label}<ArrowUpRight size={15} /></NavLink>)}
          <Link to="/create" className="mobile-nav-link mobile-write"><span>Write a story</span><ArrowUpRight size={15} /></Link>
        </motion.nav>}
      </AnimatePresence>
    </header>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return <motion.div key={location.pathname + location.search} className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>{children}</motion.div>
}

export function Button({ children, className = '', variant = 'dark', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'outline' | 'quiet' | 'accent' }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>
}

export function CategoryLabel({ children }: { children: React.ReactNode }) {
  return <span className="category-label">{children}</span>
}

export function PostMeta({ post, compact = false }: { post: Post; compact?: boolean }) {
  return <div className={compact ? 'post-meta compact' : 'post-meta'}>
    <span>{post.author.name}</span><span className="meta-dot">·</span><span>{formatDate(post.date)}</span><span className="meta-dot">·</span><span>{post.readingTime} min read</span>
  </div>
}

export function LikeButton({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { likedPosts, toggleLike } = useApp()
  const active = likedPosts.includes(post.id)
  return <motion.button whileTap={{ scale: 0.88 }} className={active ? 'engagement-button active' : 'engagement-button'} onClick={() => toggleLike(post.id)} aria-label={active ? `Unlike ${post.title}` : `Like ${post.title}`} aria-pressed={active}>
    <Heart size={compact ? 16 : 18} fill={active ? 'currentColor' : 'none'} /><span>{formatCount(post.likes)}</span>
  </motion.button>
}

export function BookmarkButton({ post, compact = false }: { post: Post; compact?: boolean }) {
  const { bookmarkedPosts, toggleBookmark } = useApp()
  const active = bookmarkedPosts.includes(post.id)
  return <motion.button whileTap={{ scale: 0.88 }} className={active ? 'engagement-button active' : 'engagement-button'} onClick={() => toggleBookmark(post.id)} aria-label={active ? `Remove ${post.title} from reading list` : `Save ${post.title} to reading list`} aria-pressed={active}>
    <Bookmark size={compact ? 16 : 18} fill={active ? 'currentColor' : 'none'} />{!compact && <span>{active ? 'Saved' : 'Save'}</span>}
  </motion.button>
}

export function PostCard({ post, variant = 'standard', index = 0 }: { post: Post; variant?: 'standard' | 'horizontal' | 'compact'; index?: number }) {
  return <motion.article className={`post-card post-card-${variant}`} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}>
    <Link to={`/post/${post.id}`} className="post-image-link">
      <img src={post.coverImage} alt="" className="post-image" loading={index > 1 ? 'lazy' : 'eager'} /><span className="post-image-index">{String(index + 1).padStart(2, '0')}</span><span className="post-image-corner" aria-hidden="true" />
    </Link>
    <div className="post-card-body">
      <CategoryLabel>{post.category}</CategoryLabel>
      <Link to={`/post/${post.id}`} className="post-title-link"><h3>{post.title}</h3></Link>
      {variant !== 'compact' && <p className="post-excerpt">{post.excerpt}</p>}
      <PostMeta post={post} compact={variant === 'compact'} />
      <div className="post-card-footer"><LikeButton post={post} compact /><BookmarkButton post={post} compact /><span className="card-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span></div>
    </div>
  </motion.article>
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-mark">∅</div><h2>{title}</h2><p>{body}</p>{action}</div>
}

export function LoadingState() {
  return <div className="loading-state" aria-live="polite" aria-label="Loading stories"><span /><span /><span /></div>
}

export function Toasts() {
  const { toasts, dismissToast } = useApp()
  return <div className="toast-region" aria-live="polite"> <AnimatePresence>{toasts.map((toast) => <motion.div key={toast.id} className={`toast toast-${toast.tone}`} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}>
    <span className="toast-icon"><Check size={14} /></span><span>{toast.message}</span><button onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification"><X size={14} /></button>
  </motion.div>)}</AnimatePresence></div>
}

export function ConfirmDialog({ title, body, onConfirm, onCancel }: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <motion.div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <div className="dialog-kicker">Before you continue</div><h2 id="dialog-title">{title}</h2><p>{body}</p><div className="dialog-actions"><Button variant="quiet" onClick={onCancel}>Cancel</Button><Button variant="accent" onClick={onConfirm}>Delete story</Button></div>
    </motion.div>
  </div>
}

export function ArticleActions({ post }: { post: Post }) {
  const { pushToast } = useApp()
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text: post.subtitle, url }) } catch { /* user cancelled share */ }
    } else {
      await navigator.clipboard?.writeText(url)
      setCopied(true)
      pushToast('Link copied to your clipboard.', 'info')
      window.setTimeout(() => setCopied(false), 1800)
    }
  }
  return <div className="article-actions"><LikeButton post={post} /><BookmarkButton post={post} /><button className="engagement-button" onClick={share} aria-label="Share this article">{copied ? <Check size={18} /> : <Share2 size={18} />}<span>{copied ? 'Copied' : 'Share'}</span></button></div>
}

export function SearchField({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit?: () => void }) {
  return <form className="search-field" onSubmit={(event) => { event.preventDefault(); onSubmit?.() }}><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="story-search">Search stories</label><input id="story-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search stories, authors, tags..." /></form>
}

export function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Sort stories"><option value="latest">Latest</option><option value="likes">Most liked</option><option value="bookmarks">Most saved</option></select><ChevronDown size={15} aria-hidden="true" /></div>
}

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 650)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return <AnimatePresence>{visible && <motion.button className="back-to-top" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUpRight size={16} className="rotate-45" /> Top</motion.button>}</AnimatePresence>
}

export function AuthorBlock({ post }: { post: Post }) {
  return <aside className="author-block"><img src={post.author.avatar} alt={`${post.author.name}'s avatar`} /><div><p className="eyebrow">About the author</p><h3>{post.author.name}</h3><p>{post.author.bio}</p><span>{post.author.role}</span></div></aside>
}

export function CopyButton({ text }: { text: string }) {
  const { pushToast } = useApp()
  return <button className="copy-button" onClick={() => { navigator.clipboard?.writeText(text); pushToast('Copied to clipboard.', 'info') }} aria-label="Copy content"><Copy size={14} /></button>
}

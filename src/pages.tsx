import { ArrowLeft, ArrowRight, Check, Eye, Heart, LayoutGrid, ListFilter, MessageCircle, Plus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cloneElement, FormEvent, isValidElement, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArticleActions, AuthorBlock, BackToTop, BookmarkButton, Button, CategoryLabel, ConfirmDialog, EmptyState, LikeButton, LoadingState, PostCard, PostMeta, SearchField, SectionHeading, SortSelect } from './components'
import { categories } from './data'
import { useApp } from './store'
import type { ContentBlock, Post, PostStatus } from './types'
import { formatCount, formatDate } from './utils'

export function ExplorePage() {
  const { posts, bookmarkedPosts, pushToast } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const [query, setQuery] = useState(params.get('search') ?? '')
  const [category, setCategory] = useState('All stories')
  const [sort, setSort] = useState('latest')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 180)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const nextQuery = new URLSearchParams(location.search).get('search') ?? ''
    setQuery(nextQuery)
    if (new URLSearchParams(location.search).get('focus') === 'search') {
      window.setTimeout(() => document.getElementById('story-search')?.focus(), 80)
    }
  }, [location.search])

  const published = posts.filter((post) => post.status === 'published')
  const filtered = useMemo(() => published.filter((post) => {
    const normalized = query.trim().toLowerCase()
    const searchableText = [
      post.title,
      post.subtitle,
      post.excerpt,
      post.category,
      post.author.name,
      post.author.role,
      post.author.bio,
      ...post.tags,
      ...post.content.map((block) => block.text),
      ...post.content.flatMap((block) => block.items ?? []),
    ].join(' ').toLowerCase()
    const matchesQuery = !normalized || searchableText.includes(normalized)
    return matchesQuery && (category === 'All stories' || post.category === category)
  }).sort((a, b) => {
    if (sort === 'likes') return b.likes - a.likes
    if (sort === 'bookmarks') return Number(bookmarkedPosts.includes(b.id)) - Number(bookmarkedPosts.includes(a.id))
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  }), [published, query, category, sort, bookmarkedPosts])

  const showFeatured = !query.trim() && category === 'All stories' && !sort.includes('likes') && sort !== 'bookmarks'
  const featured = showFeatured ? (published.find((post) => post.featured) ?? published[0]) : undefined
  const latest = showFeatured ? filtered.filter((post) => post.id !== featured?.id) : filtered

  return <main>
    <section className="explore-hero shell">
      <div className="hero-rule"><span>Vol. 01</span><span>Independent writing for curious builders</span><span>Est. 2024</span></div>
      <div className="hero-copy"><p className="eyebrow accent-eyebrow">A publication by the technical department</p><h1>Stories worth<br /><em>staying for.</em></h1><p className="hero-intro">Thoughtful essays on technology, design, and the work of becoming a better builder.</p><div className="hero-signature"><span className="hero-signature-dot" /> <span>Read slowly / think deeply</span></div></div>
      <div className="hero-art" aria-hidden="true"><motion.div className="hero-orbit orbit-one" animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }} /><motion.div className="hero-orbit orbit-two" animate={{ rotate: -360 }} transition={{ duration: 44, repeat: Infinity, ease: 'linear' }} /><motion.span className="hero-art-label label-top" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>FIELD<br />NOTES</motion.span><motion.span className="hero-art-label label-bottom" animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>THOUGHT<br />IN MOTION</motion.span><span className="hero-art-core">I</span></div>
      <div className="hero-aside"><span className="hero-aside-line" /><p>For the curious,<br />the generous,<br />the unfinished.</p><ArrowDownMarker /></div>
    </section>

    <EditorialTicker />

    {featured && <section className="featured-section shell"><div className="section-kicker"><span>Editor’s pick</span><span className="line" /></div><article className="featured-story">
      <Link to={`/post/${featured.id}`} className="featured-image-wrap"><img src={featured.coverImage} alt="" className="featured-image" /><span className="image-note">Read the lead story <ArrowRight size={15} /></span></Link>
      <div className="featured-copy"><CategoryLabel>{featured.category}</CategoryLabel><Link to={`/post/${featured.id}`}><h2>{featured.title}</h2></Link><p>{featured.subtitle}</p><PostMeta post={featured} /><div className="featured-footer"><LikeButton post={featured} /><BookmarkButton post={featured} /><Link className="text-link" to={`/post/${featured.id}`}>Continue reading <ArrowRight size={15} /></Link></div></div>
    </article></section>}

    <section className="latest-section shell" id="latest">
      <div className="latest-header"><SectionHeading eyebrow="The journal" title="Latest stories" action={<span className="story-count">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'}</span>} /><div className="filter-bar"><SearchField value={query} onChange={(value) => { setQuery(value); navigate(value ? `/?search=${encodeURIComponent(value)}` : '/', { replace: true }) }} onSubmit={() => navigate(query ? `/?search=${encodeURIComponent(query)}` : '/', { replace: true })} /><SortSelect value={sort} onChange={setSort} /></div></div>
      <div className="category-scroll" role="group" aria-label="Filter by category">{['All stories', ...categories].map((item) => <button key={item} className={category === item ? 'category-pill active' : 'category-pill'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {isLoading ? <LoadingState /> : filtered.length ? <div className="latest-grid">{latest.map((post, index) => <PostCard key={post.id} post={post} variant={index === 0 ? 'horizontal' : index === 3 ? 'compact' : 'standard'} index={index} />)}</div> : <EmptyState title="No stories found" body="Try a different phrase or clear the category filter." action={<Button variant="outline" onClick={() => { setQuery(''); setCategory('All stories'); navigate('/') }}>Reset filters</Button>} />}
    </section>
    <section className="newsletter-strip shell"><div><p className="eyebrow">The Sunday edit</p><h2>A small letter for your reading list.</h2></div><div className="newsletter-action"><p>One thoughtful dispatch every other Sunday. No noise.</p><Button variant="dark" onClick={() => pushToast('You’re on the list — welcome to INKFRAME.')}>Join the list <ArrowRight size={16} /></Button></div></section>
  </main>
}

function ArrowDownMarker() { return <span className="arrow-down-marker">↓</span> }

function EditorialTicker() {
  const words = ['Ideas', 'Experiments', 'Field notes', 'Open source', 'The long read', 'Ideas']
  return <div className="editorial-ticker" aria-label="INKFRAME topics"><div className="ticker-track">{words.map((word, index) => <span key={`${word}-${index}`}>{word}<b>✳</b></span>)}</div></div>
}

export function ArticlePage() {
  const { id } = useParams()
  const { posts, comments, addComment, pushToast } = useApp()
  const post = posts.find((item) => item.id === id)
  const [comment, setComment] = useState('')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    window.scrollTo(0, 0)
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [id])

  if (!post) return <NotFoundPage />
  const postComments = comments.filter((item) => item.postId === post.id)
  const related = posts.filter((item) => item.status === 'published' && item.id !== post.id && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3)

  const submitComment = (event: FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) return
    addComment(post.id, comment.trim())
    setComment('')
  }

  const content = post.content
  return <main className="article-page">
    <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
    <section className="article-header shell reading-column">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to explore</Link>
      <div className="article-kicker"><CategoryLabel>{post.category}</CategoryLabel><span>{post.status === 'draft' ? 'Preview' : 'Field note'}</span></div>
      <h1>{post.title}</h1><p className="article-subtitle">{post.subtitle}</p><PostMeta post={post} />
      <div className="article-byline"><img src={post.author.avatar} alt={`${post.author.name}'s avatar`} /><div><strong>{post.author.name}</strong><span>{post.author.role}</span></div></div>
    </section>
    <figure className="article-cover shell"><img src={post.coverImage} alt="" /><figcaption><span>INKFRAME / {post.category.toUpperCase()}</span><span>{post.readingTime} minute read</span></figcaption></figure>
    <div className="article-layout shell"><div className="article-main">
      <ArticleActions post={post} />
      <article className="rich-article">{content.map((block, index) => <ContentBlockView key={`${block.type}-${index}`} block={block} />)}</article>
      <div className="article-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <AuthorBlock post={post} />
      <section className="comments-section" aria-labelledby="comments-heading"><div className="comments-heading"><div><p className="eyebrow">Join the conversation</p><h2 id="comments-heading">Comments <span>{postComments.length}</span></h2></div><MessageCircle size={22} /></div>
        <form className="comment-form" onSubmit={submitComment}><label htmlFor="comment">What stayed with you?</label><div className="comment-input-row"><textarea id="comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a thoughtful note..." /><Button type="submit" variant="dark" disabled={!comment.trim()}>Post comment</Button></div></form>
        <div className="comments-list">{postComments.length ? postComments.map((item) => <div className="comment" key={item.id}><img src={item.avatar} alt="" /><div><div className="comment-meta"><strong>{item.author}</strong><span>{item.date}</span></div><p>{item.body}</p></div></div>) : <p className="no-comments">Be the first to leave a note on this story.</p>}</div>
      </section>
    </div><aside className="article-aside"><div className="aside-sticky"><p className="eyebrow">Keep reading</p><p className="aside-note">You’re {progress}% through this story.</p><div className="aside-rule" /><p>Published<br /><strong>{formatDate(post.date)}</strong></p><p>Words worth<br /><strong>{post.readingTime} minutes</strong></p><button className="aside-share" onClick={() => { navigator.clipboard?.writeText(window.location.href); pushToast('Link copied to your clipboard.', 'info') }}>Share this story <ArrowUpRightIcon /></button></div></aside></div>
    {related.length > 0 && <section className="related-section shell"><SectionHeading eyebrow="More from the journal" title="You might also like" /><div className="related-grid">{related.map((item, index) => <PostCard key={item.id} post={item} variant="compact" index={index} />)}</div></section>}
    <BackToTop />
  </main>
}

function ArrowUpRightIcon() { return <ArrowRight size={15} /> }

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === 'heading') return <h2>{block.text}</h2>
  if (block.type === 'quote') return <blockquote>“{block.text}”</blockquote>
  if (block.type === 'list') return <><p>{block.text}</p><ul>{block.items?.map((item) => <li key={item}>{item}</li>)}</ul></>
  return <p>{block.text}</p>
}

export function BookmarksPage() {
  const { posts, bookmarkedPosts } = useApp()
  const saved = bookmarkedPosts.map((id) => posts.find((post) => post.id === id)).filter((post): post is Post => post?.status === 'published')
  return <main className="shell collection-page"><div className="collection-intro"><p className="eyebrow">Your personal shelf</p><h1>Reading list</h1><p>Stories you saved for a slower moment.</p></div>{saved.length ? <div className="collection-grid">{saved.map((post, index) => <PostCard key={post.id} post={post} variant={index % 3 === 0 ? 'horizontal' : 'standard'} index={index} />)}</div> : <EmptyState title="Your reading list is quiet" body="Save a story from Explore and it will be waiting here when you have time for it." action={<Link to="/" className="button button-dark">Find something to read <ArrowRight size={16} /></Link>} />}</main>
}

export function MyPostsPage() {
  const { posts, deletePost } = useApp()
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const myPosts = posts.filter((post) => post.author.name === 'Alex Morgan')
  const published = myPosts.filter((post) => post.status === 'published')
  const drafts = myPosts.filter((post) => post.status === 'draft')
  const likes = myPosts.reduce((sum, post) => sum + post.likes, 0)
  const confirmPost = myPosts.find((post) => post.id === confirmId)
  return <main className="shell dashboard-page"><div className="dashboard-intro"><div><p className="eyebrow">Your workspace</p><h1>My posts</h1><p>A quiet corner for your ideas in progress.</p></div><Link to="/create" className="button button-dark"><Plus size={17} /> New story</Link></div>
    <div className="stat-grid"><Stat label="Total posts" value={myPosts.length} icon={<LayoutGrid size={18} />} /><Stat label="Published" value={published.length} icon={<Check size={18} />} /><Stat label="Drafts" value={drafts.length} icon={<PenIcon />} /><Stat label="Total likes" value={likes} icon={<Heart size={18} />} /></div>
    <div className="posts-table-heading"><SectionHeading eyebrow="The archive" title="Your stories" /><div className="table-filter"><ListFilter size={16} /> Recently updated</div></div>
    {myPosts.length ? <div className="posts-table" role="table"><div className="table-head" role="row"><span>Story</span><span>Status</span><span>Engagement</span><span>Actions</span></div>{myPosts.map((post) => <div className="table-row" role="row" key={post.id}><div className="table-story"><img src={post.coverImage} alt="" /><div><Link to={`/post/${post.id}`}><strong>{post.title}</strong></Link><span>{formatDate(post.date)} · {post.readingTime} min read</span></div></div><span className={post.status === 'published' ? 'status status-published' : 'status status-draft'}>{post.status === 'published' ? 'Published' : 'Draft'}</span><span className="table-engagement"><Heart size={14} /> {post.likes}</span><div className="table-actions"><Link to={`/edit/${post.id}`} className="table-action">Edit</Link><Link to={`/post/${post.id}`} className="table-action">Preview</Link><button className="table-action danger" onClick={() => setConfirmId(post.id)}>Delete</button></div></div>)}</div> : <EmptyState title="Your desk is clear" body="Start a story and give your ideas a place to take shape." action={<Link to="/create" className="button button-dark">Write your first story <ArrowRight size={16} /></Link>} />}
    {confirmPost && <ConfirmDialog title={`Delete “${confirmPost.title}”?`} body="This removes the story and its comments from your local workspace. You cannot undo this action." onCancel={() => setConfirmId(null)} onConfirm={() => { deletePost(confirmPost.id); setConfirmId(null); navigate('/my-posts') }} />}
  </main>
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <div className="stat"><span className="stat-icon">{icon}</span><strong>{formatCount(value)}</strong><span>{label}</span></div> }
function PenIcon() { return <Sparkles size={18} /> }

const blankPost: Post = {
  id: '', title: '', subtitle: '', excerpt: '', coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85', category: 'Engineering', tags: [], author: { name: 'Alex Morgan', role: 'Technical department contributor', avatar: 'https://i.pravatar.cc/160?img=49', bio: 'Alex is a student builder exploring the edges between technology and everyday life.' }, date: new Date().toISOString().slice(0, 10), readingTime: 5, likes: 0, status: 'draft', content: [],
}

type FormState = Omit<Post, 'tags' | 'content' | 'status'> & { tags: string; content: string; status: PostStatus }

export function PostEditorPage({ editing = false }: { editing?: boolean }) {
  const { id } = useParams()
  const { posts, savePost } = useApp()
  const navigate = useNavigate()
  const existing = editing ? posts.find((post) => post.id === id) : undefined
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(() => fromPost(existing ?? blankPost))

  useEffect(() => {
    if (editing && !existing) navigate('/404', { replace: true })
  }, [editing, existing, navigate])

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const contentBlocks = form.content.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean).map((text): ContentBlock => ({ type: 'paragraph', text }))
  const formPost: Post = { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), content: contentBlocks, id: existing?.id ?? (slugify(form.title) || `story-${Date.now()}`) }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.subtitle.trim() || !form.content.trim()) { setError('Add a title, subtitle, and some content before saving.'); return }
    setError('')
    savePost(formPost)
    navigate('/my-posts')
  }

  return <main className="shell editor-page"><div className="editor-topbar"><div><Link to="/my-posts" className="back-link"><ArrowLeft size={16} /> My posts</Link><p className="eyebrow">{editing ? 'Edit story' : 'New story'}</p><h1>{editing ? 'Shape the next draft.' : 'Make something worth reading.'}</h1></div><div className="editor-actions"><Button type="button" variant="quiet" onClick={() => setPreview((current) => !current)}><Eye size={16} /> {preview ? 'Edit story' : 'Preview'}</Button><Button type="button" variant="outline" onClick={() => { const draft = { ...formPost, status: 'draft' as const }; savePost(draft, 'Draft saved.'); navigate('/my-posts') }}>Save draft</Button><Button type="submit" form="post-editor" variant="dark"><Check size={16} /> {form.status === 'published' ? 'Publish story' : 'Save story'}</Button></div></div>
    {preview ? <EditorPreview post={formPost} /> : <form id="post-editor" className="editor-layout" onSubmit={submit} noValidate><div className="editor-main"><FormField label="Title" required><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="A title with a point of view" /></FormField><FormField label="Subtitle" required><input value={form.subtitle} onChange={(event) => update('subtitle', event.target.value)} placeholder="A clear, human sentence that earns the click" /></FormField><FormField label="Excerpt"><textarea rows={3} value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} placeholder="A short description for the story card" /></FormField><FormField label="Content" required helper="Separate paragraphs with a blank line. Keep the first sentence close to the reader."><textarea className="content-input" rows={18} value={form.content} onChange={(event) => update('content', event.target.value)} placeholder="Start with the thing you noticed..." /></FormField></div><aside className="editor-sidebar"><div className="editor-panel"><FormField label="Cover image URL"><input value={form.coverImage} onChange={(event) => update('coverImage', event.target.value)} placeholder="https://images.unsplash.com/..." /></FormField><div className="cover-preview"><img src={form.coverImage} alt="Cover preview" /></div></div><div className="editor-panel"><FormField label="Category"><select value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Tags" helper="Separate tags with commas"><input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="AI, Design, Students" /></FormField><FormField label="Status"><div className="status-switch" role="group" aria-label="Post status"><button type="button" className={form.status === 'draft' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'draft' }))}>Draft</button><button type="button" className={form.status === 'published' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'published' }))}>Published</button></div></FormField></div>{error && <p className="form-error" role="alert">{error}</p>}</aside></form>}
  </main>
}

function FormField({ id, label, required, helper, children }: { id?: string; label: string; required?: boolean; helper?: string; children: React.ReactNode }) {
  const generatedId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const control = isValidElement(children) ? cloneElement(children as React.ReactElement<{ id?: string }>, { id: (children.props as { id?: string }).id ?? generatedId }) : children
  return <div className="form-field"><label htmlFor={generatedId}>{label}{required && <span aria-hidden="true"> *</span>}</label>{control}{helper && <small>{helper}</small>}</div>
}
function fromPost(post: Post): FormState { return { ...post, tags: post.tags.join(', '), content: post.content.map((block) => block.text).join('\n\n') } }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function EditorPreview({ post }: { post: Post }) { return <div className="editor-preview"><div className="preview-label"><Eye size={15} /> Reader preview</div><section className="article-header reading-column"><div className="article-kicker"><CategoryLabel>{post.category}</CategoryLabel><span>Preview</span></div><h1>{post.title || 'Your title will appear here'}</h1><p className="article-subtitle">{post.subtitle || 'Your subtitle will appear here'}</p><PostMeta post={post} /></section><figure className="article-cover"><img src={post.coverImage} alt="" /></figure><article className="rich-article reading-column">{post.content.length ? post.content.map((block, index) => <ContentBlockView block={block} key={index} />) : <p className="placeholder-copy">Your story will begin here.</p>}</article></div> }

export function NotFoundPage() { return <main className="not-found shell"><p className="eyebrow">404 / Off the page</p><h1>This page took<br /><em>a wrong turn.</em></h1><p>The story you’re looking for may have moved, or it may still be in someone’s drafts.</p><Link to="/" className="button button-dark">Back to Explore <ArrowRight size={16} /></Link></main> }

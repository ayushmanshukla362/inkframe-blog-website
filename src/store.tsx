import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { seedComments, seedPosts } from './data'
import type { Comment, Post, Theme } from './types'
import { readStorage, writeStorage } from './utils'

type ToastTone = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; tone: ToastTone }

type AppContextValue = {
  posts: Post[]
  comments: Comment[]
  theme: Theme
  likedPosts: string[]
  bookmarkedPosts: string[]
  toasts: Toast[]
  toggleTheme: () => void
  toggleLike: (postId: string) => void
  toggleBookmark: (postId: string) => void
  savePost: (post: Post, message?: string) => void
  deletePost: (postId: string) => void
  addComment: (postId: string, body: string) => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => readStorage('inkframe-posts', seedPosts))
  const [comments, setComments] = useState<Comment[]>(() => readStorage('inkframe-comments', seedComments))
  const [theme, setTheme] = useState<Theme>(() => readStorage<Theme>('inkframe-theme', 'light'))
  const [likedPosts, setLikedPosts] = useState<string[]>(() => readStorage('inkframe-liked', []))
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>(() => readStorage('inkframe-bookmarked', []))
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => writeStorage('inkframe-posts', posts), [posts])
  useEffect(() => writeStorage('inkframe-comments', comments), [comments])
  useEffect(() => writeStorage('inkframe-theme', theme), [theme])
  useEffect(() => writeStorage('inkframe-liked', likedPosts), [likedPosts])
  useEffect(() => writeStorage('inkframe-bookmarked', bookmarkedPosts), [bookmarkedPosts])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const pushToast = (message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200)
  }

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))

  const toggleLike = (postId: string) => {
    const isLiked = likedPosts.includes(postId)
    setLikedPosts((current) => isLiked ? current.filter((id) => id !== postId) : [...current, postId])
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, likes: Math.max(0, post.likes + (isLiked ? -1 : 1)) } : post))
  }

  const toggleBookmark = (postId: string) => {
    const isBookmarked = bookmarkedPosts.includes(postId)
    setBookmarkedPosts((current) => isBookmarked ? current.filter((id) => id !== postId) : [...current, postId])
    pushToast(isBookmarked ? 'Removed from your reading list.' : 'Saved to your reading list.', 'info')
  }

  const savePost = (post: Post, message = post.status === 'published' ? 'Your story is live.' : 'Draft saved to My Posts.') => {
    setPosts((current) => current.some((item) => item.id === post.id) ? current.map((item) => item.id === post.id ? post : item) : [post, ...current])
    pushToast(message)
  }

  const deletePost = (postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId))
    setComments((current) => current.filter((comment) => comment.postId !== postId))
    setLikedPosts((current) => current.filter((id) => id !== postId))
    setBookmarkedPosts((current) => current.filter((id) => id !== postId))
    pushToast('Story deleted.', 'info')
  }

  const addComment = (postId: string, body: string) => {
    setComments((current) => [...current, {
      id: `comment-${Date.now()}`,
      postId,
      author: 'Alex Morgan',
      avatar: 'https://i.pravatar.cc/80?img=49',
      body,
      date: 'Just now',
    }])
    pushToast('Comment added.')
  }

  const value = useMemo(() => ({ posts, comments, theme, likedPosts, bookmarkedPosts, toasts, toggleTheme, toggleLike, toggleBookmark, savePost, deletePost, addComment, pushToast, dismissToast: (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)) }), [posts, comments, theme, likedPosts, bookmarkedPosts, toasts])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}

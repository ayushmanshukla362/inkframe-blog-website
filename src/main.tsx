import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Header, PageTransition, Toasts } from './components'
import { ArticlePage, BookmarksPage, ExplorePage, MyPostsPage, NotFoundPage, PostEditorPage } from './pages'
import { AppProvider } from './store'
import './index.css'

function App() {
  return <AppProvider><BrowserRouter><Header /><PageTransition><Routes>
    <Route path="/" element={<ExplorePage />} />
    <Route path="/post/:id" element={<ArticlePage />} />
    <Route path="/bookmarks" element={<BookmarksPage />} />
    <Route path="/my-posts" element={<MyPostsPage />} />
    <Route path="/create" element={<PostEditorPage />} />
    <Route path="/edit/:id" element={<PostEditorPage editing />} />
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes></PageTransition><Toasts /></BrowserRouter></AppProvider>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

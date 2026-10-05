export type PostStatus = 'published' | 'draft'

export type ContentBlock = {
  type: 'paragraph' | 'heading' | 'quote' | 'list'
  text: string
  items?: string[]
}

export type Author = {
  name: string
  role: string
  avatar: string
  bio: string
}

export type Post = {
  id: string
  title: string
  subtitle: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  author: Author
  date: string
  readingTime: number
  likes: number
  status: PostStatus
  content: ContentBlock[]
  featured?: boolean
}

export type Comment = {
  id: string
  postId: string
  author: string
  avatar: string
  body: string
  date: string
}

export type Theme = 'light' | 'dark'

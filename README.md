# INKFRAME

INKFRAME is an editorial-style blog for thoughtful stories about technology, design, and building. Browse a curated journal, discover stories by search or category, and keep a personal reading list.

## Features

- Browse featured and latest stories
- Search stories by title, author, tags, and article content
- Filter stories by category and sort by date, likes, or bookmarks
- Read articles and join the discussion with comments
- Like and bookmark stories
- Create, edit, publish, and save draft posts
- Switch between light and dark themes
- Save app data in browser local storage

> This project is a frontend demo. Posts, comments, preferences, and reading-list data are stored in the current browser; there is no server-side database or account system.

## Tech stack

- React 18 and TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Framer Motion
- Lucide icons

## Getting started

Install [Node.js](https://nodejs.org/) and npm, then run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite to view the app.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Run TypeScript project checks and build the production app |
| `npm run preview` | Preview the production build locally |

The build invokes the TypeScript and Vite package files through Node, avoiding platform-dependent `.bin` executable wrappers.

## Deploying to Vercel

Import the repository into Vercel and use the Vite defaults:

- **Build command:** `npm run build`
- **Output directory:** `dist`

Vercel installs dependencies from `package-lock.json`. The generated `node_modules/` directory is excluded from Git.

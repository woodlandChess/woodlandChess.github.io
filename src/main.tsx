import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import { App } from './App'
import { preloadPieceImages } from './pieces'

// iOS "Add to Home Screen" apps expose navigator.standalone (display-mode is the fallback).
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('is-standalone')

// Decode the piece artwork up front so a moved piece never paints blank for a frame (iOS decodes lazily).
preloadPieceImages()

// Ask the browser not to clear this site's saved data when storage runs low. It does not survive deleting an installed
// app (see backup.ts for that), but it protects against the browser's own clean-ups.
try { void navigator.storage?.persist?.() } catch { /* not supported */ }

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

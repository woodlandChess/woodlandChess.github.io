import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import { App } from './App'
import { preloadPieceImages } from './pieces'

// iOS "Add to Home Screen" apps expose navigator.standalone (display-mode is the fallback).
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('is-standalone')

// Decode the piece artwork up front so a moved piece never paints blank for a frame (iOS decodes lazily).
preloadPieceImages()

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

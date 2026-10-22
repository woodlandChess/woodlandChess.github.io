import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'

// iOS "Add to Home Screen" apps expose navigator.standalone (display-mode is the fallback).
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('is-standalone')

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

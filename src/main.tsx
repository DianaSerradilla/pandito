import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { Preloader } from './components/preloader/Preloader'
import { protectImages } from './lib/protectImages'
import { router } from './router'

protectImages()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preloader />
    <RouterProvider router={router} />
  </StrictMode>,
)

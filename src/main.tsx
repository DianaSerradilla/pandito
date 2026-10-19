import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { Preloader } from './components/preloader/Preloader'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preloader />
    <RouterProvider router={router} />
  </StrictMode>,
)

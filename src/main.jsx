/**
 * NAMA FILE: main.jsx
 * FUNGSI UTAMA: Entry point utama aplikasi React.
 * 
 * DETAIL:
 * - Melakukan render komponen App ke dalam DOM.
 * - Menginisialisasi konfigurasi dasar React (seperti StrictMode dan BrowserRouter).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

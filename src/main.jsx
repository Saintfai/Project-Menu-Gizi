/**
 * Titik Masuk Utama Aplikasi (Application Entry Point)
 * Melakukan inisialisasi React DOM ke elemen root HTML,
 * membungkus aplikasi dengan BrowserRouter untuk routing client-side,
 * serta mengaktifkan React StrictMode untuk deteksi potensi masalah siklus hidup komponen.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Inisialisasi dan render pohon komponen React ke DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

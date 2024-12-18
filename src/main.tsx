import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
       <App />
    </PrimeReactProvider>
  </React.StrictMode>
)

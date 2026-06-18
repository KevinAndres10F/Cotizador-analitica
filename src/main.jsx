import React from 'react'
import ReactDOM from 'react-dom/client'
import FormularioPublico from './components/FormularioPublico'
import './index.css'

// Este repositorio contiene ÚNICAMENTE el formulario público de captación
// de leads. El cotizador interno vive en un repositorio aparte
// (Leads-Cotizador-Nomina), conectado a la misma base de datos Supabase.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FormularioPublico />
  </React.StrictMode>,
)

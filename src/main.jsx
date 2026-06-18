import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Code-splitting: cada superficie carga en su propio chunk.
// Así el motor de precios/complejidad (cotizador) NO viaja en el bundle
// que descarga el visitante del formulario público.
const CotizadorAnaliticaNomina = React.lazy(() => import('./CotizadorAnaliticaNomina'))
const FormularioPublico = React.lazy(() => import('./components/FormularioPublico'))

// Enrutado simple: el formulario público vive en su propia "ruta",
// separado de la herramienta interna (cotizador).
// Acepta hash (#formulario) y rutas amigables (/diagnostico-cliente, /contacto).
function esFormularioPublico() {
  const hash = window.location.hash.replace(/^#\/?/, "")
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
  const rutas = ["formulario", "diagnostico-cliente", "contacto"]
  return rutas.includes(hash) || rutas.includes(path)
}

function App() {
  const [isForm, setIsForm] = React.useState(esFormularioPublico())

  React.useEffect(() => {
    const onNav = () => setIsForm(esFormularioPublico())
    window.addEventListener("hashchange", onNav)
    window.addEventListener("popstate", onNav)
    return () => {
      window.removeEventListener("hashchange", onNav)
      window.removeEventListener("popstate", onNav)
    }
  }, [])

  return (
    <Suspense fallback={null}>
      {isForm ? <FormularioPublico /> : <CotizadorAnaliticaNomina />}
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

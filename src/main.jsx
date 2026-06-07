import React from 'react'
import ReactDOM from 'react-dom/client'
import CotizadorAnaliticaNomina from './CotizadorAnaliticaNomina'
import FormularioPublico from './components/FormularioPublico'
import './index.css'

function App() {
  const [isForm, setIsForm] = React.useState(window.location.hash === "#formulario");

  React.useEffect(() => {
    const onHash = () => setIsForm(window.location.hash === "#formulario");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return isForm ? <FormularioPublico /> : <CotizadorAnaliticaNomina />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

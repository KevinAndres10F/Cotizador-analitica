# Migración a dos repositorios

Objetivo: separar físicamente el **formulario público** del **cotizador interno**.

- **`cotizador-analitica`** (este repo) → solo el formulario público.
- **`Leads-Cotizador-Nomina`** (nuevo) → cotizador interno + pestaña Leads.
- Ambos usan el **mismo proyecto Supabase** (misma tabla `leads`).

> ⚠️ Hazlo en este orden para no quedarte sin el cotizador interno en ningún momento.

---

## Paso 1 — Crear el repo interno con TODO el código actual

La rama `main` de este repo todavía tiene el cotizador completo. Duplícala:

**Opción A — GitHub UI (más fácil):**
1. https://github.com/new → arriba, **"Import a repository"**.
2. *The URL for your source repository:* `https://github.com/KevinAndres10F/Cotizador-analitica`
3. *Repository name:* `Leads-Cotizador-Nomina` · privado · **Begin import**.

**Opción B — terminal:**
```bash
git clone --bare https://github.com/KevinAndres10F/Cotizador-analitica.git
# crea primero el repo vacío Leads-Cotizador-Nomina en GitHub, luego:
cd Cotizador-analitica.git
git push --mirror https://github.com/KevinAndres10F/Leads-Cotizador-Nomina.git
```

Ahora `Leads-Cotizador-Nomina` tiene el formulario **y** el cotizador.

## Paso 2 — Dejar el repo interno como "solo cotizador"

En `Leads-Cotizador-Nomina`:

1. Borra el archivo `src/components/FormularioPublico.jsx`.
2. Reemplaza `src/main.jsx` por:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import CotizadorAnaliticaNomina from './CotizadorAnaliticaNomina'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CotizadorAnaliticaNomina />
  </React.StrictMode>,
)
```

3. (Recomendado) Protege TODO el cotizador con login. La pestaña Leads ya usa
   Supabase Auth; para exigir login en toda la app, envuelve el render en un
   gate de sesión (puedes reutilizar la lógica de `LeadsTab` → `supabase.auth`).
   Alternativa más simple: protección por contraseña a nivel de Netlify (Paso 3).

## Paso 3 — Sitio Netlify para el repo interno (protegido)

1. Netlify → **Add new site → Import an existing project** → elige
   `Leads-Cotizador-Nomina`.
2. Build command `npm run build`, publish `dist`.
3. **Environment variables** (las MISMAS que el formulario):
   - `VITE_SUPABASE_URL = https://iydijflzleiiwcofhddy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY = <anon key del proyecto>`
4. **Protégelo** (elige uno):
   - **Contraseña Netlify:** Site configuration → Access & security → Visitor
     access → *Password protection*. (Simple; protege todo el sitio.)
   - **Login Supabase Auth:** el gate del Paso 2.3 (sin costo de plan).

## Paso 4 — Dejar ESTE repo como "solo formulario"

Ya está preparado en la rama `claude/formulario-publico-solo`. Cuando tu sitio
interno esté arriba, avísame y la **fusiono a `main`**; entonces el sitio
`cotizador-analitica-kapi.netlify.app` quedará sirviendo únicamente el formulario.

## Verificación final

- `cotizador-analitica-kapi.netlify.app/` → formulario (sin nada interno en el bundle).
- Sitio interno → pide login/contraseña; muestra el cotizador y los leads.
- Un lead enviado en el formulario aparece en la pestaña Leads del sitio interno
  (misma base de datos).

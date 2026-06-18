# KAPI · Formulario público — Analítica de Nómina

Este repositorio contiene **únicamente el formulario público de captación de leads**
(React + Vite). Es lo que ven los clientes: corto, amigable y **sin precios,
complejidad ni puntajes**.

El **cotizador interno** (diagnóstico con puntajes, tarifas, split y cotización)
vive en un repositorio aparte — `Leads-Cotizador-Nomina` — conectado a la
**misma base de datos Supabase**.

| Repositorio | Contenido | URL típica |
|---|---|---|
| **este** (`cotizador-analitica`) | Formulario público | `https://cotizador-analitica-kapi.netlify.app/` |
| `Leads-Cotizador-Nomina` | Cotizador interno + pestaña Leads (con login) | sitio Netlify aparte, protegido |

Ambos escriben/leen la tabla `leads` del mismo proyecto Supabase.

---

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

En Netlify: **Site settings > Environment variables**. La anon key es pública por
diseño; la seguridad la da RLS (el formulario **solo puede INSERTAR** leads).

## Base de datos

El esquema de la tabla `leads` + las políticas RLS están en
[`docs/supabase-leads.sql`](docs/supabase-leads.sql). Es el mismo proyecto que usa
el cotizador interno.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173  → muestra el formulario
npm run build    # genera dist/
```

## Despliegue (Netlify)

- Build command `npm run build`, publish `dist` (ver `netlify.toml`).
- Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- El formulario se sirve en la **raíz** (`/`).

---

## Cómo se creó el repo interno (`Leads-Cotizador-Nomina`)

1. Se duplicó este repo (cuando aún tenía el cotizador completo) en
   `Leads-Cotizador-Nomina`.
2. En ese repo se quitó el formulario público y se dejó solo el cotizador.
3. Se conectó a un sitio Netlify aparte, **protegido** (contraseña de Netlify o
   login Supabase Auth), con las mismas variables de entorno.

Ver `docs/migracion-dos-repos.md` para el detalle.

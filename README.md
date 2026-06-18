# KAPI · Cotizador — Analítica de Nómina

Aplicación React + Vite con **dos experiencias separadas**:

| Superficie | Ruta | Para quién | Qué muestra |
|---|---|---|---|
| **Cotizador interno** | `/` (raíz) | Proveedores (KAPI / Manpower) | Diagnóstico con puntajes, complejidad, tarifas, split y cotización. Pestaña **Leads**. |
| **Formulario público** | `/#formulario` · `/diagnostico-cliente` · `/contacto` | Clientes | Formulario corto y amigable. **No** muestra precios, complejidad ni puntajes. |

El formulario público guarda los datos en la tabla `leads` de Supabase. La pestaña interna
**Leads** los lee (requiere iniciar sesión).

---

## 1. Requisitos

- Node 18+
- Una cuenta/proyecto de [Supabase](https://supabase.com)

## 2. Variables de entorno

Crea un archivo `.env` en la raíz (puedes copiar `.env.example`):

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Los valores están en **Supabase > Project Settings > API** (`Project URL` y `anon public`).
La anon key es pública por diseño (viaja en el bundle); la seguridad la da RLS.

> ⚠️ `.env` está en `.gitignore` y **no** se sube al repositorio. Nunca pongas claves
> reales en el código fuente.

## 3. Base de datos (Supabase)

Ejecuta el script [`docs/supabase-leads.sql`](docs/supabase-leads.sql) en
**Supabase > SQL Editor**. Crea:

- La tabla `leads` con **RLS**:
  - `INSERT` permitido al público (anon) → el formulario puede guardar.
  - `SELECT / UPDATE / DELETE` solo para usuarios **autenticados** → el público no puede leer.
- La tabla interna `cot_cotizaciones` (para el botón Guardar/Cargar del cotizador).

## 4. Usuario interno para ver los leads

La pestaña **Leads** usa Supabase Auth. Crea un usuario:

**Supabase > Authentication > Users > Add user** → email + contraseña
(marca *Auto Confirm User*).

Ese correo/contraseña es el que usan los proveedores para entrar a la pestaña Leads.

## 5. Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

- Cotizador interno: `http://localhost:5173/`
- Formulario público: `http://localhost:5173/#formulario`

## 6. Despliegue en Netlify

1. Conecta el repo. Build command `npm run build`, publish `dist` (ya están en `netlify.toml`).
2. En **Site settings > Environment variables** agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Vuelve a desplegar (*Trigger deploy*) para que tome las variables.

> Si no defines las variables, el formulario no podrá conectarse a Supabase
> (verás un error en consola). Configúralas antes del primer deploy productivo.

---

## Notas de seguridad

- El formulario público **solo inserta** leads; no puede leerlos (RLS).
- Ninguna lógica de precios/complejidad/puntajes vive en el frontend público.
- Para ver/editar leads hay que iniciar sesión (rol `authenticated`).

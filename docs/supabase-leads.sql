-- ============================================================================
-- KAPI · Cotizador — Analítica de Nómina
-- Esquema de Supabase para el formulario público de leads.
-- Pega este archivo en:  Supabase > SQL Editor > New query > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabla `leads`  (la llena el formulario PÚBLICO)
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text,
  empresa       text,
  correo        text,
  telefono      text,
  sector        text,
  num_empresas  text,
  num_empleados text,
  formato_datos text,
  frecuencia    text,
  objetivos     text,
  notas         text,
  estado        text not null default 'nuevo'
                  check (estado in ('nuevo','contactado','cotizado','descartado'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_estado_idx     on public.leads (estado);

-- ----------------------------------------------------------------------------
-- 2) Row Level Security (RLS) para `leads`
--    Público (anon): SOLO puede INSERTAR.
--    Proveedores (authenticated): pueden LEER / ACTUALIZAR / BORRAR.
-- ----------------------------------------------------------------------------
alter table public.leads enable row level security;

-- INSERT: permitido al público (anon) y a usuarios autenticados.
drop policy if exists "leads_insert_publico" on public.leads;
create policy "leads_insert_publico"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- SELECT: solo usuarios autenticados (NO el público).
drop policy if exists "leads_select_auth" on public.leads;
create policy "leads_select_auth"
  on public.leads
  for select
  to authenticated
  using (true);

-- UPDATE: solo usuarios autenticados.
drop policy if exists "leads_update_auth" on public.leads;
create policy "leads_update_auth"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- DELETE: solo usuarios autenticados.
drop policy if exists "leads_delete_auth" on public.leads;
create policy "leads_delete_auth"
  on public.leads
  for delete
  to authenticated
  using (true);

-- NOTA: como NO existe policy de SELECT para anon, el público NO puede leer
-- los leads (RLS deniega por defecto). El formulario público solo inserta.

-- Defensa en profundidad: además de RLS, quitamos a `anon` los privilegios
-- de tabla y le dejamos SOLO INSERT (el público nunca podrá leer/editar).
revoke all on table public.leads from anon;
grant insert on table public.leads to anon;

-- ----------------------------------------------------------------------------
-- 3) (Opcional, interno) Tabla `cot_cotizaciones`
--    Da soporte al botón "Guardar / Cargar" del cotizador interno.
--    Si tu app no usa esa función, puedes omitir esta sección.
-- ----------------------------------------------------------------------------
create table if not exists public.cot_cotizaciones (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique,
  cliente       jsonb,
  entidades     jsonb,
  configuracion jsonb,
  diagnostico   jsonb,
  resultado     jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.cot_cotizaciones enable row level security;

-- El cotizador interno hoy no tiene login global, así que se mantiene el
-- comportamiento actual (acceso con anon key). Si más adelante pones el
-- cotizador completo detrás de login, cambia `anon, authenticated` por
-- solo `authenticated`.
drop policy if exists "cotizaciones_all" on public.cot_cotizaciones;
create policy "cotizaciones_all"
  on public.cot_cotizaciones
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ============================================================================
-- 4) Crear el usuario interno (proveedores) para ver los leads
--    No se hace por SQL. Ve a:
--      Supabase > Authentication > Users > Add user
--      (Email + Password; marca "Auto Confirm User")
--    Ese correo/contraseña es el que se usa en la pestaña interna "Leads".
-- ============================================================================

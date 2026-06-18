import { createClient } from "@supabase/supabase-js";

// Las credenciales viven en variables de entorno (NUNCA hardcodeadas).
//   - Local:   archivo .env  (ver .env.example)
//   - Netlify: Site settings > Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!supabaseConfigured) {
  console.error(
    "[Supabase] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
    "Configúralas en .env (local) y en Netlify (Site settings > Environment variables)."
  );
}

// Fallback a placeholders solo para evitar que la app se caiga al importar
// cuando faltan las env vars; cualquier operación real fallará con un mensaje claro.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key"
);

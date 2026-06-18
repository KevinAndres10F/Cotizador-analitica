import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Lectura/edición de leads para la pestaña interna.
// Requiere sesión autenticada (RLS de la tabla `leads` solo permite
// SELECT/UPDATE/DELETE al rol authenticated; el público solo INSERTA).
export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) setError(err.message);
    else setLeads(data || []);
    setLoading(false);
  }, []);

  const updateLeadEstado = useCallback(async (id, estado) => {
    const { error: err } = await supabase
      .from("leads")
      .update({ estado })
      .eq("id", id);
    if (err) { setError(err.message); return; }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado } : l)));
  }, []);

  const deleteLead = useCallback(async (id) => {
    const { error: err } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);
    if (err) { setError(err.message); return; }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { leads, loading, error, loadLeads, updateLeadEstado, deleteLead };
}

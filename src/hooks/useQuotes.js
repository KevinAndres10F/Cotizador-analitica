import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

export function useQuotes() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState(null);

  const saveQuote = useCallback(async ({ ref, cliente, entidades, cfg, resp, resultado }) => {
    setSaving(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cot_cotizaciones")
        .upsert({
          ref,
          cliente,
          entidades,
          configuracion: cfg,
          diagnostico: resp,
          resultado,
          updated_at: new Date().toISOString(),
        }, { onConflict: "ref" })
        .select()
        .single();
      if (err) throw err;
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cot_cotizaciones")
        .select("id, ref, cliente, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (err) throw err;
      setQuotes(data || []);
      return data;
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuote = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("cot_cotizaciones")
        .select("*")
        .eq("id", id)
        .single();
      if (err) throw err;
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveQuote, loadQuotes, loadQuote, quotes, saving, loading, error };
}

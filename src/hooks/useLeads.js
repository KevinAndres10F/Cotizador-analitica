import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("cot_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (err) setError(err.message);
    else setLeads(data || []);
    setLoading(false);
  }, []);

  const updateLeadStatus = useCallback(async (id, status) => {
    const { error: err } = await supabase
      .from("cot_leads")
      .update({ status })
      .eq("id", id);
    if (err) { setError(err.message); return; }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }, []);

  const deleteLead = useCallback(async (id) => {
    const { error: err } = await supabase
      .from("cot_leads")
      .delete()
      .eq("id", id);
    if (err) { setError(err.message); return; }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { leads, loading, error, loadLeads, updateLeadStatus, deleteLead };
}

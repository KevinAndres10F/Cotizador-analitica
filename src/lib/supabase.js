import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zouznrwrirsisdqipcfb.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdXpucndyaXJzaXNkcWlwY2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDQ2MTEsImV4cCI6MjA4MTU4MDYxMX0.0zjKGv24UCSm6cR37sFklHyEVScLKg8J0QT_EyL5xws";

export const supabase = createClient(supabaseUrl, supabaseKey);

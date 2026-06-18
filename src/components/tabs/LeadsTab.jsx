import React, { useEffect, useState, useCallback } from "react";
import {
  Users, RefreshCw, Trash2, Mail, Phone, Building2, Loader2, Copy, CheckCircle2,
  ChevronDown, ChevronUp, Lock, LogOut, LogIn,
} from "lucide-react";
import { C } from "../../config/colors";
import { Card } from "../ui";
import { useLeads } from "../../hooks/useLeads";
import { supabase, supabaseConfigured } from "../../lib/supabase";

const ESTADO_CFG = {
  nuevo: { label: "Nuevo", bg: "#dbeafe", color: "#1d4ed8" },
  contactado: { label: "Contactado", bg: "#fef3c7", color: "#92400e" },
  cotizado: { label: "Cotizado", bg: "#d1fae5", color: "#065f46" },
  descartado: { label: "Descartado", bg: "#fee2e2", color: "#991b1b" },
};

/* ─── login gate (Supabase Auth) ──────────────────────────────────── */

function LoginGate({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError("Correo o contraseña incorrectos."); return; }
    onSignedIn();
  };

  return (
    <div className="max-w-sm mx-auto">
      <Card pad="p-6">
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 rounded-full flex items-center justify-center" style={{ width: 48, height: 48, background: C.mint }}>
            <Lock size={22} color={C.teal} />
          </div>
          <h2 className="serif" style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>Acceso interno</h2>
          <p className="text-xs mt-1" style={{ color: C.sub }}>
            Inicia sesión para ver los leads recibidos.
          </p>
        </div>

        {!supabaseConfigured && (
          <div className="rounded-xl p-3 text-xs mb-4" style={{ background: "#fef2f2", color: "#dc2626" }}>
            Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@kapisg.com" autoComplete="username"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: `1px solid ${C.line}`, background: "#fff" }}
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña" autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: `1px solid ${C.line}`, background: "#fff" }}
          />
          {error && <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
            style={{ background: C.teal, color: "#fff", fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </Card>
    </div>
  );
}

/* ─── tarjeta de lead ─────────────────────────────────────────────── */

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span style={{ color: C.sub, minWidth: 130, fontWeight: 600 }}>{label}</span>
      <span style={{ color: C.ink }}>{value}</span>
    </div>
  );
}

function LeadCard({ lead, onEstado, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const st = ESTADO_CFG[lead.estado] || ESTADO_CFG.nuevo;

  return (
    <Card pad="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm" style={{ fontWeight: 700 }}>{lead.empresa || "(sin empresa)"}</span>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: st.bg, color: st.color, fontWeight: 600 }}>
              {st.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            {lead.nombre && (
              <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                <Users size={12} /> {lead.nombre}
              </span>
            )}
            {lead.correo && (
              <a href={`mailto:${lead.correo}`} className="flex items-center gap-1 text-xs" style={{ color: C.teal }}>
                <Mail size={12} /> {lead.correo}
              </a>
            )}
            {lead.telefono && (
              <a href={`https://wa.me/${lead.telefono.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                <Phone size={12} /> {lead.telefono}
              </a>
            )}
            {lead.sector && (
              <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                <Building2 size={12} /> {lead.sector}
              </span>
            )}
            <span className="text-xs mono" style={{ color: C.line }}>
              {new Date(lead.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select value={lead.estado || "nuevo"} onChange={(e) => onEstado(lead.id, e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
            {Object.entries(ESTADO_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => setExpanded((x) => !x)}
            className="p-1.5 rounded-lg transition hover:bg-gray-50" style={{ color: C.sub }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => { if (confirm("¿Eliminar este lead?")) onDelete(lead.id); }}
            className="p-1.5 rounded-lg transition hover:bg-red-50" style={{ color: "#dc2626" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.line}` }}>
          <DetailRow label="Empresas / razones sociales" value={lead.num_empresas} />
          <DetailRow label="Personas en nómina" value={lead.num_empleados} />
          <DetailRow label="Cómo entregan los datos" value={lead.formato_datos} />
          <DetailRow label="Frecuencia de actualización" value={lead.frecuencia} />
          {lead.objetivos && (
            <div className="mt-2">
              <div className="text-xs" style={{ color: C.sub, fontWeight: 600 }}>Qué quieren ver / medir</div>
              <div className="text-xs mt-0.5 rounded-lg px-3 py-2" style={{ background: C.paper, color: C.ink }}>{lead.objetivos}</div>
            </div>
          )}
          {lead.notas && (
            <div className="mt-2">
              <div className="text-xs" style={{ color: C.sub, fontWeight: 600 }}>Notas adicionales</div>
              <div className="text-xs mt-0.5 rounded-lg px-3 py-2" style={{ background: C.paper, color: C.ink }}>{lead.notas}</div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ─── pestaña Leads ───────────────────────────────────────────────── */

export default function LeadsTab() {
  const { leads, loading, error, loadLeads, updateLeadEstado, deleteLead } = useLeads();
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadLeads();
  }, [session, loadLeads]);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const formUrl = window.location.origin + window.location.pathname + "#formulario";
  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authReady) {
    return (
      <div className="text-center py-12">
        <Loader2 size={24} className="animate-spin mx-auto" style={{ color: C.sub }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <Card pad="p-4" style={{ background: C.mint, border: "none" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm" style={{ fontWeight: 600, color: C.teal }}>Link del formulario público</div>
              <div className="mono text-xs mt-1" style={{ color: C.sub, wordBreak: "break-all" }}>{formUrl}</div>
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: C.teal, color: "#fff", fontWeight: 600 }}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? "Copiado" : "Copiar link"}
            </button>
          </div>
        </Card>
        <LoginGate onSignedIn={refreshSession} />
      </div>
    );
  }

  const nuevos = leads.filter((l) => (l.estado || "nuevo") === "nuevo").length;

  return (
    <div className="space-y-6">
      <Card pad="p-4" style={{ background: C.mint, border: "none" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm" style={{ fontWeight: 600, color: C.teal }}>Link del formulario público</div>
            <div className="mono text-xs mt-1" style={{ color: C.sub, wordBreak: "break-all" }}>{formUrl}</div>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: C.teal, color: "#fff", fontWeight: 600 }}>
            {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 600 }}>Leads</h2>
          {nuevos > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}>
              {nuevos} nuevo{nuevos > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadLeads} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ border: `1px solid ${C.line}`, color: C.sub, fontWeight: 600 }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ border: `1px solid ${C.line}`, color: C.sub, fontWeight: 600 }}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</div>}

      {loading && leads.length === 0 && (
        <div className="text-center py-12">
          <Loader2 size={24} className="animate-spin mx-auto" style={{ color: C.sub }} />
          <p className="text-sm mt-2" style={{ color: C.sub }}>Cargando leads...</p>
        </div>
      )}

      {!loading && leads.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Users size={32} className="mx-auto mb-3" style={{ color: C.line }} />
            <p className="text-sm" style={{ color: C.sub }}>Aún no hay leads. Comparte el link del formulario para empezar a recibir interesados.</p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onEstado={updateLeadEstado} onDelete={deleteLead} />
        ))}
      </div>
    </div>
  );
}

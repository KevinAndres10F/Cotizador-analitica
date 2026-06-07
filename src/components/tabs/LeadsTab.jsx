import React, { useEffect, useState } from "react";
import { Users, RefreshCw, Trash2, Mail, Phone, Building2, Loader2, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { C } from "../../config/colors";
import { Card } from "../ui";
import { useLeads } from "../../hooks/useLeads";

const STATUS_CFG = {
  nuevo: { label: "Nuevo", bg: "#dbeafe", color: "#1d4ed8" },
  contactado: { label: "Contactado", bg: "#fef3c7", color: "#92400e" },
  calificado: { label: "Calificado", bg: "#d1fae5", color: "#065f46" },
  cerrado: { label: "Cerrado", bg: "#e0e7ff", color: "#3730a3" },
  descartado: { label: "Descartado", bg: "#fee2e2", color: "#991b1b" },
};

export default function LeadsTab() {
  const { leads, loading, error, loadLeads, updateLeadStatus, deleteLead } = useLeads();
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const formUrl = window.location.origin + window.location.pathname + "#formulario";

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nuevos = leads.filter((l) => l.status === "nuevo").length;

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
        <button onClick={loadLeads} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ border: `1px solid ${C.line}`, color: C.sub, fontWeight: 600 }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
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
        {leads.map((lead) => {
          const st = STATUS_CFG[lead.status] || STATUS_CFG.nuevo;
          return (
            <Card key={lead.id} pad="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm" style={{ fontWeight: 700 }}>{lead.empresa || "(sin empresa)"}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: st.bg, color: st.color, fontWeight: 600 }}>
                      {st.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                      <Users size={12} /> {lead.contacto}
                    </span>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs" style={{ color: C.teal }}>
                        <Mail size={12} /> {lead.email}
                      </a>
                    )}
                    {lead.telefono && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                        <Phone size={12} /> {lead.telefono}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {lead.sector && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                        <Building2 size={12} /> {lead.sector}
                      </span>
                    )}
                    {lead.empleados_rango && (
                      <span className="text-xs" style={{ color: C.sub }}>{lead.empleados_rango} empleados</span>
                    )}
                    <span className="text-xs mono" style={{ color: C.line }}>
                      {new Date(lead.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {lead.mensaje && (
                    <div className="mt-2 text-xs rounded-lg px-3 py-2" style={{ background: C.paper, color: C.sub }}>
                      "{lead.mensaje}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <button onClick={() => { if (confirm("¿Eliminar este lead?")) deleteLead(lead.id); }}
                    className="p-1.5 rounded-lg transition hover:bg-red-50"
                    style={{ color: "#dc2626" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

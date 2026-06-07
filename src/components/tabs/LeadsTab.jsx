import React, { useEffect, useState, useRef } from "react";
import {
  Users, RefreshCw, Trash2, Mail, Phone, Building2, Loader2, Copy, CheckCircle2,
  FileSpreadsheet, ChevronDown, ChevronUp, Calculator, Upload, AlertTriangle, CheckCircle,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { C } from "../../config/colors";
import { Card } from "../ui";
import { money } from "../../pricing/engine";
import { useLeads } from "../../hooks/useLeads";
import { supabase } from "../../lib/supabase";

const STATUS_CFG = {
  nuevo: { label: "Nuevo", bg: "#dbeafe", color: "#1d4ed8" },
  contactado: { label: "Contactado", bg: "#fef3c7", color: "#92400e" },
  calificado: { label: "Calificado", bg: "#d1fae5", color: "#065f46" },
  cerrado: { label: "Cerrado", bg: "#e0e7ff", color: "#3730a3" },
  descartado: { label: "Descartado", bg: "#fee2e2", color: "#991b1b" },
};

const NIVEL_COLOR = {
  BAJA: { bg: C.mint, text: C.teal },
  MEDIA: { bg: "#fef9ec", text: "#92620a" },
  ALTA: { bg: "#fef2f2", text: "#b91c1c" },
};

function analizarArchivo(workbook) {
  const resultados = [];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (data.length === 0) { resultados.push({ hoja: name, filas: 0, ok: false, problemas: ["Hoja vacía"] }); continue; }

    const headers = data[0].map((h) => String(h).trim());
    const filas = data.slice(1).filter((r) => r.some((c) => c !== ""));
    const totalFilas = filas.length;
    const totalCols = headers.length;

    const problemas = [];
    const sugerencias = [];
    let puntaje = 100;

    // Check empty headers
    const emptyHeaders = headers.filter((h) => !h).length;
    if (emptyHeaders > 0) { problemas.push(`${emptyHeaders} columna(s) sin encabezado`); puntaje -= emptyHeaders * 5; }

    // Check for duplicate headers
    const dupes = headers.filter((h, i) => h && headers.indexOf(h) !== i);
    if (dupes.length > 0) { problemas.push(`Encabezados duplicados: ${[...new Set(dupes)].join(", ")}`); puntaje -= 10; }

    // Check completeness per column
    const colStats = headers.map((h, ci) => {
      const vacios = filas.filter((r) => r[ci] === "" || r[ci] === null || r[ci] === undefined).length;
      const pct = totalFilas > 0 ? ((totalFilas - vacios) / totalFilas) * 100 : 0;
      return { nombre: h || `Col ${ci + 1}`, vacios, pct: Math.round(pct) };
    });

    const colsBajas = colStats.filter((c) => c.pct < 80 && c.pct > 0);
    if (colsBajas.length > 0) {
      problemas.push(`${colsBajas.length} columna(s) con más del 20% de datos faltantes`);
      puntaje -= colsBajas.length * 3;
    }

    const colsVacias = colStats.filter((c) => c.pct === 0);
    if (colsVacias.length > 0) {
      problemas.push(`${colsVacias.length} columna(s) completamente vacía(s): ${colsVacias.map(c => c.nombre).join(", ")}`);
      puntaje -= colsVacias.length * 5;
    }

    // Check for common payroll fields
    const headersLower = headers.map((h) => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
    const camposEsperados = [
      { keywords: ["cedula", "identificacion", "ci", "ruc", "documento"], label: "Identificación" },
      { keywords: ["nombre", "empleado", "trabajador", "name"], label: "Nombre" },
      { keywords: ["sueldo", "salario", "ingreso", "remuneracion", "salary"], label: "Sueldo/Salario" },
      { keywords: ["area", "departamento", "depto", "dept", "department"], label: "Área/Departamento" },
      { keywords: ["cargo", "puesto", "posicion", "position", "role"], label: "Cargo" },
      { keywords: ["fecha", "periodo", "mes", "date"], label: "Fecha/Período" },
    ];

    const encontrados = [];
    const noEncontrados = [];
    for (const campo of camposEsperados) {
      const found = headersLower.some((h) => campo.keywords.some((kw) => h.includes(kw)));
      if (found) encontrados.push(campo.label);
      else noEncontrados.push(campo.label);
    }

    if (noEncontrados.length > 0) {
      sugerencias.push(`Campos clave no detectados: ${noEncontrados.join(", ")}`);
      puntaje -= noEncontrados.length * 5;
    }

    // Check data type consistency
    const numericCols = [];
    const dateCols = [];
    headers.forEach((h, ci) => {
      const sample = filas.slice(0, Math.min(20, filas.length)).map(r => r[ci]).filter(v => v !== "" && v != null);
      const numCount = sample.filter(v => !isNaN(Number(v))).length;
      const dateCount = sample.filter(v => !isNaN(Date.parse(String(v)))).length;
      if (sample.length > 0 && numCount / sample.length > 0.8) numericCols.push(h);
      if (sample.length > 0 && dateCount / sample.length > 0.8 && numCount / sample.length < 0.5) dateCols.push(h);
    });

    // Check for mixed types
    headers.forEach((h, ci) => {
      const sample = filas.slice(0, 50).map(r => r[ci]).filter(v => v !== "" && v != null);
      if (sample.length < 5) return;
      const nums = sample.filter(v => !isNaN(Number(v))).length;
      const ratio = nums / sample.length;
      if (ratio > 0.3 && ratio < 0.7) {
        problemas.push(`"${h || `Col ${ci+1}`}": mezcla de texto y números`);
        puntaje -= 3;
      }
    });

    puntaje = Math.max(0, Math.min(100, puntaje));
    let calidad;
    if (puntaje >= 80) calidad = "buena";
    else if (puntaje >= 50) calidad = "regular";
    else calidad = "deficiente";

    resultados.push({
      hoja: name, filas: totalFilas, columnas: totalCols,
      headers, colStats,
      camposEncontrados: encontrados, camposNoEncontrados: noEncontrados,
      problemas, sugerencias, puntaje, calidad,
    });
  }
  return resultados;
}

function AnalisisArchivo({ analisis }) {
  if (!analisis || analisis.length === 0) return null;
  return (
    <div className="space-y-3 mt-3">
      {analisis.map((a, i) => {
        const color = a.calidad === "buena" ? C.green2 : a.calidad === "regular" ? C.orange : "#dc2626";
        const Icon = a.calidad === "buena" ? CheckCircle : a.calidad === "regular" ? AlertTriangle : XCircle;
        return (
          <div key={i} className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={14} style={{ color: C.sub }} />
                <span className="text-sm" style={{ fontWeight: 600 }}>{a.hoja}</span>
                <span className="text-xs mono" style={{ color: C.sub }}>{a.filas} filas · {a.columnas} cols</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: color + "18" }}>
                <Icon size={13} style={{ color }} />
                <span className="text-xs" style={{ color, fontWeight: 700 }}>{a.puntaje}/100</span>
              </div>
            </div>

            {a.camposEncontrados.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {a.camposEncontrados.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.mint, color: C.teal }}>
                    {c}
                  </span>
                ))}
                {a.camposNoEncontrados.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>
                    {c} ?
                  </span>
                ))}
              </div>
            )}

            {a.problemas.length > 0 && (
              <div className="space-y-1 mb-2">
                {a.problemas.map((p, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-xs" style={{ color: "#dc2626" }}>
                    <XCircle size={11} className="mt-0.5 flex-shrink-0" /> {p}
                  </div>
                ))}
              </div>
            )}

            {a.sugerencias.length > 0 && (
              <div className="space-y-1">
                {a.sugerencias.map((s, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-xs" style={{ color: C.orange }}>
                    <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" /> {s}
                  </div>
                ))}
              </div>
            )}

            {a.colStats && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer" style={{ color: C.sub }}>Ver completitud por columna</summary>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                  {a.colStats.filter(c => c.nombre).map((col, ci) => (
                    <div key={ci} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: C.line }}>
                        <div style={{ width: `${col.pct}%`, height: "100%", background: col.pct >= 80 ? C.green2 : col.pct >= 50 ? C.orange : "#dc2626" }} />
                      </div>
                      <span className="mono" style={{ color: C.sub, minWidth: 28, textAlign: "right" }}>{col.pct}%</span>
                      <span style={{ color: C.ink, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.nombre}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreCotizacion({ pre, diag }) {
  if (!pre || !pre.mensual) return null;
  const nc = NIVEL_COLOR[pre.nivel] || NIVEL_COLOR.BAJA;
  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: nc.bg, border: `1px solid ${nc.text}22` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Calculator size={13} style={{ color: nc.text }} />
        <span className="text-xs" style={{ color: nc.text, fontWeight: 700 }}>PRE-COTIZACIÓN · {pre.nivel}</span>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs" style={{ color: C.sub }}>Mensual</span>
          <div className="mono text-sm" style={{ fontWeight: 700, color: C.teal }}>{money(pre.mensual)}/mes</div>
        </div>
        {pre.implementacion > 0 && (
          <div>
            <span className="text-xs" style={{ color: C.sub }}>Implementación</span>
            <div className="mono text-sm" style={{ fontWeight: 700, color: C.ink }}>{money(pre.implementacion)}</div>
          </div>
        )}
      </div>
      {diag && diag.score != null && (
        <div className="text-xs mt-1.5" style={{ color: C.sub }}>
          Score diagnóstico: {diag.score} pts · {Object.keys(diag.respuestas || {}).length}/10 preguntas respondidas
        </div>
      )}
    </div>
  );
}

export default function LeadsTab() {
  const { leads, loading, error, loadLeads, updateLeadStatus, deleteLead } = useLeads();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [analizando, setAnalizando] = useState({});
  const [analisisResults, setAnalisisResults] = useState({});
  const fileRefs = useRef({});

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const formUrl = window.location.origin + window.location.pathname + "#formulario";

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const handleFileUpload = async (leadId, file) => {
    setAnalizando((a) => ({ ...a, [leadId]: true }));
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const analisis = analizarArchivo(wb);
      setAnalisisResults((r) => ({ ...r, [leadId]: analisis }));

      const resumen = analisis.map(a => ({ hoja: a.hoja, filas: a.filas, puntaje: a.puntaje, calidad: a.calidad, problemas: a.problemas.length }));
      await supabase.from("cot_leads").update({ archivo_analisis: { archivo: file.name, fecha: new Date().toISOString(), hojas: resumen } }).eq("id", leadId);
    } catch (err) {
      console.error("Error analizando archivo:", err);
    } finally {
      setAnalizando((a) => ({ ...a, [leadId]: false }));
    }
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
          const isExpanded = expanded[lead.id];
          const hasDiag = lead.diagnostico && lead.diagnostico.score != null;
          const hasPreCot = lead.pre_cotizacion && lead.pre_cotizacion.mensual;
          const hasAnalisis = analisisResults[lead.id] || (lead.archivo_analisis && lead.archivo_analisis.hojas);

          return (
            <Card key={lead.id} pad="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm" style={{ fontWeight: 700 }}>{lead.empresa || "(sin empresa)"}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: st.bg, color: st.color, fontWeight: 600 }}>
                      {st.label}
                    </span>
                    {hasDiag && (() => {
                      const nc = NIVEL_COLOR[lead.diagnostico.nivel] || NIVEL_COLOR.BAJA;
                      return (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: nc.bg, color: nc.text, fontWeight: 600 }}>
                          {lead.diagnostico.nivel}
                        </span>
                      );
                    })()}
                    {hasPreCot && (
                      <span className="px-2 py-0.5 rounded-full text-xs mono" style={{ background: C.mint, color: C.teal, fontWeight: 600 }}>
                        {money(lead.pre_cotizacion.mensual)}/mes
                      </span>
                    )}
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
                    {lead.sector && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: C.sub }}>
                        <Building2 size={12} /> {lead.sector}
                      </span>
                    )}
                    {lead.empleados_rango && (
                      <span className="text-xs" style={{ color: C.sub }}>{lead.empleados_rango} emp</span>
                    )}
                    <span className="text-xs mono" style={{ color: C.line }}>
                      {new Date(lead.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <button onClick={() => toggle(lead.id)}
                    className="p-1.5 rounded-lg transition hover:bg-gray-50"
                    style={{ color: C.sub }}>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button onClick={() => { if (confirm("¿Eliminar este lead?")) deleteLead(lead.id); }}
                    className="p-1.5 rounded-lg transition hover:bg-red-50"
                    style={{ color: "#dc2626" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {lead.mensaje && (
                <div className="mt-2 text-xs rounded-lg px-3 py-2" style={{ background: C.paper, color: C.sub }}>
                  "{lead.mensaje}"
                </div>
              )}

              {isExpanded && (
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                  {hasPreCot && (
                    <PreCotizacion pre={lead.pre_cotizacion} diag={lead.diagnostico} />
                  )}

                  {/* File analysis */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: C.sub, fontWeight: 700 }}>ANÁLISIS DE ARCHIVO</span>
                      <div>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          ref={(el) => { fileRefs.current[lead.id] = el; }}
                          className="hidden"
                          onChange={(e) => { if (e.target.files[0]) handleFileUpload(lead.id, e.target.files[0]); }}
                        />
                        <button
                          onClick={() => fileRefs.current[lead.id]?.click()}
                          disabled={analizando[lead.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.sub, fontWeight: 600 }}>
                          {analizando[lead.id] ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          {analizando[lead.id] ? "Analizando..." : "Subir archivo"}
                        </button>
                      </div>
                    </div>

                    {analisisResults[lead.id] && (
                      <AnalisisArchivo analisis={analisisResults[lead.id]} />
                    )}

                    {!analisisResults[lead.id] && lead.archivo_analisis && (
                      <div className="rounded-xl p-3 text-xs" style={{ background: C.paper }}>
                        <div className="flex items-center gap-2 mb-1">
                          <FileSpreadsheet size={12} style={{ color: C.sub }} />
                          <span style={{ fontWeight: 600 }}>{lead.archivo_analisis.archivo}</span>
                          <span style={{ color: C.sub }}>{new Date(lead.archivo_analisis.fecha).toLocaleDateString("es-EC")}</span>
                        </div>
                        {lead.archivo_analisis.hojas?.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 mt-1">
                            <span>{h.hoja}</span>
                            <span className="mono" style={{ color: h.calidad === "buena" ? C.green2 : h.calidad === "regular" ? C.orange : "#dc2626" }}>
                              {h.puntaje}/100
                            </span>
                            <span style={{ color: C.sub }}>{h.filas} filas · {h.problemas} problema(s)</span>
                          </div>
                        ))}
                        <div className="text-xs mt-2" style={{ color: C.sub }}>Sube el archivo de nuevo para ver el análisis completo.</div>
                      </div>
                    )}

                    {!analisisResults[lead.id] && !lead.archivo_analisis && (
                      <div className="rounded-xl p-3 text-xs text-center" style={{ background: C.paper, color: C.sub }}>
                        Sube un archivo Excel/CSV de nómina para analizar qué tan bien estructurada está la información.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

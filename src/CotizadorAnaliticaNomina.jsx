import React, { useState, useMemo } from "react";
import {
  Building2, Users, SlidersHorizontal, Calculator, ClipboardCheck, Workflow,
  ShieldCheck, Eye, EyeOff, Plus, Minus, Printer, ChevronRight, AlertTriangle,
  Database, Layers, Gauge, FileText, Settings2, CheckCircle2, Circle, Sparkles,
  ArrowRight, Lock, BellRing
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid
} from "recharts";

/* ============================================================
   KAPI · Cotizador — Analítica de Nómina
   Herramienta de reunión para Manpower
   ============================================================ */

// ---------- utilidades ----------
const n = (v) => { const x = parseFloat(v); return isNaN(x) ? 0 : x; };
const money = (v) =>
  "$" + Math.round(v).toLocaleString("es-EC");
const money2 = (v) =>
  "$" + v.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- configuración de precios por defecto (editable en "Tarifas") ----------
const DEFAULTS = {
  basePlataforma: 90,
  pisoMensual: 180,
  brackets: [
    { hasta: 100, tarifa: 1.4 },
    { hasta: 500, tarifa: 1.0 },
    { hasta: 1500, tarifa: 0.7 },
    { hasta: 5000, tarifa: 0.45 },
    { hasta: Infinity, tarifa: 0.3 },
  ],
  usuariosIncluidos: 3,
  precioUsuarioAdicional: 20,
  implBase: { BAJA: 900, MEDIA: 1800, ALTA: 3200 },
  recargoEscala: [
    { hasta: 300, monto: 0 },
    { hasta: 1500, monto: 400 },
    { hasta: 5000, monto: 900 },
    { hasta: Infinity, monto: 1600 },
  ],
  recargoHistorico: [
    { hasta: 12, monto: 0 },
    { hasta: 24, monto: 300 },
    { hasta: 36, monto: 500 },
    { hasta: Infinity, monto: 800 },
  ],
  precioIntegracion: 350,
  precioKpi: 120,
  precioReporte: 200,
  margenManpower: [
    { hasta: 40, pct: 0.25 },
    { hasta: 300, pct: 0.3 },
    { hasta: Infinity, pct: 0.35 },
  ],
  umbralMedia: 11,
  umbralAlta: 21,
};

function tramoSuma(empleados, brackets) {
  let total = 0, prev = 0;
  for (const b of brackets) {
    if (empleados <= prev) break;
    const tope = Math.min(empleados, b.hasta);
    total += (tope - prev) * b.tarifa;
    prev = b.hasta;
    if (empleados <= b.hasta) break;
  }
  return total;
}
const buscarBanda = (valor, tabla, campo) => {
  for (const r of tabla) if (valor <= r.hasta) return r[campo];
  return tabla[tabla.length - 1][campo];
};

// ---------- formulario de complejidad ----------
const PREGUNTAS = [
  {
    id: "fuentes", icon: Database,
    q: "¿Cuántos sistemas / fuentes de nómina se deben integrar?",
    op: [["1 sistema", 0], ["2 a 3 sistemas", 2], ["4 o más", 4]],
  },
  {
    id: "formato", icon: Layers,
    q: "¿En qué formato entrega los datos el cliente?",
    op: [["API o base de datos estructurada", 0], ["Exportes Excel / CSV limpios", 2], ["Archivos heterogéneos, PDF o sistema legado", 4]],
  },
  {
    id: "entidades", icon: Building2,
    q: "¿Cuántas razones sociales / empresas / centros de costo?",
    op: [["1", 0], ["2 a 5", 2], ["6 o más", 3]],
  },
  {
    id: "actualizacion", icon: Gauge,
    q: "¿Frecuencia y método de actualización de datos?",
    op: [["Carga manual mensual", 0], ["Carga programada (SFTP)", 1], ["Integración automática / API continua", 3]],
  },
  {
    id: "anonimizacion", icon: Lock,
    q: "¿Nivel de anonimización / cumplimiento requerido?",
    op: [["Datos internos, sin anonimizar", 0], ["Pseudonimización + acceso por rol", 2], ["Avanzado: LOPDP, k-anonimato, auditoría", 4]],
  },
  {
    id: "personalizacion", icon: Sparkles,
    q: "¿Cuántos tableros personalizados requiere el cliente?",
    op: [["1 tablero estándar", 0], ["2 a 3 tableros", 2], ["4 o más tableros", 4]],
  },
  {
    id: "historico", icon: FileText,
    q: "¿Profundidad de histórico a migrar y reconciliar?",
    op: [["Hasta 12 meses", 0], ["13 a 36 meses", 2], ["37 meses o más", 3]],
  },
  {
    id: "salidas", icon: BellRing,
    q: "¿Salidas / notificaciones requeridas?",
    op: [["Solo tablero", 0], ["+ Alertas por correo", 1], ["+ WhatsApp u otros sistemas", 3]],
  },
  {
    id: "seguridad", icon: ShieldCheck,
    q: "¿Requerimientos de seguridad / acceso?",
    op: [["Estándar", 0], ["SSO o bitácora de auditoría", 2], ["Requerimientos específicos / on-prem", 4]],
  },
  {
    id: "capacitacion", icon: Users,
    q: "¿Alcance de capacitación y acompañamiento?",
    op: [["Handoff básico", 0], ["Capacitación a un equipo", 1], ["Multi-sede o multi-rol", 3]],
  },
];

// ---------- contenido de proceso (cara al cliente) ----------
const RUTA = [
  { t: "Descubrimiento", d: "Llenamos juntos el formulario de diagnóstico y definimos alcance.", icon: ClipboardCheck },
  { t: "Propuesta", d: "Entregamos cotización con complejidad calificada y cronograma.", icon: FileText },
  { t: "Conexión de datos", d: "Acceso seguro a fuentes de nómina y diccionario de campos.", icon: Database },
  { t: "Anonimización", d: "Tratamiento de datos personales conforme a LOPDP.", icon: Lock },
  { t: "Construcción", d: "Modelado y armado del tablero con tus KPIs.", icon: Layers },
  { t: "Validación (UAT)", d: "Revisión y ajustes con tu equipo antes de salir a producción.", icon: CheckCircle2 },
  { t: "Puesta en marcha", d: "Capacitación, accesos por rol y go-live.", icon: Sparkles },
  { t: "Mejora continua", d: "Soporte mensual, monitoreo y evolución del tablero.", icon: Workflow },
];

const ANONIMIZACION = [
  ["Inventario de datos personales", "Identificamos qué campos son PII (cédula, nombre, salario individual, etc.) y su base legal."],
  ["Seudonimización / tokenización", "Sustituimos identificadores directos por tokens; el dato sensible no viaja al tablero."],
  ["Acceso por rol", "Cada usuario ve solo el nivel de detalle que le corresponde (agregado vs. individual)."],
  ["Umbral de agregación", "Métricas de grupos pequeños se ocultan o agrupan (k-anonimato) para evitar reidentificación."],
  ["Bitácora y auditoría", "Registro de accesos y cambios; trazabilidad conforme a LOPDP."],
];

const CHECKLIST = [
  "Designar contraparte técnica y de RR.HH. del cliente",
  "Acceso o exporte de muestra de la(s) fuente(s) de nómina",
  "Diccionario de campos / catálogo de conceptos de nómina",
  "Listado de razones sociales y centros de costo",
  "Política de anonimización y roles de acceso requeridos",
  "Listado de KPIs e indicadores deseados",
  "Profundidad de histórico a migrar (meses)",
  "Requerimientos de seguridad (SSO, auditoría, etc.)",
  "Canales de notificación deseados (correo, WhatsApp)",
  "Responsable de validación (UAT) y fecha objetivo",
];

// ---------- UI primitivos ----------
const C = {
  teal: "#0a3a35", teal2: "#0d4a43", green: "#22c55e", green2: "#16a34a",
  orange: "#c5680a", mint: "#ecf8f1", ink: "#13211f", sub: "#5b6b67",
  line: "#dce8e2", paper: "#f7faf8",
};

function Stepper({ value, onChange, min = 0, max = 9999, step = 1 }) {
  return (
    <div className="inline-flex items-center rounded-xl overflow-hidden no-print" style={{ border: `1px solid ${C.line}` }}>
      <button onClick={() => onChange(Math.max(min, value - step))}
        className="px-3 py-2 transition" style={{ color: C.teal }}>
        <Minus size={15} />
      </button>
      <input value={value}
        onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, "")); onChange(isNaN(v) ? 0 : Math.min(max, v)); }}
        className="w-16 text-center py-2 outline-none mono"
        style={{ color: C.ink, fontWeight: 600, borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}` }} />
      <button onClick={() => onChange(Math.min(max, value + step))}
        className="px-3 py-2 transition" style={{ color: C.teal }}>
        <Plus size={15} />
      </button>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm" style={{ color: C.ink, fontWeight: 600 }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: C.sub }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Card({ children, pad = "p-5", style }) {
  return (
    <div className={`rounded-2xl ${pad}`} style={{ background: "#fff", border: `1px solid ${C.line}`, ...style }}>
      {children}
    </div>
  );
}

// ---------- componente principal ----------
export default function CotizadorAnaliticaNomina() {
  const [tab, setTab] = useState("cliente");
  const [vista, setVista] = useState("cliente");
  const [cfg, setCfg] = useState(DEFAULTS);

  const [cliente, setCliente] = useState({
    empresa: "", contacto: "", sector: "", ref: "KAPI-MPO-AN-2026-01",
  });
  const [empleados, setEmpleados] = useState(250);
  const [usuarios, setUsuarios] = useState(3);

  const [mesesHist, setMesesHist] = useState(12);
  const [integraciones, setIntegraciones] = useState(0);
  const [kpis, setKpis] = useState(0);
  const [reportes, setReportes] = useState(0);

  const [resp, setResp] = useState({});
  const [check, setCheck] = useState(Array(CHECKLIST.length).fill(false));

  // ----- cálculos -----
  const score = useMemo(
    () => PREGUNTAS.reduce((s, p) => s + (resp[p.id] != null ? p.op[resp[p.id]][1] : 0), 0),
    [resp]
  );
  const maxScore = useMemo(() => PREGUNTAS.reduce((s, p) => s + Math.max(...p.op.map(o => o[1])), 0), []);
  const respondidas = useMemo(() => Object.keys(resp).length, [resp]);
  const nivel = score >= cfg.umbralAlta ? "ALTA" : score >= cfg.umbralMedia ? "MEDIA" : "BAJA";

  const q = useMemo(() => {
    const emp = Math.max(0, empleados);
    const tramos = tramoSuma(emp, cfg.brackets);
    const extraUsuarios = Math.max(0, usuarios - cfg.usuariosIncluidos);
    const usuariosCosto = extraUsuarios * cfg.precioUsuarioAdicional;
    const mensualBruto = cfg.basePlataforma + tramos + usuariosCosto;
    const mensual = Math.max(cfg.pisoMensual, mensualBruto);

    const base = cfg.implBase[nivel];
    const recEscala = buscarBanda(emp, cfg.recargoEscala, "monto");
    const recHist = buscarBanda(mesesHist, cfg.recargoHistorico, "monto");
    const adecMonto = integraciones * cfg.precioIntegracion + kpis * cfg.precioKpi + reportes * cfg.precioReporte;
    const implementacion = base + recEscala + recHist + adecMonto;

    const margen = buscarBanda(emp, cfg.margenManpower, "pct");
    return {
      tramos, usuariosCosto, extraUsuarios, mensual, mensualPiso: mensual > mensualBruto,
      base, recEscala, recHist, adecMonto, implementacion, margen,
      mpMensual: mensual * margen, kapiMensual: mensual * (1 - margen),
      mpImpl: implementacion * margen, kapiImpl: implementacion * (1 - margen),
    };
  }, [empleados, usuarios, mesesHist, integraciones, kpis, reportes, nivel, cfg]);

  const curva = useMemo(() => {
    const maxX = Math.max(1200, Math.ceil((empleados * 1.6) / 100) * 100);
    const pts = [];
    for (let x = 0; x <= maxX; x += Math.max(20, Math.round(maxX / 60))) {
      const tramos = tramoSuma(x, cfg.brackets);
      const m = Math.max(cfg.pisoMensual, cfg.basePlataforma + tramos);
      pts.push({ emp: x, mensual: Math.round(m) });
    }
    return pts;
  }, [empleados, cfg]);

  const nivelColor = { BAJA: C.green2, MEDIA: C.orange, ALTA: "#c0392b" }[nivel];

  const TABS = [
    ["cliente", "Cliente", Building2],
    ["diagnostico", "Diagnóstico", ClipboardCheck],
    ["alcance", "Alcance", SlidersHorizontal],
    ["cotizacion", "Cotización", Calculator],
    ["proceso", "Proceso", Workflow],
    ["tarifas", "Tarifas", Settings2],
  ];

  return (
    <div style={{ background: C.paper, color: C.ink, minHeight: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
        .serif { font-family: 'Fraunces', serif; }
        .mono { font-family: 'JetBrains Mono', monospace; font-feature-settings:"tnum"; }
        .tabbtn { transition: all .15s ease; }
        .opt { transition: all .12s ease; cursor: pointer; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media print {
          .no-print { display: none !important; }
          .print-full { box-shadow: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* ---------- Header ---------- */}
      <div className="no-print" style={{ background: C.teal }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: C.green }}>
              <Gauge size={22} color={C.teal} strokeWidth={2.4} />
            </div>
            <div>
              <div className="serif" style={{ color: "#fff", fontSize: 21, fontWeight: 600, lineHeight: 1.1 }}>
                Analítica de Nómina
              </div>
              <div style={{ color: "#9fc9bd", fontSize: 12.5, letterSpacing: ".04em" }}>
                COTIZADOR · KAPI SERVICE GROUP × MANPOWER
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setVista(vista === "cliente" ? "interna" : "cliente")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
              style={{ background: vista === "interna" ? C.orange : "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600 }}>
              {vista === "interna" ? <Eye size={15} /> : <EyeOff size={15} />}
              {vista === "interna" ? "Vista interna" : "Vista cliente"}
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
              style={{ background: C.green, color: C.teal, fontWeight: 700 }}>
              <Printer size={15} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="no-print" style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 20 }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {TABS.map(([id, label, Icon]) => {
            const active = tab === id;
            const isCfg = id === "tarifas";
            return (
              <button key={id} onClick={() => setTab(id)}
                className="tabbtn flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap"
                style={{
                  color: active ? (isCfg ? C.orange : C.teal) : C.sub,
                  fontWeight: active ? 700 : 500,
                  borderBottom: `2.5px solid ${active ? (isCfg ? C.orange : C.teal) : "transparent"}`,
                  opacity: isCfg && !active ? 0.7 : 1,
                }}>
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Layout ---------- */}
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className={tab === "proceso" || tab === "tarifas" ? "" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          {/* main */}
          <div className={tab === "proceso" || tab === "tarifas" ? "" : "lg:col-span-2 space-y-6"}>

            {/* ===== CLIENTE ===== */}
            {tab === "cliente" && (
              <>
                <Card>
                  <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Datos del cliente</h2>
                  <p className="text-sm mb-5" style={{ color: C.sub }}>Información base de la cotización.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Empresa">
                      <input value={cliente.empresa} onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                        placeholder="Nombre del cliente"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: `1px solid ${C.line}`, background: C.paper }} />
                    </Field>
                    <Field label="Contacto">
                      <input value={cliente.contacto} onChange={(e) => setCliente({ ...cliente, contacto: e.target.value })}
                        placeholder="Nombre y cargo"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: `1px solid ${C.line}`, background: C.paper }} />
                    </Field>
                    <Field label="Sector / industria">
                      <input value={cliente.sector} onChange={(e) => setCliente({ ...cliente, sector: e.target.value })}
                        placeholder="Ej. Retail, manufactura…"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border: `1px solid ${C.line}`, background: C.paper }} />
                    </Field>
                    <Field label="N° de cotización">
                      <input value={cliente.ref} onChange={(e) => setCliente({ ...cliente, ref: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mono"
                        style={{ border: `1px solid ${C.line}`, background: C.paper }} />
                    </Field>
                  </div>
                </Card>

                <Card>
                  <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Tamaño de la operación</h2>
                  <p className="text-sm mb-5" style={{ color: C.sub }}>Determina la mensualidad por tramos y la banda de escala.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Empleados en nómina" hint="dato principal">
                      <Stepper value={empleados} onChange={setEmpleados} step={10} max={50000} />
                    </Field>
                    <Field label="Usuarios del tablero" hint={`${cfg.usuariosIncluidos} incluidos`}>
                      <Stepper value={usuarios} onChange={setUsuarios} min={1} max={500} />
                    </Field>
                  </div>
                  <div className="mt-5 rounded-xl p-4 flex items-start gap-3" style={{ background: C.mint }}>
                    <Calculator size={18} color={C.teal} className="mt-0.5" />
                    <p className="text-sm" style={{ color: C.teal }}>
                      Con <b>{empleados.toLocaleString("es-EC")}</b> empleados, la mensualidad base de plataforma es{" "}
                      <b className="mono">{money(q.mensual)}/mes</b>. Completa el <b>Diagnóstico</b> para calcular la implementación.
                    </p>
                  </div>
                </Card>
              </>
            )}

            {/* ===== DIAGNÓSTICO ===== */}
            {tab === "diagnostico" && (
              <>
                <Card style={{ background: C.teal, border: "none" }}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="serif" style={{ fontSize: 19, fontWeight: 600, color: "#fff" }}>
                        Formulario de diagnóstico
                      </h2>
                      <p className="text-sm" style={{ color: "#9fc9bd" }}>
                        Respóndelo junto al cliente. El puntaje define el nivel de complejidad.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: "#9fc9bd" }}>NIVEL CALCULADO</div>
                      <div className="serif" style={{ fontSize: 30, fontWeight: 700, color: nivelColor, lineHeight: 1 }}>
                        {nivel}
                      </div>
                      <div className="mono text-xs" style={{ color: "#9fc9bd" }}>
                        {score} / {maxScore} pts · {respondidas}/{PREGUNTAS.length}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-full overflow-hidden" style={{ height: 7, background: "rgba(255,255,255,.15)" }}>
                    <div style={{ width: `${(score / maxScore) * 100}%`, height: "100%", background: nivelColor, transition: "width .3s" }} />
                  </div>
                </Card>

                {PREGUNTAS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <Card key={p.id} pad="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: C.mint }}>
                          <Icon size={17} color={C.teal} />
                        </div>
                        <div className="text-sm pt-1" style={{ fontWeight: 600 }}>
                          <span style={{ color: C.sub }}>{i + 1}. </span>{p.q}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {p.op.map(([label, pts], idx) => {
                          const sel = resp[p.id] === idx;
                          return (
                            <button key={idx} onClick={() => setResp({ ...resp, [p.id]: idx })}
                              className="opt rounded-xl px-3 py-2.5 text-left"
                              style={{
                                border: `1.5px solid ${sel ? C.teal : C.line}`,
                                background: sel ? C.mint : "#fff",
                              }}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs" style={{ fontWeight: sel ? 600 : 500, color: sel ? C.teal : C.ink }}>{label}</span>
                                <span className="mono text-xs px-1.5 rounded" style={{ background: sel ? C.teal : "#eef3f1", color: sel ? "#fff" : C.sub }}>+{pts}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </>
            )}

            {/* ===== ALCANCE ===== */}
            {tab === "alcance" && (
              <>
                <Card>
                  <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Histórico y adecuaciones</h2>
                  <p className="text-sm mb-5" style={{ color: C.sub }}>
                    Estos ítems se cobran <b>una sola vez</b> en la implementación, no en la mensualidad.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ border: `1px solid ${C.line}` }}>
                      <div><div className="text-sm" style={{ fontWeight: 600 }}>Histórico a migrar</div>
                        <div className="text-xs" style={{ color: C.sub }}>Meses de nómina a cargar y reconciliar</div></div>
                      <Stepper value={mesesHist} onChange={setMesesHist} step={6} max={240} />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ border: `1px solid ${C.line}` }}>
                      <div><div className="text-sm" style={{ fontWeight: 600 }}>Integraciones adicionales</div>
                        <div className="text-xs" style={{ color: C.sub }}>Fuentes más allá de la primera · {money(cfg.precioIntegracion)} c/u</div></div>
                      <Stepper value={integraciones} onChange={setIntegraciones} max={20} />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ border: `1px solid ${C.line}` }}>
                      <div><div className="text-sm" style={{ fontWeight: 600 }}>KPIs / visuales personalizados</div>
                        <div className="text-xs" style={{ color: C.sub }}>Fuera de la plantilla · {money(cfg.precioKpi)} c/u</div></div>
                      <Stepper value={kpis} onChange={setKpis} max={50} />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl p-3.5" style={{ border: `1px solid ${C.line}` }}>
                      <div><div className="text-sm" style={{ fontWeight: 600 }}>Reportes / exportes personalizados</div>
                        <div className="text-xs" style={{ color: C.sub }}>{money(cfg.precioReporte)} c/u</div></div>
                      <Stepper value={reportes} onChange={setReportes} max={50} />
                    </div>
                  </div>
                </Card>

                <Card style={{ background: C.mint, border: "none" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock size={17} color={C.teal} />
                    <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, color: C.teal }}>Proceso de anonimización (LOPDP)</h3>
                  </div>
                  <div className="space-y-2.5">
                    {ANONIMIZACION.map(([t, d], i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mono text-xs rounded-full flex items-center justify-center shrink-0" style={{ width: 20, height: 20, background: C.teal, color: "#fff" }}>{i + 1}</span>
                        <div className="text-sm" style={{ color: C.teal }}><b>{t}.</b> <span style={{ color: "#356b60" }}>{d}</span></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ===== COTIZACIÓN ===== */}
            {tab === "cotizacion" && (
              <div className="space-y-6 print-full">
                {respondidas < PREGUNTAS.length && (
                  <div className="no-print rounded-xl p-3.5 flex items-center gap-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                    <AlertTriangle size={18} color={C.orange} />
                    <span className="text-sm" style={{ color: "#9a3412" }}>
                      Faltan {PREGUNTAS.length - respondidas} preguntas del diagnóstico. La complejidad puede cambiar el costo de implementación.
                    </span>
                  </div>
                )}

                {/* dos totales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: C.teal }}>
                    <div className="text-xs" style={{ color: "#9fc9bd", letterSpacing: ".05em" }}>SUSCRIPCIÓN MENSUAL</div>
                    <div className="serif mt-1" style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                      {money(q.mensual)}<span style={{ fontSize: 16, color: "#9fc9bd" }}>/mes</span>
                    </div>
                    <div className="mono text-xs mt-1.5" style={{ color: "#9fc9bd" }}>
                      ≈ {money2(q.mensual / Math.max(1, empleados))}/empleado
                    </div>
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.orange}` }}>
                    <div className="text-xs" style={{ color: C.orange, letterSpacing: ".05em" }}>IMPLEMENTACIÓN · ÚNICO PAGO</div>
                    <div className="serif mt-1" style={{ fontSize: 36, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
                      {money(q.implementacion)}
                    </div>
                    <div className="text-xs mt-1.5" style={{ color: C.sub }}>
                      Complejidad <b style={{ color: nivelColor }}>{nivel}</b>
                    </div>
                  </div>
                </div>

                {/* desglose */}
                <Card>
                  <h3 className="serif mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Desglose</h3>
                  <div className="text-xs mb-2" style={{ color: C.sub, fontWeight: 700, letterSpacing: ".04em" }}>MENSUAL</div>
                  {[
                    ["Base de plataforma", cfg.basePlataforma],
                    [`Empleados (${empleados.toLocaleString("es-EC")} · tramos)`, q.tramos],
                    q.extraUsuarios > 0 ? [`Usuarios adicionales (${q.extraUsuarios})`, q.usuariosCosto] : null,
                    q.mensualPiso ? ["Ajuste a piso mínimo", q.mensual - (cfg.basePlataforma + q.tramos + q.usuariosCosto)] : null,
                  ].filter(Boolean).map(([l, v], i) => (
                    <div key={i} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: `1px solid ${C.paper}` }}>
                      <span style={{ color: C.sub }}>{l}</span><span className="mono" style={{ fontWeight: 600 }}>{money2(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 text-sm" style={{ fontWeight: 700 }}>
                    <span>Total mensual</span><span className="mono" style={{ color: C.teal }}>{money2(q.mensual)}</span>
                  </div>

                  <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700, letterSpacing: ".04em" }}>IMPLEMENTACIÓN</div>
                  {[
                    [`Base por complejidad (${nivel})`, q.base],
                    q.recEscala > 0 ? ["Recargo por escala", q.recEscala] : null,
                    q.recHist > 0 ? [`Migración de histórico (${mesesHist} m)`, q.recHist] : null,
                    integraciones > 0 ? [`Integraciones (${integraciones})`, integraciones * cfg.precioIntegracion] : null,
                    kpis > 0 ? [`KPIs personalizados (${kpis})`, kpis * cfg.precioKpi] : null,
                    reportes > 0 ? [`Reportes personalizados (${reportes})`, reportes * cfg.precioReporte] : null,
                  ].filter(Boolean).map(([l, v], i) => (
                    <div key={i} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: `1px solid ${C.paper}` }}>
                      <span style={{ color: C.sub }}>{l}</span><span className="mono" style={{ fontWeight: 600 }}>{money2(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 text-sm" style={{ fontWeight: 700 }}>
                    <span>Total implementación</span><span className="mono" style={{ color: C.orange }}>{money2(q.implementacion)}</span>
                  </div>
                </Card>

                {/* split interno */}
                {vista === "interna" && (
                  <Card style={{ background: "#fffaf4", border: "1px solid #fde2c0" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} color={C.orange} />
                      <h3 className="serif" style={{ fontSize: 15, fontWeight: 600, color: "#9a3412" }}>Distribución interna · no mostrar al cliente</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs mb-1" style={{ color: C.sub }}>Mensual · margen Manpower {(q.margen * 100).toFixed(0)}%</div>
                        <div className="flex justify-between"><span>Manpower</span><span className="mono" style={{ fontWeight: 700, color: C.orange }}>{money2(q.mpMensual)}</span></div>
                        <div className="flex justify-between"><span>KAPI</span><span className="mono" style={{ fontWeight: 700, color: C.teal }}>{money2(q.kapiMensual)}</span></div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: C.sub }}>Implementación</div>
                        <div className="flex justify-between"><span>Manpower</span><span className="mono" style={{ fontWeight: 700, color: C.orange }}>{money2(q.mpImpl)}</span></div>
                        <div className="flex justify-between"><span>KAPI</span><span className="mono" style={{ fontWeight: 700, color: C.teal }}>{money2(q.kapiImpl)}</span></div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* curva de escalado */}
                <Card>
                  <h3 className="serif mb-1" style={{ fontSize: 16, fontWeight: 600 }}>Cómo escala la mensualidad</h3>
                  <p className="text-xs mb-3" style={{ color: C.sub }}>Tarifa marginal decreciente por volumen — sin saltos.</p>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <AreaChart data={curva} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={C.green} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={C.green} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                        <XAxis dataKey="emp" tick={{ fontSize: 11, fill: C.sub }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                        <YAxis tick={{ fontSize: 11, fill: C.sub }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                        <Tooltip formatter={(v) => [money(v), "Mensual"]} labelFormatter={(v) => `${v.toLocaleString("es-EC")} empleados`}
                          contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} />
                        <Area type="monotone" dataKey="mensual" stroke={C.green2} strokeWidth={2.5} fill="url(#g)" />
                        <ReferenceDot x={empleados} y={Math.round(q.mensual)} r={5} fill={C.teal} stroke="#fff" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            {/* ===== PROCESO (full width) ===== */}
            {tab === "proceso" && (
              <div className="space-y-6">
                <Card>
                  <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Ruta de experiencia del cliente</h2>
                  <p className="text-sm mb-5" style={{ color: C.sub }}>Del primer contacto a la mejora continua.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {RUTA.map((r, i) => {
                      const Icon = r.icon;
                      return (
                        <div key={i} className="rounded-xl p-4 relative" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="rounded-lg flex items-center justify-center" style={{ width: 30, height: 30, background: C.teal }}>
                              <Icon size={16} color="#fff" />
                            </div>
                            <span className="mono text-xs" style={{ color: "#b9cabf", fontWeight: 700 }}>0{i + 1}</span>
                          </div>
                          <div className="text-sm" style={{ fontWeight: 700 }}>{r.t}</div>
                          <div className="text-xs mt-1" style={{ color: C.sub }}>{r.d}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardCheck size={18} color={C.teal} />
                      <h3 className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Checklist de requisitos</h3>
                    </div>
                    <p className="text-xs mb-3" style={{ color: C.sub }}>Lo que necesitamos del cliente para arrancar.</p>
                    <div className="space-y-1.5">
                      {CHECKLIST.map((item, i) => (
                        <button key={i} onClick={() => setCheck(check.map((c, j) => j === i ? !c : c))}
                          className="opt w-full flex items-start gap-2.5 text-left rounded-lg px-2 py-1.5"
                          style={{ background: check[i] ? C.mint : "transparent" }}>
                          {check[i] ? <CheckCircle2 size={18} color={C.green2} className="shrink-0 mt-0.5" /> : <Circle size={18} color="#c2d2cb" className="shrink-0 mt-0.5" />}
                          <span className="text-sm" style={{ color: check[i] ? C.teal : C.ink, textDecoration: check[i] ? "line-through" : "none" }}>{item}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 mono text-xs" style={{ color: C.sub }}>
                      {check.filter(Boolean).length}/{CHECKLIST.length} completados
                    </div>
                  </Card>

                  <Card style={{ background: C.teal, border: "none" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock size={18} color={C.green} />
                      <h3 className="serif" style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Anonimización · LOPDP</h3>
                    </div>
                    <p className="text-xs mb-4" style={{ color: "#9fc9bd" }}>
                      El dato sensible se protege antes de llegar al tablero. Nivel y alcance se definen en el diagnóstico.
                    </p>
                    <div className="space-y-3">
                      {ANONIMIZACION.map(([t, d], i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mono text-xs rounded-full flex items-center justify-center shrink-0" style={{ width: 20, height: 20, background: C.green, color: C.teal, fontWeight: 700 }}>{i + 1}</span>
                          <div className="text-sm" style={{ color: "#fff" }}><b>{t}.</b> <span style={{ color: "#9fc9bd" }}>{d}</span></div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ===== TARIFAS (config interna, full width) ===== */}
            {tab === "tarifas" && (
              <div className="space-y-6">
                <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <Settings2 size={18} color={C.orange} />
                  <span className="text-sm" style={{ color: "#9a3412" }}>Configuración interna de tarifas. Los cambios recalculan toda la cotización en vivo.</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="serif mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Mensualidad</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Base plataforma">
                        <NumInput v={cfg.basePlataforma} set={(x) => setCfg({ ...cfg, basePlataforma: x })} pre="$" />
                      </Field>
                      <Field label="Piso mínimo">
                        <NumInput v={cfg.pisoMensual} set={(x) => setCfg({ ...cfg, pisoMensual: x })} pre="$" />
                      </Field>
                      <Field label="Usuarios incluidos">
                        <NumInput v={cfg.usuariosIncluidos} set={(x) => setCfg({ ...cfg, usuariosIncluidos: x })} />
                      </Field>
                      <Field label="Usuario adicional">
                        <NumInput v={cfg.precioUsuarioAdicional} set={(x) => setCfg({ ...cfg, precioUsuarioAdicional: x })} pre="$" />
                      </Field>
                    </div>
                    <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700 }}>TARIFA MARGINAL POR TRAMO ($/empleado)</div>
                    {cfg.brackets.map((b, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1.5">
                        <span className="text-sm mono" style={{ color: C.sub }}>
                          {(i === 0 ? 1 : cfg.brackets[i - 1].hasta + 1).toLocaleString("es-EC")}–{b.hasta === Infinity ? "∞" : b.hasta.toLocaleString("es-EC")}
                        </span>
                        <NumInput v={b.tarifa} step={0.05} pre="$"
                          set={(x) => { const nb = [...cfg.brackets]; nb[i] = { ...nb[i], tarifa: x }; setCfg({ ...cfg, brackets: nb }); }} small />
                      </div>
                    ))}
                  </Card>

                  <Card>
                    <h3 className="serif mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Implementación</h3>
                    <div className="text-xs mb-2" style={{ color: C.sub, fontWeight: 700 }}>BASE POR COMPLEJIDAD</div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {["BAJA", "MEDIA", "ALTA"].map((k) => (
                        <Field key={k} label={k}>
                          <NumInput v={cfg.implBase[k]} pre="$" set={(x) => setCfg({ ...cfg, implBase: { ...cfg.implBase, [k]: x } })} small />
                        </Field>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Field label="Integración"><NumInput v={cfg.precioIntegracion} pre="$" set={(x) => setCfg({ ...cfg, precioIntegracion: x })} small /></Field>
                      <Field label="KPI"><NumInput v={cfg.precioKpi} pre="$" set={(x) => setCfg({ ...cfg, precioKpi: x })} small /></Field>
                      <Field label="Reporte"><NumInput v={cfg.precioReporte} pre="$" set={(x) => setCfg({ ...cfg, precioReporte: x })} small /></Field>
                    </div>
                    <div className="text-xs mb-2" style={{ color: C.sub, fontWeight: 700 }}>UMBRALES DE COMPLEJIDAD (puntos)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`MEDIA ≥`}><NumInput v={cfg.umbralMedia} set={(x) => setCfg({ ...cfg, umbralMedia: x })} small /></Field>
                      <Field label={`ALTA ≥`}><NumInput v={cfg.umbralAlta} set={(x) => setCfg({ ...cfg, umbralAlta: x })} small /></Field>
                    </div>
                  </Card>
                </div>
                <button onClick={() => setCfg(DEFAULTS)}
                  className="text-sm px-4 py-2 rounded-xl" style={{ border: `1px solid ${C.line}`, color: C.sub }}>
                  Restablecer valores por defecto
                </button>
              </div>
            )}
          </div>

          {/* ---------- Summary rail ---------- */}
          {tab !== "proceso" && tab !== "tarifas" && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-3">
                <Card style={{ background: C.teal, border: "none" }}>
                  <div className="text-xs mb-3" style={{ color: "#9fc9bd", letterSpacing: ".06em" }}>RESUMEN EN VIVO</div>
                  <div className="text-sm" style={{ color: "#fff", fontWeight: 700 }}>{cliente.empresa || "— Cliente —"}</div>
                  <div className="text-xs mb-4 mono" style={{ color: "#9fc9bd" }}>{cliente.ref}</div>

                  <div className="space-y-2.5">
                    <RailRow l="Empleados" v={empleados.toLocaleString("es-EC")} />
                    <RailRow l="Usuarios" v={usuarios} />
                    <RailRow l="Complejidad" v={nivel} c={nivelColor} bold />
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", margin: "6px 0" }} />
                    <div className="flex justify-between items-end">
                      <span className="text-xs" style={{ color: "#9fc9bd" }}>Mensual</span>
                      <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{money(q.mensual)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs" style={{ color: "#9fc9bd" }}>Implementación</span>
                      <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{money(q.implementacion)}</span>
                    </div>
                  </div>
                </Card>

                {vista === "interna" && (
                  <Card pad="p-4" style={{ background: "#fffaf4", border: "1px solid #fde2c0" }}>
                    <div className="text-xs mb-2" style={{ color: C.orange, fontWeight: 700 }}>SPLIT · MARGEN {(q.margen * 100).toFixed(0)}%</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><div style={{ color: C.sub }}>Manpower/mes</div><div className="mono" style={{ fontWeight: 700, color: C.orange }}>{money(q.mpMensual)}</div></div>
                      <div><div style={{ color: C.sub }}>KAPI/mes</div><div className="mono" style={{ fontWeight: 700, color: C.teal }}>{money(q.kapiMensual)}</div></div>
                    </div>
                  </Card>
                )}

                <button onClick={() => setTab(tab === "cotizacion" ? "proceso" : "cotizacion")}
                  className="no-print w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm"
                  style={{ background: C.orange, color: "#fff", fontWeight: 700 }}>
                  {tab === "cotizacion" ? "Ver proceso e implementación" : "Ir a la cotización"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="no-print text-center py-6 text-xs" style={{ color: C.sub }}>
        KAPI Service Group · Quito, Ecuador — herramienta interna de cotización
      </div>
    </div>
  );
}

// ---------- helpers UI extra ----------
function RailRow({ l, v, c, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "#9fc9bd" }}>{l}</span>
      <span className="mono" style={{ color: c || "#fff", fontWeight: bold ? 700 : 500 }}>{v}</span>
    </div>
  );
}
function NumInput({ v, set, pre, step = 1, small }) {
  return (
    <div className="inline-flex items-center rounded-xl overflow-hidden w-full" style={{ border: `1px solid ${C.line}`, background: C.paper }}>
      {pre && <span className="pl-2.5 text-sm" style={{ color: C.sub }}>{pre}</span>}
      <input value={v}
        onChange={(e) => { const x = parseFloat(e.target.value); set(isNaN(x) ? 0 : x); }}
        className={`${small ? "w-full" : "w-full"} px-2 py-2 outline-none mono text-sm bg-transparent`}
        style={{ color: C.ink, fontWeight: 600 }} step={step} type="number" />
    </div>
  );
}

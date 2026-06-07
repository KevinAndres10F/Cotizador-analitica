import React, { useState } from "react";
import {
  Gauge, Send, CheckCircle2, Loader2, ChevronRight, ChevronLeft,
  Database, Layers, Building2, Lock, Sparkles, FileText,
  BellRing, ShieldCheck, Users,
} from "lucide-react";
import { C } from "../config/colors";
import { supabase } from "../lib/supabase";
import { DEFAULTS } from "../config/defaults";
import { calcularCotizacion, money } from "../pricing/engine";

/* ─── constants ─────────────────────────────────────────────────── */

const SECTORES = [
  "Manufactura", "Retail / Comercio", "Servicios financieros", "Tecnología",
  "Salud", "Educación", "Construcción", "Logística / Transporte",
  "Agroindustria", "Gobierno / ONG", "Otro",
];

const RANGOS_EMPLEADOS = [
  "1 – 50", "51 – 200", "201 – 500", "501 – 1,000", "1,001 – 5,000", "5,000+",
];

const EMPLEADOS_APROX = {
  "1 – 50": 25,
  "51 – 200": 125,
  "201 – 500": 350,
  "501 – 1,000": 750,
  "1,001 – 5,000": 3000,
  "5,000+": 7500,
};

/* Client-friendly diagnostic questions (same ids/scores as PREGUNTAS) */
const DIAGNOSTICO = [
  {
    id: "fuentes", icon: Database,
    q: "¿Cuántos sistemas de nómina manejan actualmente?",
    opciones: [
      { label: "Solo uno", score: 0 },
      { label: "Entre 2 y 3", score: 2 },
      { label: "4 o más", score: 4 },
    ],
  },
  {
    id: "formato", icon: Layers,
    q: "¿En qué formato están disponibles los datos de nómina?",
    opciones: [
      { label: "Base de datos o API estructurada", score: 0 },
      { label: "Archivos Excel o CSV organizados", score: 2 },
      { label: "PDFs, reportes impresos o formatos variados", score: 4 },
    ],
  },
  {
    id: "entidades", icon: Building2,
    q: "¿Cuántas empresas o razones sociales tienen?",
    opciones: [
      { label: "Una sola empresa", score: 0 },
      { label: "De 2 a 5 entidades", score: 2 },
      { label: "6 o más entidades", score: 3 },
    ],
  },
  {
    id: "actualizacion", icon: Gauge,
    q: "¿Con qué frecuencia necesitan actualizar los datos del tablero?",
    opciones: [
      { label: "Una vez al mes, manualmente", score: 0 },
      { label: "Automático periódico (semanal / quincenal)", score: 1 },
      { label: "En tiempo real o conexión continua", score: 3 },
    ],
  },
  {
    id: "anonimizacion", icon: Lock,
    q: "¿Qué nivel de privacidad y cumplimiento necesitan para los datos?",
    opciones: [
      { label: "Uso interno básico, sin restricciones especiales", score: 0 },
      { label: "Datos protegidos por rol y pseudonimizados", score: 2 },
      { label: "Cumplimiento estricto LOPDP / auditoría avanzada", score: 4 },
    ],
  },
  {
    id: "personalizacion", icon: Sparkles,
    q: "¿Cuántos tableros o vistas personalizadas esperan tener?",
    opciones: [
      { label: "Un tablero estándar", score: 0 },
      { label: "Entre 2 y 3 tableros", score: 2 },
      { label: "4 tableros o más", score: 4 },
    ],
  },
  {
    id: "historico", icon: FileText,
    q: "¿Cuántos meses de historial de nómina desean cargar?",
    opciones: [
      { label: "Hasta 12 meses", score: 0 },
      { label: "Entre 13 y 36 meses", score: 2 },
      { label: "Más de 36 meses", score: 3 },
    ],
  },
  {
    id: "salidas", icon: BellRing,
    q: "¿Cómo prefieren recibir alertas e informes?",
    opciones: [
      { label: "Solo en el tablero web", score: 0 },
      { label: "Tablero + notificaciones por correo", score: 1 },
      { label: "Tablero + correo + WhatsApp u otras apps", score: 3 },
    ],
  },
  {
    id: "seguridad", icon: ShieldCheck,
    q: "¿Qué tipo de acceso y seguridad requieren?",
    opciones: [
      { label: "Acceso estándar con usuario y contraseña", score: 0 },
      { label: "Inicio de sesión único (SSO) o bitácora de auditoría", score: 2 },
      { label: "Requisitos de seguridad específicos o instalación local", score: 4 },
    ],
  },
  {
    id: "capacitacion", icon: Users,
    q: "¿Cuánta capacitación y acompañamiento necesitan?",
    opciones: [
      { label: "Entrega básica y guía de uso", score: 0 },
      { label: "Capacitación a un equipo de trabajo", score: 1 },
      { label: "Capacitación en múltiples sedes o equipos", score: 3 },
    ],
  },
];

const HISTORICO_MESES = { 0: 6, 2: 24, 3: 48 };

/* ─── helpers ───────────────────────────────────────────────────── */

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
  * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
  .serif { font-family: 'Fraunces', serif; }
`;

function calcularDiagnostico(respuestas, empleados_rango) {
  const score = Object.values(respuestas).reduce((s, v) => s + (v ?? 0), 0);
  const nivel =
    score >= DEFAULTS.umbralAlta ? "ALTA" : score >= DEFAULTS.umbralMedia ? "MEDIA" : "BAJA";
  const empleados = EMPLEADOS_APROX[empleados_rango] ?? 25;

  // derive mesesHist from historico score
  const histScore = respuestas.historico ?? 0;
  const mesesHist = HISTORICO_MESES[histScore] ?? 6;

  // derive integraciones from fuentes score
  const fuentesScore = respuestas.fuentes ?? 0;
  const integraciones = fuentesScore === 0 ? 1 : fuentesScore === 2 ? 2 : 4;

  // derive entidades count from entidades score
  const entScore = respuestas.entidades ?? 0;
  const entidadesCount = entScore === 0 ? 1 : entScore === 2 ? 3 : 6;

  const cotizacion = calcularCotizacion({
    empleados,
    usuarios: DEFAULTS.usuariosIncluidos,
    mesesHist,
    integraciones,
    kpis: 0,
    reportes: 0,
    nivel,
    cfg: DEFAULTS,
    entidades: Array.from({ length: entidadesCount }, (_, i) => i),
    diluirImpl: false,
    mesesDilucion: 12,
  });

  return { score, nivel, cotizacion };
}

const nivelColor = {
  BAJA: { bg: C.mint, text: C.teal, label: "Complejidad Baja" },
  MEDIA: { bg: "#fef9ec", text: "#92620a", label: "Complejidad Media" },
  ALTA: { bg: "#fef2f2", text: "#b91c1c", label: "Complejidad Alta" },
};

/* ─── sub-components ────────────────────────────────────────────── */

function ProgressBar({ step }) {
  const steps = ["Contacto", "Diagnóstico", "Tu pre-cotización"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
              <div
                className="rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  width: 32, height: 32,
                  background: done ? C.green : active ? C.teal : C.line,
                  color: done || active ? "#fff" : C.sub,
                  transition: "all .25s",
                }}
              >
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span
                className="mt-1 text-center"
                style={{ fontSize: 11, color: active ? C.ink : C.sub, fontWeight: active ? 600 : 400, lineHeight: 1.2 }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? C.green : C.line, margin: "0 4px", marginBottom: 20, transition: "background .25s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

const inputStyle = { border: `1px solid ${C.line}`, background: "#fff" };

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
      style={inputStyle}
    />
  );
}

function RadioGroup({ question, value, onChange }) {
  const Icon = question.icon;
  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ width: 34, height: 34, background: C.mint }}
        >
          <Icon size={17} color={C.teal} />
        </div>
        <p className="text-sm font-medium leading-snug" style={{ color: C.ink, paddingTop: 7 }}>
          {question.q}
        </p>
      </div>
      <div className="space-y-2 pl-1">
        {question.opciones.map((op) => {
          const selected = value === op.score;
          return (
            <label
              key={op.score}
              className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-colors"
              style={{
                background: selected ? C.mint : "transparent",
                border: `1px solid ${selected ? C.teal : C.line}`,
              }}
            >
              <div
                className="rounded-full flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 18, height: 18,
                  border: `2px solid ${selected ? C.teal : C.sub}`,
                  background: selected ? C.teal : "#fff",
                }}
              >
                {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <span className="text-sm" style={{ color: selected ? C.teal : C.ink, fontWeight: selected ? 600 : 400 }}>
                {op.label}
              </span>
              <input
                type="radio"
                name={question.id}
                value={op.score}
                checked={selected}
                onChange={() => onChange(op.score)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */

export default function FormularioPublico() {
  const [step, setStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null); // { score, nivel, cotizacion }

  const [contacto, setContacto] = useState({
    empresa: "", contacto: "", email: "", telefono: "",
    sector: "", empleados_rango: "", mensaje: "",
  });

  const [respuestas, setRespuestas] = useState({});

  const setC = (k, v) => setContacto((f) => ({ ...f, [k]: v }));
  const setR = (id, score) => setRespuestas((r) => ({ ...r, [id]: score }));

  /* ── step 0 validation ── */
  const validarContacto = () => {
    if (!contacto.empresa || !contacto.contacto || !contacto.email) {
      setError("Por favor completa empresa, nombre de contacto y correo electrónico.");
      return false;
    }
    setError("");
    return true;
  };

  /* ── step 1 validation ── */
  const validarDiagnostico = () => {
    const respondidas = DIAGNOSTICO.filter((q) => respuestas[q.id] !== undefined).length;
    if (respondidas < DIAGNOSTICO.length) {
      setError(`Por favor responde todas las preguntas. (${DIAGNOSTICO.length - respondidas} pendiente${DIAGNOSTICO.length - respondidas > 1 ? "s" : ""})`);
      return false;
    }
    setError("");
    return true;
  };

  /* ── final submit ── */
  const handleSubmit = async () => {
    setError("");
    setEnviando(true);
    try {
      const { score, nivel, cotizacion } = calcularDiagnostico(respuestas, contacto.empleados_rango);

      const payload = {
        empresa: contacto.empresa,
        contacto: contacto.contacto,
        email: contacto.email,
        telefono: contacto.telefono,
        sector: contacto.sector,
        empleados_rango: contacto.empleados_rango,
        mensaje: contacto.mensaje,
        diagnostico: { respuestas, score, nivel },
        pre_cotizacion: {
          mensual: cotizacion.mensual,
          implementacion: cotizacion.implCobrable,
          nivel,
        },
        status: "nuevo",
      };

      const { error: dbErr } = await supabase.from("cot_leads").insert(payload);
      if (dbErr) throw dbErr;

      try {
        await supabase.functions.invoke("notify-lead", { body: payload });
      } catch (_) {}

      setResultado({ score, nivel, cotizacion });
      setStep(2);
    } catch (err) {
      setError("Ocurrió un error al enviar. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  /* ── header ── */
  const Header = () => (
    <div style={{ background: C.teal }}>
      <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
        <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: C.green }}>
          <Gauge size={22} color={C.teal} strokeWidth={2.4} />
        </div>
        <div>
          <div className="serif" style={{ color: "#fff", fontSize: 21, fontWeight: 600, lineHeight: 1.1 }}>
            Analítica de Nómina
          </div>
          <div style={{ color: "#9fc9bd", fontSize: 12.5, letterSpacing: ".04em" }}>
            KAPI SERVICE GROUP × MANPOWER
          </div>
        </div>
      </div>
    </div>
  );

  /* ── step 2: confirmation ── */
  if (step === 2 && resultado) {
    return (
      <div style={{ background: C.paper, minHeight: "100vh" }}>
        <style>{FONT_CSS}</style>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <ProgressBar step={2} />

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 rounded-full flex items-center justify-center" style={{ width: 64, height: 64, background: C.mint }}>
              <CheckCircle2 size={32} color={C.teal} />
            </div>
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, color: C.teal }}>
              ¡Gracias, {contacto.contacto.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-sm" style={{ color: C.sub, maxWidth: 420, margin: "8px auto 0" }}>
              Hemos recibido tu información y diagnóstico. Un asesor de KAPI Service Group se pondrá en contacto contigo pronto con una propuesta personalizada.
            </p>
          </div>

          <div className="rounded-2xl p-6 mb-5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <h2 className="serif mb-3" style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>
              ¿Qué sigue?
            </h2>
            <div className="space-y-3">
              {[
                ["1", "Revisamos tu diagnóstico", "Nuestro equipo analiza las respuestas para dimensionar tu proyecto."],
                ["2", "Te contactamos", "Un asesor te presentará una propuesta detallada y personalizada."],
                ["3", "Arrancamos juntos", "Definimos el plan de implementación y comenzamos a trabajar."],
              ].map(([n, title, desc]) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ width: 28, height: 28, background: C.mint, color: C.teal, fontSize: 13, fontWeight: 700 }}>
                    {n}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600, color: C.ink }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.sub }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 text-center" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <p className="text-sm font-semibold" style={{ color: C.ink }}>¿Deseas agilizar el proceso?</p>
            <p className="text-xs mt-1 mb-3" style={{ color: C.sub }}>
              Escríbenos directamente y te atendemos de inmediato.
            </p>
            <a
              href="mailto:info@kapisg.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ background: C.teal, color: "#fff" }}
            >
              <Send size={15} /> Contactar a un asesor
            </a>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: C.sub }}>
            KAPI Service Group · Quito, Ecuador — Tu información es confidencial
          </p>
        </div>
      </div>
    );
  }

  /* ── step 0: contact info ── */
  if (step === 0) {
    return (
      <div style={{ background: C.paper, minHeight: "100vh" }}>
        <style>{FONT_CSS}</style>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-8">
          <ProgressBar step={0} />

          <div className="mb-6">
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
              Solicita tu cotización
            </h1>
            <p className="mt-2 text-sm" style={{ color: C.sub }}>
              Completa el formulario y generaremos una pre-cotización basada en el perfil de tu empresa.
            </p>
          </div>

          <div className="space-y-5">
            {/* Contact data */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Datos de contacto</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Empresa" required>
                  <Input value={contacto.empresa} onChange={(e) => setC("empresa", e.target.value)} placeholder="Nombre de la empresa" />
                </Field>
                <Field label="Contacto" required>
                  <Input value={contacto.contacto} onChange={(e) => setC("contacto", e.target.value)} placeholder="Nombre completo" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Correo electrónico" required>
                  <Input type="email" value={contacto.email} onChange={(e) => setC("email", e.target.value)} placeholder="correo@empresa.com" />
                </Field>
                <Field label="Teléfono">
                  <Input value={contacto.telefono} onChange={(e) => setC("telefono", e.target.value)} placeholder="+593 ..." />
                </Field>
              </div>
            </div>

            {/* Company info */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Sobre tu empresa</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Sector">
                  <select
                    value={contacto.sector}
                    onChange={(e) => setC("sector", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">Seleccionar...</option>
                    {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Cantidad de empleados">
                  <select
                    value={contacto.empleados_rango}
                    onChange={(e) => setC("empleados_rango", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="">Seleccionar...</option>
                    {RANGOS_EMPLEADOS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Mensaje (opcional)">
                <textarea
                  value={contacto.mensaje}
                  onChange={(e) => setC("mensaje", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={inputStyle}
                  placeholder="Cuéntanos qué necesitas o qué retos tienes con tu nómina..."
                />
              </Field>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => { if (validarContacto()) setStep(1); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition"
              style={{ background: C.teal, color: "#fff", fontWeight: 700 }}
            >
              Continuar al diagnóstico <ChevronRight size={18} />
            </button>

            <p className="text-center text-xs" style={{ color: C.sub }}>
              KAPI Service Group · Quito, Ecuador — Tu información es confidencial
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── step 1: diagnostic ── */
  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <style>{FONT_CSS}</style>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <ProgressBar step={1} />

        <div className="mb-6">
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
            Diagnóstico rápido
          </h1>
          <p className="mt-2 text-sm" style={{ color: C.sub }}>
            Estas {DIAGNOSTICO.length} preguntas nos ayudan a calcular una pre-cotización ajustada a tu realidad. Solo toma 2 minutos.
          </p>
        </div>

        <div className="space-y-4">
          {DIAGNOSTICO.map((q) => (
            <RadioGroup
              key={q.id}
              question={q}
              value={respuestas[q.id]}
              onChange={(score) => setR(q.id, score)}
            />
          ))}

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setError(""); setStep(0); }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm transition"
              style={{ background: "#fff", color: C.teal, fontWeight: 600, border: `1px solid ${C.line}` }}
            >
              <ChevronLeft size={17} /> Volver
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => { if (validarDiagnostico()) handleSubmit(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition"
              style={{ background: C.teal, color: "#fff", fontWeight: 700, opacity: enviando ? 0.7 : 1 }}
            >
              {enviando
                ? <><Loader2 size={18} className="animate-spin" /> Calculando...</>
                : <><Send size={18} /> Ver mi pre-cotización</>
              }
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: C.sub }}>
            KAPI Service Group · Quito, Ecuador — Tu información es confidencial
          </p>
        </div>
      </div>
    </div>
  );
}

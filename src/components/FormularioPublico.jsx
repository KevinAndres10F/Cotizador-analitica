import React, { useState } from "react";
import {
  Send, CheckCircle2, Loader2, Building2, Users, Database,
  Layers, CalendarClock, Target, MessageSquare, Mail, Phone, Briefcase,
} from "lucide-react";
import { C } from "../config/colors";
import { supabase } from "../lib/supabase";

/* ─────────────────────────────────────────────────────────────────────
   Formulario PÚBLICO de captación de leads.

   ⚠️ Por diseño NO contiene NADA de precio, complejidad, puntajes ni
   lógica de cálculo. Solo recoge datos de contacto y respuestas en
   lenguaje natural y las inserta en la tabla `leads` de Supabase.
   El mapeo a complejidad/cotización ocurre del lado interno/servidor.
   ───────────────────────────────────────────────────────────────────── */

const SECTORES = [
  "Manufactura", "Retail / Comercio", "Servicios financieros", "Tecnología",
  "Salud", "Educación", "Construcción", "Logística / Transporte",
  "Agroindustria", "Gobierno / ONG", "Otro",
];

/* Preguntas amigables — las opciones son TEXTO (sin puntajes). */
const OPCIONES_EMPRESAS = ["Una sola empresa", "Entre 2 y 5", "6 o más", "No estoy seguro"];
const OPCIONES_EMPLEADOS = [
  "Menos de 50", "Entre 50 y 200", "Entre 200 y 500",
  "Entre 500 y 1.000", "Más de 1.000", "No estoy seguro",
];
const OPCIONES_FORMATO = ["Sistema o plataforma", "Archivos Excel / CSV", "No estoy seguro"];
const OPCIONES_FRECUENCIA = ["Cada mes", "Cada quincena", "Cada semana", "No estoy seguro"];

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
  * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
  .serif { font-family: 'Fraunces', serif; }
`;

const inputStyle = { border: `1px solid ${C.line}`, background: "#fff" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── sub-componentes ─────────────────────────────────────────────── */

function BrandHeader() {
  return (
    <div style={{ background: C.grad }}>
      <div className="max-w-2xl mx-auto px-6 py-5">
        {/* Logo oficial horizontal de ManpowerGroup sobre tarjeta blanca
            (el wordmark es azul y necesita fondo claro para ser legible). */}
        <div className="inline-flex items-center rounded-xl px-3.5 py-2.5" style={{ background: "#fff" }}>
          <img
            src="/MPG_BE_Logo_SS_HOR_MC_RGB_REG.png"
            alt="ManpowerGroup"
            style={{ height: 30, width: "auto", display: "block" }}
          />
        </div>
        <div style={{ color: "#c3d4ea", fontSize: 12.5, letterSpacing: ".04em", marginTop: 10 }}>
          ANALÍTICA DE NÓMINA · POWERED BY KAPI SERVICE GROUP
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: C.sub, fontWeight: 600 }}>
        {Icon && <Icon size={13} />}
        {label}{required && <span style={{ color: C.green2 }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
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

function Select({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
      style={{ ...inputStyle, color: value ? C.ink : C.sub }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ─── componente principal ────────────────────────────────────────── */

export default function FormularioPublico() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "", empresa: "", correo: "", telefono: "", sector: "",
    num_empresas: "", num_empleados: "", formato_datos: "", frecuencia: "",
    objetivos: "", notas: "",
    website: "", // honeypot anti-spam (debe quedar vacío)
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validar = () => {
    if (!form.nombre.trim() || !form.empresa.trim() || !form.correo.trim() || !form.telefono.trim()) {
      setError("Por favor completa tu nombre, empresa, correo y teléfono.");
      return false;
    }
    if (!EMAIL_RE.test(form.correo.trim())) {
      setError("El correo no parece válido. Revísalo, por favor.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    // Honeypot: si está lleno, es bot → fingimos éxito sin insertar.
    if (form.website) { setEnviado(true); return; }

    setEnviando(true);
    setError("");
    try {
      const payload = {
        nombre: form.nombre.trim(),
        empresa: form.empresa.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        sector: form.sector || null,
        num_empresas: form.num_empresas || null,
        num_empleados: form.num_empleados || null,
        formato_datos: form.formato_datos || null,
        frecuencia: form.frecuencia || null,
        objetivos: form.objetivos.trim() || null,
        notas: form.notas.trim() || null,
        // `estado` lo asigna la base de datos con default 'nuevo'.
      };

      // Solo INSERT (sin .select(): RLS impide leer de vuelta desde el público).
      const { error: dbErr } = await supabase.from("leads").insert(payload);
      if (dbErr) throw dbErr;

      setEnviado(true);
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      setError("Ocurrió un error al enviar. Por favor intenta de nuevo en un momento.");
    } finally {
      setEnviando(false);
    }
  };

  /* ── pantalla de confirmación ── */
  if (enviado) {
    return (
      <div style={{ background: C.paper, minHeight: "100vh" }}>
        <style>{FONT_CSS}</style>
        <BrandHeader />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 rounded-full flex items-center justify-center" style={{ width: 72, height: 72, background: C.mint }}>
              <CheckCircle2 size={38} color={C.teal} />
            </div>
            <h1 className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.teal }}>
              ¡Gracias{form.nombre ? `, ${form.nombre.split(" ")[0]}` : ""}!
            </h1>
            <p className="mt-3 text-sm" style={{ color: C.sub, maxWidth: 440, margin: "12px auto 0", lineHeight: 1.6 }}>
              Recibimos tu información. Nuestro equipo de ManpowerGroup (powered by Kapi Service Group)
              revisará lo que nos compartiste y te contactará pronto para conversar sobre tu tablero
              de analítica de nómina.
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <h2 className="serif mb-3" style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>¿Qué sigue?</h2>
            <div className="space-y-3">
              {[
                ["1", "Revisamos tu solicitud", "Analizamos lo que nos contaste sobre tu nómina."],
                ["2", "Te contactamos", "Un asesor se comunicará contigo para entender mejor tus necesidades."],
                ["3", "Diseñamos tu propuesta", "Definimos juntos el tablero ideal para tu empresa."],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex items-start gap-3">
                  <div className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ width: 28, height: 28, background: C.mint, color: C.teal, fontSize: 13, fontWeight: 700 }}>
                    {num}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600, color: C.ink }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.sub }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: C.sub }}>
            ManpowerGroup · Powered by Kapi Service Group — Tu información es confidencial
          </p>
        </div>
      </div>
    );
  }

  /* ── formulario ── */
  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <style>{FONT_CSS}</style>
      <BrandHeader />

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="serif" style={{ fontSize: 27, fontWeight: 700, color: C.ink }}>
            Cuéntanos sobre tu nómina
          </h1>
          <p className="mt-2 text-sm" style={{ color: C.sub, lineHeight: 1.6 }}>
            Déjanos tus datos y unas respuestas rápidas. Con eso preparamos una propuesta de
            tablero de analítica de nómina a tu medida. Solo toma un par de minutos.
          </p>
        </div>

        {/* Datos de contacto */}
        <div className="rounded-2xl p-6 space-y-4 mb-5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Tus datos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre y apellido" required icon={Users}>
              <TextInput value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Tu nombre completo" />
            </Field>
            <Field label="Empresa" required icon={Building2}>
              <TextInput value={form.empresa} onChange={(e) => set("empresa", e.target.value)} placeholder="Nombre de tu empresa" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Correo" required icon={Mail}>
              <TextInput type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} placeholder="correo@empresa.com" />
            </Field>
            <Field label="Teléfono / WhatsApp" required icon={Phone}>
              <TextInput value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+593 ..." />
            </Field>
          </div>

          <Field label="Sector / industria" icon={Briefcase}>
            <Select value={form.sector} onChange={(e) => set("sector", e.target.value)}
              placeholder="Selecciona tu sector (opcional)" options={SECTORES} />
          </Field>
        </div>

        {/* Preguntas amigables */}
        <div className="rounded-2xl p-6 space-y-4 mb-5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Sobre tu nómina hoy</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="¿Cuántas empresas o razones sociales manejan en su nómina?" icon={Building2}>
              <Select value={form.num_empresas} onChange={(e) => set("num_empresas", e.target.value)}
                placeholder="Selecciona una opción" options={OPCIONES_EMPRESAS} />
            </Field>
            <Field label="¿Aproximadamente cuántas personas tienen en nómina?" icon={Users}>
              <Select value={form.num_empleados} onChange={(e) => set("num_empleados", e.target.value)}
                placeholder="Selecciona un rango" options={OPCIONES_EMPLEADOS} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="¿Cómo entregan hoy la información de nómina?" icon={Database}>
              <Select value={form.formato_datos} onChange={(e) => set("formato_datos", e.target.value)}
                placeholder="Selecciona una opción" options={OPCIONES_FORMATO} />
            </Field>
            <Field label="¿Cada cuánto se actualiza la información?" icon={CalendarClock}>
              <Select value={form.frecuencia} onChange={(e) => set("frecuencia", e.target.value)}
                placeholder="Selecciona una opción" options={OPCIONES_FRECUENCIA} />
            </Field>
          </div>

          <Field label="¿Qué les gustaría poder ver o medir con un tablero?" icon={Target}>
            <textarea
              value={form.objetivos}
              onChange={(e) => set("objetivos", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={inputStyle}
              placeholder="Ej. costos de nómina por área, rotación, horas extra, ausentismo..."
            />
          </Field>

          <Field label="¿Algo más que debamos saber?" icon={MessageSquare}>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={inputStyle}
              placeholder="Opcional — cualquier detalle que nos ayude a entender tu caso."
            />
          </Field>
        </div>

        {/* Honeypot oculto — los humanos no lo ven; los bots tienden a llenarlo. */}
        <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
          <label>
            No llenar este campo
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="rounded-xl p-3 text-sm mb-4" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition"
          style={{ background: C.orange, color: "#fff", fontWeight: 700, opacity: enviando ? 0.7 : 1 }}
        >
          {enviando
            ? <><Loader2 size={18} className="animate-spin" /> Enviando...</>
            : <><Send size={18} /> Solicitar diagnóstico</>
          }
        </button>

        <p className="text-center text-xs mt-6" style={{ color: C.sub }}>
          ManpowerGroup · Powered by Kapi Service Group — Tu información es confidencial
        </p>
      </form>
    </div>
  );
}

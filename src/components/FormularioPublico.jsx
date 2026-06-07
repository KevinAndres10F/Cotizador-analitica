import React, { useState } from "react";
import { Gauge, Send, CheckCircle2, Loader2 } from "lucide-react";
import { C } from "../config/colors";
import { supabase } from "../lib/supabase";

const SECTORES = [
  "Manufactura", "Retail / Comercio", "Servicios financieros", "Tecnología",
  "Salud", "Educación", "Construcción", "Logística / Transporte",
  "Agroindustria", "Gobierno / ONG", "Otro",
];

const RANGOS_EMPLEADOS = [
  "1 – 50", "51 – 200", "201 – 500", "501 – 1,000", "1,001 – 5,000", "5,000+",
];

export default function FormularioPublico() {
  const [form, setForm] = useState({
    empresa: "", contacto: "", email: "", telefono: "", sector: "", empleados_rango: "", mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.empresa || !form.contacto || !form.email) {
      setError("Por favor completa empresa, contacto y correo.");
      return;
    }
    setEnviando(true);
    try {
      const { error: dbErr } = await supabase.from("cot_leads").insert({
        empresa: form.empresa,
        contacto: form.contacto,
        email: form.email,
        telefono: form.telefono,
        sector: form.sector,
        empleados_rango: form.empleados_rango,
        mensaje: form.mensaje,
        status: "nuevo",
      });
      if (dbErr) throw dbErr;

      try {
        await supabase.functions.invoke("notify-lead", { body: form });
      } catch (_) {}

      setEnviado(true);
    } catch (err) {
      setError("Error al enviar. Intenta de nuevo.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div style={{ background: C.paper, minHeight: "100vh" }} className="flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
          * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
          .serif { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 rounded-full flex items-center justify-center" style={{ width: 64, height: 64, background: C.mint }}>
            <CheckCircle2 size={32} color={C.teal} />
          </div>
          <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, color: C.teal }}>¡Gracias por tu interés!</h1>
          <p className="mt-3 text-sm" style={{ color: C.sub }}>
            Hemos recibido tu información. Un asesor de KAPI Service Group se comunicará contigo pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
        .serif { font-family: 'Fraunces', serif; }
      `}</style>

      <div style={{ background: C.teal }}>
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center gap-3">
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

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
            Solicita tu cotización
          </h1>
          <p className="mt-2 text-sm" style={{ color: C.sub }}>
            Completa el formulario y un asesor se pondrá en contacto contigo con una propuesta personalizada de analítica de nómina.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <h2 className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Datos de contacto</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Empresa *</label>
                <input value={form.empresa} onChange={(e) => set("empresa", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}` }} placeholder="Nombre de la empresa" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Contacto *</label>
                <input value={form.contacto} onChange={(e) => set("contacto", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}` }} placeholder="Nombre completo" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Correo electrónico *</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}` }} placeholder="correo@empresa.com" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Teléfono</label>
                <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}` }} placeholder="+593 ..." />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <h2 className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Sobre tu empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Sector</label>
                <select value={form.sector} onChange={(e) => set("sector", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                  <option value="">Seleccionar...</option>
                  {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Cantidad de empleados</label>
                <select value={form.empleados_rango} onChange={(e) => set("empleados_rango", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                  <option value="">Seleccionar...</option>
                  {RANGOS_EMPLEADOS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: C.sub, fontWeight: 600 }}>Mensaje (opcional)</label>
              <textarea value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)}
                rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ border: `1px solid ${C.line}` }}
                placeholder="Cuéntanos qué necesitas o qué retos tienes con tu nómina..." />
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition"
            style={{ background: C.teal, color: "#fff", fontWeight: 700, opacity: enviando ? 0.7 : 1 }}>
            {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>

          <p className="text-center text-xs" style={{ color: C.sub }}>
            KAPI Service Group · Quito, Ecuador — Tu información es confidencial
          </p>
        </form>
      </div>
    </div>
  );
}

import React from "react";
import { Settings2 } from "lucide-react";
import { C } from "../../config/colors";
import { Card, Field, NumInput } from "../ui";
import { DEFAULTS } from "../../config/defaults";

export default function TarifasTab({ cfg, setCfg }) {
  return (
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
          <Field label="Recargo por entidad adicional">
            <NumInput v={cfg.recargoPorEntidad} pre="$" set={(x) => setCfg({ ...cfg, recargoPorEntidad: x })} small />
          </Field>
          <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700 }}>COBRO DE IMPLEMENTACIÓN</div>
          <Field label="Se cobra desde nivel">
            <div className="flex gap-2">
              {["BAJA", "MEDIA", "ALTA"].map((n) => {
                const active = cfg.implNivel === n;
                const colMap = { BAJA: C.green2, MEDIA: C.orange, ALTA: "#c0392b" };
                return (
                  <button key={n} onClick={() => setCfg({ ...cfg, implNivel: n })}
                    className="flex-1 py-2 rounded-xl text-sm transition"
                    style={{
                      background: active ? colMap[n] + "18" : C.paper,
                      border: `1.5px solid ${active ? colMap[n] : C.line}`,
                      color: active ? colMap[n] : C.sub,
                      fontWeight: active ? 700 : 500,
                    }}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="text-xs mt-1.5" style={{ color: C.sub }}>
              {cfg.implNivel === "BAJA" && "Todos los niveles pagan implementación"}
              {cfg.implNivel === "MEDIA" && "MEDIA y ALTA pagan implementación · BAJA sin cargo"}
              {cfg.implNivel === "ALTA" && "Solo ALTA paga implementación · BAJA y MEDIA sin cargo"}
            </div>
          </Field>

          <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700 }}>RECARGO POR ESCALA (empleados)</div>
          {cfg.recargoEscala.map((b, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-1.5">
              <span className="text-sm mono" style={{ color: C.sub }}>
                ≤ {b.hasta === Infinity ? "∞" : b.hasta.toLocaleString("es-EC")}
              </span>
              <NumInput v={b.monto} pre="$" step={50}
                set={(x) => { const nr = [...cfg.recargoEscala]; nr[i] = { ...nr[i], monto: x }; setCfg({ ...cfg, recargoEscala: nr }); }} small />
            </div>
          ))}

          <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700 }}>RECARGO POR HISTÓRICO (meses)</div>
          {cfg.recargoHistorico.map((b, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-1.5">
              <span className="text-sm mono" style={{ color: C.sub }}>
                ≤ {b.hasta === Infinity ? "∞" : b.hasta} meses
              </span>
              <NumInput v={b.monto} pre="$" step={50}
                set={(x) => { const nr = [...cfg.recargoHistorico]; nr[i] = { ...nr[i], monto: x }; setCfg({ ...cfg, recargoHistorico: nr }); }} small />
            </div>
          ))}

          <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700 }}>UMBRALES DE COMPLEJIDAD (puntos)</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`MEDIA ≥`}><NumInput v={cfg.umbralMedia} set={(x) => setCfg({ ...cfg, umbralMedia: x })} small /></Field>
            <Field label={`ALTA ≥`}><NumInput v={cfg.umbralAlta} set={(x) => setCfg({ ...cfg, umbralAlta: x })} small /></Field>
          </div>
        </Card>
      </div>

      {/* Revenue split config */}
      <Card>
        <h3 className="serif mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Revenue split (Manpower / KAPI)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Modo de reparto">
            <select value={cfg.splitMode} onChange={(e) => setCfg({ ...cfg, splitMode: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: `1px solid ${C.line}`, background: C.paper }}>
              <option value="fijo">Porcentaje fijo</option>
              <option value="bandas">Por bandas de empleados</option>
            </select>
          </Field>
          {cfg.splitMode === "fijo" ? (
            <Field label="% Manpower" hint={`KAPI: ${((1 - cfg.splitManpower) * 100).toFixed(0)}%`}>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} value={cfg.splitManpower * 100}
                  onChange={(e) => setCfg({ ...cfg, splitManpower: parseInt(e.target.value) / 100 })}
                  className="flex-1" />
                <span className="mono text-sm" style={{ fontWeight: 700, color: C.orange, minWidth: 40, textAlign: "right" }}>
                  {(cfg.splitManpower * 100).toFixed(0)}%
                </span>
              </div>
            </Field>
          ) : (
            <div className="space-y-2">
              <div className="text-xs" style={{ color: C.sub, fontWeight: 700 }}>MARGEN MANPOWER POR BANDA</div>
              {cfg.margenManpower.map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-sm mono" style={{ color: C.sub }}>
                    ≤ {b.hasta === Infinity ? "∞" : b.hasta} emp
                  </span>
                  <NumInput v={Math.round(b.pct * 100)} step={5}
                    set={(x) => {
                      const nm = [...cfg.margenManpower];
                      nm[i] = { ...nm[i], pct: x / 100 };
                      setCfg({ ...cfg, margenManpower: nm });
                    }} small />
                  <span className="text-xs" style={{ color: C.sub }}>%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <button onClick={() => setCfg(DEFAULTS)}
        className="text-sm px-4 py-2 rounded-xl" style={{ border: `1px solid ${C.line}`, color: C.sub }}>
        Restablecer valores por defecto
      </button>
    </div>
  );
}

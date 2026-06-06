import React from "react";
import { AlertTriangle, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid,
} from "recharts";
import { C } from "../../config/colors";
import { Card, Stepper } from "../ui";
import { money, money2, tramoSuma } from "../../pricing/engine";
import { PREGUNTAS } from "../../config/defaults";

export default function CotizacionTab({ q, cfg, empleados, nivel, nivelColor, respondidas, vista, diluirImpl, setDiluirImpl, mesesDilucion, setMesesDilucion, integraciones, kpis, reportes, mesesHist, entidades }) {
  const curva = React.useMemo(() => {
    const maxX = Math.max(1200, Math.ceil((empleados * 1.6) / 100) * 100);
    const pts = [];
    for (let x = 0; x <= maxX; x += Math.max(20, Math.round(maxX / 60))) {
      const tramos = tramoSuma(x, cfg.brackets);
      const m = Math.max(cfg.pisoMensual, cfg.basePlataforma + tramos);
      pts.push({ emp: x, mensual: Math.round(m) });
    }
    return pts;
  }, [empleados, cfg]);

  return (
    <div className="space-y-6 print-full">
      {respondidas < PREGUNTAS.length && (
        <div className="no-print rounded-xl p-3.5 flex items-center gap-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
          <AlertTriangle size={18} color={C.orange} />
          <span className="text-sm" style={{ color: "#9a3412" }}>
            Faltan {PREGUNTAS.length - respondidas} preguntas del diagnóstico. La complejidad puede cambiar el costo de implementación.
          </span>
        </div>
      )}

      {/* prorrateo toggle */}
      <Card pad="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>Prorrateo de implementación</div>
            <div className="text-xs" style={{ color: C.sub }}>
              {diluirImpl
                ? `Implementación (${money(q.implementacion)}) diluida en ${mesesDilucion} meses = ${money2(q.prorrateoPorMes)}/mes adicional`
                : "Implementación se cobra como pago único separado"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {diluirImpl && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: C.sub }}>Meses:</span>
                <Stepper value={mesesDilucion} onChange={setMesesDilucion} min={6} max={60} step={6} />
              </div>
            )}
            <button onClick={() => setDiluirImpl(!diluirImpl)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition"
              style={{ background: diluirImpl ? C.mint : C.paper, border: `1px solid ${diluirImpl ? C.green2 : C.line}`, color: diluirImpl ? C.green2 : C.sub, fontWeight: 600 }}>
              {diluirImpl ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {diluirImpl ? "Activo" : "Inactivo"}
            </button>
          </div>
        </div>
      </Card>

      {/* totales */}
      <div className={`grid grid-cols-1 ${diluirImpl ? "" : "sm:grid-cols-2"} gap-4`}>
        <div className="rounded-2xl p-5" style={{ background: C.teal }}>
          <div className="text-xs" style={{ color: "#9fc9bd", letterSpacing: ".05em" }}>
            {diluirImpl ? "SUSCRIPCIÓN MENSUAL · INCLUYE IMPLEMENTACIÓN" : "SUSCRIPCIÓN MENSUAL"}
          </div>
          <div className="serif mt-1" style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {money(q.mensualEfectiva)}<span style={{ fontSize: 16, color: "#9fc9bd" }}>/mes</span>
          </div>
          <div className="mono text-xs mt-1.5" style={{ color: "#9fc9bd" }}>
            ≈ {money2(q.mensualEfectiva / Math.max(1, empleados))}/empleado
            {diluirImpl && " (incl. implementación)"}
          </div>
          {diluirImpl && (
            <div className="text-xs mt-2 rounded-lg px-2.5 py-1.5 inline-block" style={{ background: "rgba(255,255,255,.1)", color: "#9fc9bd" }}>
              Base: {money(q.mensual)} + Prorrateo: {money2(q.prorrateoPorMes)}/mes × {mesesDilucion}m
            </div>
          )}
        </div>
        {!diluirImpl && (
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.orange}` }}>
            <div className="text-xs" style={{ color: C.orange, letterSpacing: ".05em" }}>IMPLEMENTACIÓN · ÚNICO PAGO</div>
            <div className="serif mt-1" style={{ fontSize: 36, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
              {money(q.implementacion)}
            </div>
            <div className="text-xs mt-1.5" style={{ color: C.sub }}>
              Complejidad <b style={{ color: nivelColor }}>{nivel}</b>
            </div>
          </div>
        )}
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
        {diluirImpl && (
          <div className="flex justify-between py-1.5 text-sm" style={{ borderBottom: `1px solid ${C.paper}` }}>
            <span style={{ color: C.orange }}>+ Prorrateo implementación ({mesesDilucion}m)</span>
            <span className="mono" style={{ fontWeight: 600, color: C.orange }}>{money2(q.prorrateoPorMes)}</span>
          </div>
        )}
        <div className="flex justify-between py-2 text-sm" style={{ fontWeight: 700 }}>
          <span>Total mensual</span><span className="mono" style={{ color: C.teal }}>{money2(q.mensualEfectiva)}</span>
        </div>

        <div className="text-xs mt-4 mb-2" style={{ color: C.sub, fontWeight: 700, letterSpacing: ".04em" }}>
          {diluirImpl ? "IMPLEMENTACIÓN (PRORRATEADA)" : "IMPLEMENTACIÓN"}
        </div>
        {[
          [`Base por complejidad (${nivel})`, q.base],
          q.recEscala > 0 ? ["Recargo por escala", q.recEscala] : null,
          q.recHist > 0 ? [`Migración de histórico (${mesesHist} m)`, q.recHist] : null,
          q.recEntidades > 0 ? [`Entidades adicionales (${entidades.length - 1})`, q.recEntidades] : null,
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
        {diluirImpl && (
          <div className="text-xs mt-1 px-3 py-2 rounded-lg" style={{ background: C.mint, color: C.teal }}>
            Implementación incluida en la mensualidad durante {mesesDilucion} meses. No hay pago único separado.
          </div>
        )}
      </Card>

      {/* anual */}
      <Card pad="p-4" style={{ background: C.mint, border: "none" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: C.teal, fontWeight: 700, letterSpacing: ".04em" }}>PROYECCIÓN ANUAL</div>
            <div className="text-xs mt-1" style={{ color: C.sub }}>
              {money(q.mensualEfectiva)} × 12 meses
            </div>
          </div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: C.teal }}>
            {money(q.anualTotal)}<span className="text-sm" style={{ color: C.sub }}>/año</span>
          </div>
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
              <div className="text-xs mb-1" style={{ color: C.sub }}>Mensual · split {(q.margen * 100).toFixed(0)}%</div>
              <div className="flex justify-between"><span>Manpower</span><span className="mono" style={{ fontWeight: 700, color: C.orange }}>{money2(q.mpMensual)}</span></div>
              <div className="flex justify-between"><span>KAPI</span><span className="mono" style={{ fontWeight: 700, color: C.teal }}>{money2(q.kapiMensual)}</span></div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: C.sub }}>Anual</div>
              <div className="flex justify-between"><span>Manpower</span><span className="mono" style={{ fontWeight: 700, color: C.orange }}>{money2(q.mpAnual)}</span></div>
              <div className="flex justify-between"><span>KAPI</span><span className="mono" style={{ fontWeight: 700, color: C.teal }}>{money2(q.kapiAnual)}</span></div>
            </div>
          </div>
          {!diluirImpl && (
            <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3" style={{ borderTop: "1px solid #fde2c0" }}>
              <div>
                <div className="text-xs mb-1" style={{ color: C.sub }}>Implementación</div>
                <div className="flex justify-between"><span>Manpower</span><span className="mono" style={{ fontWeight: 700, color: C.orange }}>{money2(q.mpImpl)}</span></div>
                <div className="flex justify-between"><span>KAPI</span><span className="mono" style={{ fontWeight: 700, color: C.teal }}>{money2(q.kapiImpl)}</span></div>
              </div>
            </div>
          )}
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
  );
}

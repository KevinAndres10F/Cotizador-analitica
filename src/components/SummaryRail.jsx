import React from "react";
import { ArrowRight, Eye } from "lucide-react";
import { C } from "../config/colors";
import { Card, RailRow } from "./ui";
import { money, money2 } from "../pricing/engine";

export default function SummaryRail({ cliente, empleados, usuarios, nivel, nivelColor, q, vista, tab, setTab }) {
  return (
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
              <span className="text-xs" style={{ color: "#9fc9bd" }}>
                {q.prorrateoActivo ? "Mensual (c/ impl.)" : "Mensual"}
              </span>
              <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {money(q.mensualEfectiva)}
              </span>
            </div>
            {q.cobraImpl && !q.prorrateoActivo && (
              <div className="flex justify-between items-end">
                <span className="text-xs" style={{ color: "#9fc9bd" }}>Implementación</span>
                <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{money(q.implCobrable)}</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", margin: "6px 0" }} />
            <div className="flex justify-between items-end">
              <span className="text-xs" style={{ color: "#9fc9bd" }}>Anual</span>
              <span className="serif" style={{ fontSize: 18, fontWeight: 700, color: C.green }}>
                {money(q.anualTotal)}
              </span>
            </div>
          </div>
        </Card>

        {vista === "interna" && (
          <Card pad="p-4" style={{ background: "#fffaf4", border: "1px solid #fde2c0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} color={C.orange} />
              <div className="text-xs" style={{ color: C.orange, fontWeight: 700 }}>
                SPLIT · {(q.margen * 100).toFixed(0)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><div style={{ color: C.sub }}>Manpower/mes</div><div className="mono" style={{ fontWeight: 700, color: C.orange }}>{money(q.mpMensual)}</div></div>
              <div><div style={{ color: C.sub }}>KAPI/mes</div><div className="mono" style={{ fontWeight: 700, color: C.teal }}>{money(q.kapiMensual)}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div><div style={{ color: C.sub }}>Manpower/año</div><div className="mono" style={{ fontWeight: 700, color: C.orange }}>{money(q.mpAnual)}</div></div>
              <div><div style={{ color: C.sub }}>KAPI/año</div><div className="mono" style={{ fontWeight: 700, color: C.teal }}>{money(q.kapiAnual)}</div></div>
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
  );
}

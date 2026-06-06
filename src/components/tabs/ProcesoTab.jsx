import React from "react";
import { ClipboardCheck, Lock, CheckCircle2, Circle } from "lucide-react";
import { C } from "../../config/colors";
import { Card } from "../ui";
import { RUTA, ANONIMIZACION, CHECKLIST } from "../../config/defaults";

export default function ProcesoTab({ check, setCheck }) {
  return (
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
  );
}

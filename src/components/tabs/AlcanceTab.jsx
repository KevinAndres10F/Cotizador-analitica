import React from "react";
import { Lock } from "lucide-react";
import { C } from "../../config/colors";
import { Card, Stepper } from "../ui";
import { money } from "../../pricing/engine";
import { ANONIMIZACION } from "../../config/defaults";

export default function AlcanceTab({ mesesHist, setMesesHist, integraciones, setIntegraciones, kpis, setKpis, reportes, setReportes, cfg }) {
  return (
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
  );
}

import React from "react";
import { C } from "../../config/colors";
import { Card } from "../ui";
import { PREGUNTAS } from "../../config/defaults";

export default function DiagnosticoTab({ resp, setResp, score, maxScore, respondidas, nivel, nivelColor }) {
  return (
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
  );
}

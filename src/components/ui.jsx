import React from "react";
import { Plus, Minus } from "lucide-react";
import { C } from "../config/colors";

export function Stepper({ value, onChange, min = 0, max = 9999, step = 1 }) {
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

export function Field({ label, hint, children }) {
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

export function Card({ children, pad = "p-5", style }) {
  return (
    <div className={`rounded-2xl ${pad}`} style={{ background: "#fff", border: `1px solid ${C.line}`, ...style }}>
      {children}
    </div>
  );
}

export function RailRow({ l, v, c, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "#9fc9bd" }}>{l}</span>
      <span className="mono" style={{ color: c || "#fff", fontWeight: bold ? 700 : 500 }}>{v}</span>
    </div>
  );
}

export function NumInput({ v, set, pre, step = 1, small }) {
  return (
    <div className="inline-flex items-center rounded-xl overflow-hidden w-full" style={{ border: `1px solid ${C.line}`, background: C.paper }}>
      {pre && <span className="pl-2.5 text-sm" style={{ color: C.sub }}>{pre}</span>}
      <input value={v}
        onChange={(e) => { const x = parseFloat(e.target.value); set(isNaN(x) ? 0 : x); }}
        className={`w-full px-2 py-2 outline-none mono text-sm bg-transparent`}
        style={{ color: C.ink, fontWeight: 600 }} step={step} type="number" />
    </div>
  );
}

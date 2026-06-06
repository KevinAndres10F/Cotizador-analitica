import React from "react";
import { Gauge, Eye, EyeOff, Printer, FileSpreadsheet, FileDown, Save, FolderOpen, Loader2 } from "lucide-react";
import { C } from "../config/colors";

export default function Header({ vista, setVista, onPrint, onExportExcel, onExportCSV, onSave, onLoad, saving }) {
  return (
    <div className="no-print" style={{ background: C.teal }}>
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: C.green }}>
            <Gauge size={22} color={C.teal} strokeWidth={2.4} />
          </div>
          <div>
            <div className="serif" style={{ color: "#fff", fontSize: 21, fontWeight: 600, lineHeight: 1.1 }}>
              Analítica de Nómina
            </div>
            <div style={{ color: "#9fc9bd", fontSize: 12.5, letterSpacing: ".04em" }}>
              COTIZADOR · KAPI SERVICE GROUP × MANPOWER
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setVista(vista === "cliente" ? "interna" : "cliente")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: vista === "interna" ? C.orange : "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600 }}>
            {vista === "interna" ? <Eye size={15} /> : <EyeOff size={15} />}
            {vista === "interna" ? "Vista interna" : "Vista cliente"}
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onLoad}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600 }}>
            <FolderOpen size={15} /> Cargar
          </button>
          <button onClick={onExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600 }}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={onExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", fontWeight: 600 }}>
            <FileDown size={15} /> CSV
          </button>
          <button onClick={onPrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm tabbtn"
            style={{ background: C.green, color: C.teal, fontWeight: 700 }}>
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}

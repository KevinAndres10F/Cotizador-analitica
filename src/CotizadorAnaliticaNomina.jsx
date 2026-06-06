import React, { useState, useMemo } from "react";
import {
  Building2, ClipboardCheck, SlidersHorizontal, Calculator, Workflow, Settings2,
} from "lucide-react";
import { C } from "./config/colors";
import { DEFAULTS, PREGUNTAS, CHECKLIST } from "./config/defaults";
import { calcularCotizacion } from "./pricing/engine";
import Header from "./components/Header";
import SummaryRail from "./components/SummaryRail";
import ClienteTab from "./components/tabs/ClienteTab";
import DiagnosticoTab from "./components/tabs/DiagnosticoTab";
import AlcanceTab from "./components/tabs/AlcanceTab";
import CotizacionTab from "./components/tabs/CotizacionTab";
import ProcesoTab from "./components/tabs/ProcesoTab";
import TarifasTab from "./components/tabs/TarifasTab";
import { exportCSV, exportExcel } from "./export/exportQuote";

export default function CotizadorAnaliticaNomina() {
  const [tab, setTab] = useState("cliente");
  const [vista, setVista] = useState("cliente");
  const [cfg, setCfg] = useState(DEFAULTS);

  const [cliente, setCliente] = useState({
    empresa: "", contacto: "", sector: "", ref: "KAPI-MPO-AN-2026-01",
  });

  const [entidades, setEntidades] = useState([
    { nombre: "", empleados: 250, formato: "excel", frecuencia: "mensual" },
  ]);
  const [usuarios, setUsuarios] = useState(3);

  const [mesesHist, setMesesHist] = useState(12);
  const [integraciones, setIntegraciones] = useState(0);
  const [kpis, setKpis] = useState(0);
  const [reportes, setReportes] = useState(0);

  const [diluirImpl, setDiluirImpl] = useState(true);
  const [mesesDilucion, setMesesDilucion] = useState(36);

  const [resp, setResp] = useState({});
  const [check, setCheck] = useState(Array(CHECKLIST.length).fill(false));

  const empleados = useMemo(() => entidades.reduce((s, e) => s + e.empleados, 0), [entidades]);

  const score = useMemo(
    () => PREGUNTAS.reduce((s, p) => s + (resp[p.id] != null ? p.op[resp[p.id]][1] : 0), 0),
    [resp]
  );
  const maxScore = useMemo(() => PREGUNTAS.reduce((s, p) => s + Math.max(...p.op.map(o => o[1])), 0), []);
  const respondidas = useMemo(() => Object.keys(resp).length, [resp]);
  const nivel = score >= cfg.umbralAlta ? "ALTA" : score >= cfg.umbralMedia ? "MEDIA" : "BAJA";
  const nivelColor = { BAJA: C.green2, MEDIA: C.orange, ALTA: "#c0392b" }[nivel];

  const q = useMemo(() => calcularCotizacion({
    empleados, usuarios, mesesHist, integraciones, kpis, reportes, nivel, cfg, entidades, diluirImpl, mesesDilucion,
  }), [empleados, usuarios, mesesHist, integraciones, kpis, reportes, nivel, cfg, entidades, diluirImpl, mesesDilucion]);

  const exportProps = { q, cfg, cliente, empleados, entidades, nivel, integraciones, kpis, reportes, mesesHist };

  const TABS = [
    ["cliente", "Cliente", Building2],
    ["diagnostico", "Diagnóstico", ClipboardCheck],
    ["alcance", "Alcance", SlidersHorizontal],
    ["cotizacion", "Cotización", Calculator],
    ["proceso", "Proceso", Workflow],
    ["tarifas", "Tarifas", Settings2],
  ];

  return (
    <div style={{ background: C.paper, color: C.ink, minHeight: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Hanken Grotesk', sans-serif; -webkit-font-smoothing: antialiased; }
        .serif { font-family: 'Fraunces', serif; }
        .mono { font-family: 'JetBrains Mono', monospace; font-feature-settings:"tnum"; }
        .tabbtn { transition: all .15s ease; }
        .opt { transition: all .12s ease; cursor: pointer; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media print {
          .no-print { display: none !important; }
          .print-full { box-shadow: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <Header
        vista={vista} setVista={setVista}
        onPrint={() => window.print()}
        onExportExcel={() => exportExcel({ ...exportProps, vista })}
        onExportCSV={() => exportCSV(exportProps)}
      />

      {/* Tabs */}
      <div className="no-print" style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 20 }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {TABS.filter(([id]) => !(id === "tarifas" && vista === "cliente")).map(([id, label, Icon]) => {
            const active = tab === id;
            const isCfg = id === "tarifas";
            return (
              <button key={id} onClick={() => setTab(id)}
                className="tabbtn flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap"
                style={{
                  color: active ? (isCfg ? C.orange : C.teal) : C.sub,
                  fontWeight: active ? 700 : 500,
                  borderBottom: `2.5px solid ${active ? (isCfg ? C.orange : C.teal) : "transparent"}`,
                  opacity: isCfg && !active ? 0.7 : 1,
                }}>
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className={tab === "proceso" || tab === "tarifas" ? "" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          <div className={tab === "proceso" || tab === "tarifas" ? "" : "lg:col-span-2 space-y-6"}>
            {tab === "cliente" && (
              <ClienteTab
                cliente={cliente} setCliente={setCliente}
                entidades={entidades} setEntidades={setEntidades}
                usuarios={usuarios} setUsuarios={setUsuarios}
                cfg={cfg} q={q}
              />
            )}
            {tab === "diagnostico" && (
              <DiagnosticoTab
                resp={resp} setResp={setResp}
                score={score} maxScore={maxScore} respondidas={respondidas}
                nivel={nivel} nivelColor={nivelColor}
              />
            )}
            {tab === "alcance" && (
              <AlcanceTab
                mesesHist={mesesHist} setMesesHist={setMesesHist}
                integraciones={integraciones} setIntegraciones={setIntegraciones}
                kpis={kpis} setKpis={setKpis}
                reportes={reportes} setReportes={setReportes}
                cfg={cfg}
              />
            )}
            {tab === "cotizacion" && (
              <CotizacionTab
                q={q} cfg={cfg} empleados={empleados}
                nivel={nivel} nivelColor={nivelColor} respondidas={respondidas}
                vista={vista}
                diluirImpl={diluirImpl} setDiluirImpl={setDiluirImpl}
                mesesDilucion={mesesDilucion} setMesesDilucion={setMesesDilucion}
                integraciones={integraciones} kpis={kpis} reportes={reportes}
                mesesHist={mesesHist} entidades={entidades}
              />
            )}
            {tab === "proceso" && (
              <ProcesoTab check={check} setCheck={setCheck} />
            )}
            {tab === "tarifas" && (
              <TarifasTab cfg={cfg} setCfg={setCfg} />
            )}
          </div>

          {tab !== "proceso" && tab !== "tarifas" && (
            <SummaryRail
              cliente={cliente} empleados={empleados} usuarios={usuarios}
              nivel={nivel} nivelColor={nivelColor} q={q}
              vista={vista} tab={tab} setTab={setTab}
            />
          )}
        </div>
      </div>

      <div className="no-print text-center py-6 text-xs" style={{ color: C.sub }}>
        KAPI Service Group · Quito, Ecuador — herramienta interna de cotización
      </div>
    </div>
  );
}

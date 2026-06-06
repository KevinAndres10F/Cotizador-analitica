import React from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { C } from "../../config/colors";
import { Card, Field, Stepper } from "../ui";
import { money } from "../../pricing/engine";

const FORMATOS = [
  { value: "api", label: "API / BD estructurada" },
  { value: "excel", label: "Excel / CSV" },
  { value: "heterogeneo", label: "Heterogéneo / legado" },
];

const FRECUENCIAS = [
  { value: "mensual", label: "Mensual" },
  { value: "quincenal", label: "Quincenal" },
  { value: "semanal", label: "Semanal" },
];

export default function ClienteTab({ cliente, setCliente, entidades, setEntidades, usuarios, setUsuarios, cfg, q }) {
  const empleados = entidades.reduce((s, e) => s + e.empleados, 0);

  const updateEntidad = (idx, field, value) => {
    const next = [...entidades];
    next[idx] = { ...next[idx], [field]: value };
    setEntidades(next);
  };

  const addEntidad = () => {
    setEntidades([...entidades, { nombre: "", empleados: 50, formato: "excel", frecuencia: "mensual" }]);
  };

  const removeEntidad = (idx) => {
    if (entidades.length <= 1) return;
    setEntidades(entidades.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Card>
        <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Datos del cliente</h2>
        <p className="text-sm mb-5" style={{ color: C.sub }}>Información base de la cotización.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Empresa">
            <input value={cliente.empresa} onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
              placeholder="Nombre del cliente"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: `1px solid ${C.line}`, background: C.paper }} />
          </Field>
          <Field label="Contacto">
            <input value={cliente.contacto} onChange={(e) => setCliente({ ...cliente, contacto: e.target.value })}
              placeholder="Nombre y cargo"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: `1px solid ${C.line}`, background: C.paper }} />
          </Field>
          <Field label="Sector / industria">
            <input value={cliente.sector} onChange={(e) => setCliente({ ...cliente, sector: e.target.value })}
              placeholder="Ej. Retail, manufactura…"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: `1px solid ${C.line}`, background: C.paper }} />
          </Field>
          <Field label="N° de cotización">
            <input value={cliente.ref} onChange={(e) => setCliente({ ...cliente, ref: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mono"
              style={{ border: `1px solid ${C.line}`, background: C.paper }} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Razones sociales</h2>
        <p className="text-sm mb-5" style={{ color: C.sub }}>
          Cada razón social tiene su formato y frecuencia de carga. El total de empleados determina la tarifa.
        </p>

        <div className="space-y-3">
          {entidades.map((ent, i) => (
            <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${C.line}`, background: C.paper }}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs mono" style={{ color: C.sub, fontWeight: 700 }}>ENTIDAD {i + 1}</span>
                {entidades.length > 1 && (
                  <button onClick={() => removeEntidad(i)} className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition hover:bg-red-50" style={{ color: "#dc2626" }}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Field label="Razón social">
                  <input value={ent.nombre} onChange={(e) => updateEntidad(i, "nombre", e.target.value)}
                    placeholder="Nombre de la entidad"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff" }} />
                </Field>
                <Field label="Empleados">
                  <Stepper value={ent.empleados} onChange={(v) => updateEntidad(i, "empleados", v)} step={10} max={50000} />
                </Field>
                <Field label="Formato de datos">
                  <select value={ent.formato} onChange={(e) => updateEntidad(i, "formato", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                    {FORMATOS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
                <Field label="Frecuencia de carga">
                  <select value={ent.frecuencia} onChange={(e) => updateEntidad(i, "frecuencia", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                    {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addEntidad}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition hover:bg-green-50"
          style={{ border: `1px dashed ${C.green2}`, color: C.green2, fontWeight: 600 }}>
          <Plus size={16} /> Agregar razón social
        </button>
      </Card>

      <Card>
        <h2 className="serif mb-1" style={{ fontSize: 19, fontWeight: 600 }}>Tamaño de la operación</h2>
        <p className="text-sm mb-5" style={{ color: C.sub }}>Resumen de empleados y usuarios del tablero.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Total empleados en nómina" hint="suma de entidades">
            <div className="mono text-2xl" style={{ fontWeight: 700, color: C.teal }}>
              {empleados.toLocaleString("es-EC")}
            </div>
          </Field>
          <Field label="Usuarios del tablero" hint={`${cfg.usuariosIncluidos} incluidos`}>
            <Stepper value={usuarios} onChange={setUsuarios} min={1} max={500} />
          </Field>
        </div>
        <div className="mt-5 rounded-xl p-4 flex items-start gap-3" style={{ background: C.mint }}>
          <Calculator size={18} color={C.teal} className="mt-0.5" />
          <p className="text-sm" style={{ color: C.teal }}>
            Con <b>{empleados.toLocaleString("es-EC")}</b> empleados
            {entidades.length > 1 && <> en <b>{entidades.length}</b> razones sociales</>},
            la mensualidad base es <b className="mono">{money(q.mensualEfectiva)}/mes</b>.
            {q.prorrateoActivo && <> Incluye implementación prorrateada en {q.mesesDilucion} meses.</>}
            {!q.cobraImpl && <> Sin costo de implementación.</>}
          </p>
        </div>
      </Card>
    </>
  );
}

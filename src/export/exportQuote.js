import * as XLSX from "xlsx";
import { money2 } from "../pricing/engine";

function buildClienteRows(cliente, empleados, entidades, nivel, q) {
  return [
    ["Empresa", cliente.empresa],
    ["Contacto", cliente.contacto],
    ["Sector", cliente.sector],
    ["Referencia", cliente.ref],
    [""],
    ["Total empleados", empleados],
    ["Razones sociales", entidades.length],
    ["Complejidad", nivel],
    [""],
    ["SUSCRIPCIÓN MENSUAL", q.mensualEfectiva.toFixed(2)],
    ...(q.diluirImpl
      ? [["  (Base mensual)", q.mensual.toFixed(2)],
         [`  (Prorrateo impl. ${q.mesesDilucion}m)`, q.prorrateoPorMes.toFixed(2)]]
      : []),
    ...(!q.diluirImpl ? [["IMPLEMENTACIÓN (PAGO ÚNICO)", q.implementacion.toFixed(2)]] : []),
    ["TOTAL ANUAL", q.anualTotal.toFixed(2)],
  ];
}

function buildDesgloseRows(q, cfg, empleados, integraciones, kpis, reportes, mesesHist, nivel, entidades) {
  const rows = [
    ["CONCEPTO", "MONTO (USD)"],
    ["--- MENSUAL ---", ""],
    ["Base de plataforma", cfg.basePlataforma.toFixed(2)],
    [`Empleados (${empleados} · tramos)`, q.tramos.toFixed(2)],
  ];
  if (q.extraUsuarios > 0) rows.push([`Usuarios adicionales (${q.extraUsuarios})`, q.usuariosCosto.toFixed(2)]);
  if (q.mensualPiso) rows.push(["Ajuste a piso mínimo", (q.mensual - (cfg.basePlataforma + q.tramos + q.usuariosCosto)).toFixed(2)]);
  if (q.diluirImpl) rows.push([`Prorrateo implementación (${q.mesesDilucion}m)`, q.prorrateoPorMes.toFixed(2)]);
  rows.push(["TOTAL MENSUAL", q.mensualEfectiva.toFixed(2)]);
  rows.push(["", ""]);
  rows.push(["--- IMPLEMENTACIÓN ---", ""]);
  rows.push([`Base por complejidad (${nivel})`, q.base.toFixed(2)]);
  if (q.recEscala > 0) rows.push(["Recargo por escala", q.recEscala.toFixed(2)]);
  if (q.recHist > 0) rows.push([`Migración de histórico (${mesesHist}m)`, q.recHist.toFixed(2)]);
  if (q.recEntidades > 0) rows.push([`Entidades adicionales (${entidades.length - 1})`, q.recEntidades.toFixed(2)]);
  if (integraciones > 0) rows.push([`Integraciones (${integraciones})`, (integraciones * cfg.precioIntegracion).toFixed(2)]);
  if (kpis > 0) rows.push([`KPIs personalizados (${kpis})`, (kpis * cfg.precioKpi).toFixed(2)]);
  if (reportes > 0) rows.push([`Reportes personalizados (${reportes})`, (reportes * cfg.precioReporte).toFixed(2)]);
  rows.push(["TOTAL IMPLEMENTACIÓN", q.implementacion.toFixed(2)]);
  return rows;
}

function buildEntidadesRows(entidades) {
  return [
    ["RAZÓN SOCIAL", "EMPLEADOS", "FORMATO", "FRECUENCIA"],
    ...entidades.map(e => [e.nombre || "(sin nombre)", e.empleados, e.formato, e.frecuencia]),
  ];
}

function buildSplitRows(q) {
  return [
    ["CONCEPTO", "MANPOWER", "KAPI"],
    [`Mensual (split ${(q.margen * 100).toFixed(0)}%)`, q.mpMensual.toFixed(2), q.kapiMensual.toFixed(2)],
    ["Anual", q.mpAnual.toFixed(2), q.kapiAnual.toFixed(2)],
    ...(!q.diluirImpl ? [["Implementación", q.mpImpl.toFixed(2), q.kapiImpl.toFixed(2)]] : []),
  ];
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV({ q, cfg, cliente, empleados, entidades, nivel, integraciones, kpis, reportes, mesesHist }) {
  const rows = [
    ...buildClienteRows(cliente, empleados, entidades, nivel, q),
    [""],
    ...buildDesgloseRows(q, cfg, empleados, integraciones, kpis, reportes, mesesHist, nivel, entidades),
    [""],
    ...buildEntidadesRows(entidades),
  ];
  const csv = rows.map(r => Array.isArray(r) ? r.join(",") : r).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const ref = cliente.ref || "cotizacion";
  triggerDownload(blob, `${ref}.csv`);
}

export function exportExcel({ q, cfg, cliente, empleados, entidades, nivel, integraciones, kpis, reportes, mesesHist, vista }) {
  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.aoa_to_sheet(buildClienteRows(cliente, empleados, entidades, nivel, q));
  XLSX.utils.book_append_sheet(wb, wsResumen, "Cotización");

  const wsDesglose = XLSX.utils.aoa_to_sheet(buildDesgloseRows(q, cfg, empleados, integraciones, kpis, reportes, mesesHist, nivel, entidades));
  XLSX.utils.book_append_sheet(wb, wsDesglose, "Desglose");

  const wsEntidades = XLSX.utils.aoa_to_sheet(buildEntidadesRows(entidades));
  XLSX.utils.book_append_sheet(wb, wsEntidades, "Entidades");

  if (vista === "interna") {
    const wsSplit = XLSX.utils.aoa_to_sheet(buildSplitRows(q));
    XLSX.utils.book_append_sheet(wb, wsSplit, "Split");
  }

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const ref = cliente.ref || "cotizacion";
  triggerDownload(blob, `${ref}.xlsx`);
}

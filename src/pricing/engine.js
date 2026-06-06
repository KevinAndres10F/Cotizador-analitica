export const n = (v) => { const x = parseFloat(v); return isNaN(x) ? 0 : x; };

export const money = (v) =>
  "$" + Math.round(v).toLocaleString("es-EC");

export const money2 = (v) =>
  "$" + v.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function tramoSuma(empleados, brackets) {
  let total = 0, prev = 0;
  for (const b of brackets) {
    if (empleados <= prev) break;
    const tope = Math.min(empleados, b.hasta);
    total += (tope - prev) * b.tarifa;
    prev = b.hasta;
    if (empleados <= b.hasta) break;
  }
  return total;
}

export const buscarBanda = (valor, tabla, campo) => {
  for (const r of tabla) if (valor <= r.hasta) return r[campo];
  return tabla[tabla.length - 1][campo];
};

export function calcularCotizacion({ empleados, usuarios, mesesHist, integraciones, kpis, reportes, nivel, cfg, entidades, diluirImpl, mesesDilucion }) {
  const emp = Math.max(0, empleados);
  const tramos = tramoSuma(emp, cfg.brackets);
  const extraUsuarios = Math.max(0, usuarios - cfg.usuariosIncluidos);
  const usuariosCosto = extraUsuarios * cfg.precioUsuarioAdicional;
  const mensualBruto = cfg.basePlataforma + tramos + usuariosCosto;
  const mensual = Math.max(cfg.pisoMensual, mensualBruto);

  const base = cfg.implBase[nivel];
  const recEscala = buscarBanda(emp, cfg.recargoEscala, "monto");
  const recHist = buscarBanda(mesesHist, cfg.recargoHistorico, "monto");
  const adecMonto = integraciones * cfg.precioIntegracion + kpis * cfg.precioKpi + reportes * cfg.precioReporte;
  const recEntidades = (entidades.length - 1) * (cfg.recargoPorEntidad || 0);
  const implementacion = base + recEscala + recHist + adecMonto + recEntidades;

  const prorrateoPorMes = implementacion / Math.max(1, mesesDilucion);
  const prorrateoPorEmpleado = implementacion / Math.max(1, emp) / Math.max(1, mesesDilucion);
  const mensualConProrrateo = mensual + prorrateoPorMes;

  const margen = cfg.splitMode === "fijo"
    ? cfg.splitManpower
    : buscarBanda(emp, cfg.margenManpower, "pct");

  const mensualEfectiva = diluirImpl ? mensualConProrrateo : mensual;

  return {
    tramos, usuariosCosto, extraUsuarios, mensual, mensualPiso: mensual > mensualBruto,
    base, recEscala, recHist, adecMonto, recEntidades, implementacion,
    margen,
    diluirImpl, mesesDilucion, prorrateoPorMes, prorrateoPorEmpleado, mensualConProrrateo,
    mensualEfectiva,
    mpMensual: mensualEfectiva * margen,
    kapiMensual: mensualEfectiva * (1 - margen),
    mpImpl: diluirImpl ? 0 : implementacion * margen,
    kapiImpl: diluirImpl ? 0 : implementacion * (1 - margen),
    anualTotal: mensualEfectiva * 12,
    mpAnual: mensualEfectiva * margen * 12,
    kapiAnual: mensualEfectiva * (1 - margen) * 12,
  };
}

import {
  Database, Layers, Building2, Gauge, Lock, Sparkles, FileText,
  BellRing, ShieldCheck, Users, ClipboardCheck, Workflow, CheckCircle2,
} from "lucide-react";

export const DEFAULTS = {
  basePlataforma: 90,
  pisoMensual: 350,
  brackets: [
    { hasta: 100, tarifa: 3.5 },
    { hasta: 500, tarifa: 2.8 },
    { hasta: 1500, tarifa: 2.2 },
    { hasta: 5000, tarifa: 1.6 },
    { hasta: Infinity, tarifa: 1.1 },
  ],
  usuariosIncluidos: 3,
  precioUsuarioAdicional: 20,
  implBase: { BAJA: 900, MEDIA: 1800, ALTA: 3200 },
  recargoEscala: [
    { hasta: 300, monto: 0 },
    { hasta: 1500, monto: 400 },
    { hasta: 5000, monto: 900 },
    { hasta: Infinity, monto: 1600 },
  ],
  recargoHistorico: [
    { hasta: 12, monto: 0 },
    { hasta: 24, monto: 300 },
    { hasta: 36, monto: 500 },
    { hasta: Infinity, monto: 800 },
  ],
  precioIntegracion: 350,
  precioKpi: 120,
  precioReporte: 200,
  recargoPorEntidad: 200,
  splitMode: "fijo",
  splitManpower: 0.5,
  margenManpower: [
    { hasta: 40, pct: 0.25 },
    { hasta: 300, pct: 0.3 },
    { hasta: Infinity, pct: 0.35 },
  ],
  implNivel: "ALTA",
  umbralMedia: 11,
  umbralAlta: 21,
};

export const PREGUNTAS = [
  {
    id: "fuentes", icon: Database,
    q: "¿Cuántos sistemas / fuentes de nómina se deben integrar?",
    op: [["1 sistema", 0], ["2 a 3 sistemas", 2], ["4 o más", 4]],
  },
  {
    id: "formato", icon: Layers,
    q: "¿En qué formato entrega los datos el cliente?",
    op: [["API o base de datos estructurada", 0], ["Exportes Excel / CSV limpios", 2], ["Archivos heterogéneos, PDF o sistema legado", 4]],
  },
  {
    id: "entidades", icon: Building2,
    q: "¿Cuántas razones sociales / empresas / centros de costo?",
    op: [["1", 0], ["2 a 5", 2], ["6 o más", 3]],
  },
  {
    id: "actualizacion", icon: Gauge,
    q: "¿Frecuencia y método de actualización de datos?",
    op: [["Carga manual mensual", 0], ["Carga programada (SFTP)", 1], ["Integración automática / API continua", 3]],
  },
  {
    id: "anonimizacion", icon: Lock,
    q: "¿Nivel de anonimización / cumplimiento requerido?",
    op: [["Datos internos, sin anonimizar", 0], ["Pseudonimización + acceso por rol", 2], ["Avanzado: LOPDP, k-anonimato, auditoría", 4]],
  },
  {
    id: "personalizacion", icon: Sparkles,
    q: "¿Cuántos tableros personalizados requiere el cliente?",
    op: [["1 tablero estándar", 0], ["2 a 3 tableros", 2], ["4 o más tableros", 4]],
  },
  {
    id: "historico", icon: FileText,
    q: "¿Profundidad de histórico a migrar y reconciliar?",
    op: [["Hasta 12 meses", 0], ["13 a 36 meses", 2], ["37 meses o más", 3]],
  },
  {
    id: "salidas", icon: BellRing,
    q: "¿Salidas / notificaciones requeridas?",
    op: [["Solo tablero", 0], ["+ Alertas por correo", 1], ["+ WhatsApp u otros sistemas", 3]],
  },
  {
    id: "seguridad", icon: ShieldCheck,
    q: "¿Requerimientos de seguridad / acceso?",
    op: [["Estándar", 0], ["SSO o bitácora de auditoría", 2], ["Requerimientos específicos / on-prem", 4]],
  },
  {
    id: "capacitacion", icon: Users,
    q: "¿Alcance de capacitación y acompañamiento?",
    op: [["Handoff básico", 0], ["Capacitación a un equipo", 1], ["Multi-sede o multi-rol", 3]],
  },
];

export const RUTA = [
  { t: "Descubrimiento", d: "Llenamos juntos el formulario de diagnóstico y definimos alcance.", icon: ClipboardCheck },
  { t: "Propuesta", d: "Entregamos cotización con complejidad calificada y cronograma.", icon: FileText },
  { t: "Conexión de datos", d: "Acceso seguro a fuentes de nómina y diccionario de campos.", icon: Database },
  { t: "Anonimización", d: "Tratamiento de datos personales conforme a LOPDP.", icon: Lock },
  { t: "Construcción", d: "Modelado y armado del tablero con tus KPIs.", icon: Layers },
  { t: "Validación (UAT)", d: "Revisión y ajustes con tu equipo antes de salir a producción.", icon: CheckCircle2 },
  { t: "Puesta en marcha", d: "Capacitación, accesos por rol y go-live.", icon: Sparkles },
  { t: "Mejora continua", d: "Soporte mensual, monitoreo y evolución del tablero.", icon: Workflow },
];

export const ANONIMIZACION = [
  ["Inventario de datos personales", "Identificamos qué campos son PII (cédula, nombre, salario individual, etc.) y su base legal."],
  ["Seudonimización / tokenización", "Sustituimos identificadores directos por tokens; el dato sensible no viaja al tablero."],
  ["Acceso por rol", "Cada usuario ve solo el nivel de detalle que le corresponde (agregado vs. individual)."],
  ["Umbral de agregación", "Métricas de grupos pequeños se ocultan o agrupan (k-anonimato) para evitar reidentificación."],
  ["Bitácora y auditoría", "Registro de accesos y cambios; trazabilidad conforme a LOPDP."],
];

export const CHECKLIST = [
  "Designar contraparte técnica y de RR.HH. del cliente",
  "Acceso o exporte de muestra de la(s) fuente(s) de nómina",
  "Diccionario de campos / catálogo de conceptos de nómina",
  "Listado de razones sociales y centros de costo",
  "Política de anonimización y roles de acceso requeridos",
  "Listado de KPIs e indicadores deseados",
  "Profundidad de histórico a migrar (meses)",
  "Requerimientos de seguridad (SSO, auditoría, etc.)",
  "Canales de notificación deseados (correo, WhatsApp)",
  "Responsable de validación (UAT) y fecha objetivo",
];

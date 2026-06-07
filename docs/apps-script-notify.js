// ============================================================
// Google Apps Script — Notificación de nuevos leads
// ============================================================
// INSTRUCCIONES:
// 1. Ve a https://script.google.com y crea un proyecto nuevo
// 2. Pega este código completo
// 3. Click en "Implementar" > "Nueva implementación"
// 4. Tipo: "Aplicación web"
// 5. Ejecutar como: "Yo" (tu cuenta)
// 6. Acceso: "Cualquier persona"
// 7. Click "Implementar" y copia la URL
// 8. Pon esa URL como variable APPS_SCRIPT_URL en Supabase
// ============================================================

function doPost(e) {
  try {
    var lead = JSON.parse(e.postData.contents);

    var subject = "🔔 Nuevo lead: " + (lead.empresa || "Sin nombre") + " - Analítica de Nómina";

    var html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto">'
      + '<div style="background:#1a4d42;padding:20px;border-radius:12px 12px 0 0">'
      + '<h2 style="color:#fff;margin:0">Nuevo Lead - Analítica de Nómina</h2>'
      + '<p style="color:#9fc9bd;margin:4px 0 0;font-size:13px">KAPI Service Group × Manpower</p>'
      + '</div>'
      + '<div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">'
      + '<table style="width:100%;border-collapse:collapse">'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Empresa</td><td style="padding:8px 0;font-weight:600">' + (lead.empresa || "-") + '</td></tr>'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Contacto</td><td style="padding:8px 0;font-weight:600">' + (lead.contacto || "-") + '</td></tr>'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:' + (lead.email || "") + '" style="color:#1a4d42">' + (lead.email || "-") + '</a></td></tr>'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Teléfono</td><td style="padding:8px 0">' + (lead.telefono || "-") + '</td></tr>'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Sector</td><td style="padding:8px 0">' + (lead.sector || "-") + '</td></tr>'
      + '<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Empleados</td><td style="padding:8px 0">' + (lead.empleados_rango || "-") + '</td></tr>'
      + '</table>';

    if (lead.mensaje) {
      html += '<div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px;font-size:13px">'
        + '<strong>Mensaje:</strong><br/>' + lead.mensaje + '</div>';
    }

    html += '<p style="margin-top:20px;font-size:12px;color:#9ca3af">Revisa los leads en el cotizador → pestaña Leads (vista interna)</p>'
      + '</div></div>';

    // Enviar a info@kapisg.com
    MailApp.sendEmail({
      to: "info@kapisg.com",
      subject: subject,
      htmlBody: html,
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "Notify Lead API activa" }))
    .setMimeType(ContentService.MimeType.JSON);
}

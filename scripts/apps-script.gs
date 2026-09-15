/**
 * Web App de Google Apps Script para guardar las confirmaciones de asistencia
 * de Joly & Jhon en la hoja de cálculo "Invitados boda Joly-Jhon".
 *
 * Columnas esperadas:
 * A: Fecha/Hora  |  B: Nombre  |  C: Asistencia  |  D: Hospedaje  |  E: URL
 *
 * Despliegue:
 * 1. Extensión → Apps Script.
 * 2. Pegar este código y guardar.
 * 3. Hacer clic en "Desplegar" → "Nuevo despliegue" → tipo "Aplicación web".
 * 4. Ejecutar como: tú. Acceso: "Cualquiera, incluso anónimo".
 * 5. Copiar la URL del Web App y pegarla en js/main.js → APPS_SCRIPT_URL.
 */

function doGet(e) {
  return ContentService
    .createTextOutput("Web App activa. Usá POST para enviar el formulario.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents && e.postData.contents.trim().startsWith("{")) {
      // Envío directo como JSON (raw body)
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      // Envío desde un formulario (<input name="data" value="{...}")
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error("No se recibieron datos");
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Pestaña destino: Sheet1 (la primera pestaña del archivo)
    let sheet = ss.getSheetByName("Sheet1");
    if (!sheet) {
      sheet = ss.getSheets()[0]; // respaldo: primera pestaña
    }

    const headers = ["Fecha/Hora", "Nombre", "Asistencia", "Hospedaje", "URL"];
    const lastCol = sheet.getLastColumn();
    const firstRow = lastCol > 0
      ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
      : [];

    // Si la primera fila no tiene los títulos, los escribimos
    if (firstRow.join("") !== headers.join("")) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = [
      new Date(),
      data.nombre || "",
      data.asistencia || "",
      data.hospedaje || "",
      data.url || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

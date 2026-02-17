import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta datos a PDF con el branding de Aconfrios S.A.
 * @param {string} tipoReporte - Nombre del reporte (ej: 'inventario', 'movimientos')
 * @param {Array} datos - Array de objetos con los datos de la tabla
 * @param {string} totalFormateado - El valor total ya con signo de pesos
 * @param {string} logoAsset - La referencia de la imagen importada
 */
export const exportToPDF = (tipoReporte, datos, totalFormateado, logoAsset) => {
  if (!datos || datos.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4'); // Orientación Horizontal

  // --- 1. ENCABEZADO CORPORATIVO ---
  doc.setFillColor(0, 51, 102); // Azul Marino (#003366)
  doc.rect(0, 0, 297, 45, 'F');

  // --- 2. LOGOTIPO ---
  if (logoAsset) {
    try {
      // Ajuste de dimensiones estándar para logos horizontales/cuadrados
      doc.addImage(logoAsset, 'PNG', 14, 8, 32, 28);
    } catch (e) {
      console.warn("Error al cargar el logo en el PDF", e);
    }
  }

  // --- 3. TEXTOS DE IDENTIDAD ---
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ACONFRIOS S.A.", 52, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text('"Confort para la vida"', 52, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`REPORTE DE SISTEMA: ${tipoReporte.toUpperCase()}`, 52, 36);

  // Información de emisión
  doc.setFontSize(9);
  doc.text(`EMISIÓN: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 220, 15);
  doc.text("CENTRO DE SERVICIO ESPECIALIZADO ", 220, 22);


  const headers = Object.keys(datos[0]);
  const body = datos.map(row => Object.values(row));

  autoTable(doc, {
    startY: 50,
    head: [headers.map(h => h.replace('_', ' ').toUpperCase())], // Limpia los nombres de columnas
    body: body,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 82, 155],
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: { fillColor: [248, 250, 255] },
  });

  // --- 5. RESUMEN Y FIRMAS ---
  let finalY = doc.lastAutoTable.finalY + 15;

  // Si el reporte es de inventario, mostramos el cuadro de valorización
  if (totalFormateado && tipoReporte.toLowerCase().includes('inventario')) {
    doc.setFillColor(0, 51, 102);
    doc.rect(14, finalY - 8, 90, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`VALOR TOTAL: ${totalFormateado}`, 20, finalY);
    finalY += 20;
  }

  // Bloque de Firmas (si hay espacio en la página)
  if (finalY < 180) {
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 15, 84, finalY + 15); // Firma 1
    doc.line(110, finalY + 15, 180, finalY + 15); // Firma 2

    doc.setTextColor(0, 51, 102);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("RESPONSABLE DE ALMACÉN", 14, finalY + 20);
    doc.text("REVISIÓN Y AUDITORÍA TÉCNICA", 110, finalY + 20);
  }

  // --- 6. PIE DE PÁGINA ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Aconfrios S.A. | Nit: 000.000.000-0 | Generado por Sistema de Inventario | Página ${i} de ${pageCount}`,
      14, 205
    );
  }

  doc.save(`Aconfrios_${tipoReporte}_${new Date().getTime()}.pdf`);
};
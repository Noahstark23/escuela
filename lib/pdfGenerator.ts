import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Tipos compartidos para reportes
export interface ReportHeader {
    schoolName: string;
    logo?: string;
    reportTitle: string;
    reportSubtitle?: string;
    generatedDate: Date;
    generatedBy?: string;
}

export interface ReportFooter {
    pageNumbers?: boolean;
    customText?: string;
}

// Configuración de estilo estándar
const REPORT_STYLES = {
    colors: {
        primary: [41, 128, 185] as [number, number, number], // Azul
        secondary: [52, 73, 94] as [number, number, number], // Gris oscuro
        success: [46, 204, 113] as [number, number, number], // Verde
        danger: [231, 76, 60] as [number, number, number], // Rojo
        warning: [241, 196, 15] as [number, number, number], // Amarillo
    },
    fonts: {
        title: 18,
        subtitle: 14,
        heading: 12,
        body: 10,
        small: 8,
    },
    margins: {
        top: 20,
        right: 14,
        bottom: 20,
        left: 14,
    },
};

/**
 * Crea un nuevo documento PDF con configuración estándar
 */
export function createPDF(): jsPDF {
    return new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });
}

/**
 * Agrega el header estándar al documento
 */
export function addReportHeader(
    doc: jsPDF,
    header: ReportHeader
): number {
    const { schoolName, reportTitle, reportSubtitle, generatedDate, generatedBy } = header;

    let currentY = REPORT_STYLES.margins.top;

    // Nombre de la institución
    doc.setFontSize(REPORT_STYLES.fonts.title);
    doc.setTextColor(...REPORT_STYLES.colors.primary);
    doc.text(schoolName, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
    currentY += 8;

    // Título del reporte
    doc.setFontSize(REPORT_STYLES.fonts.subtitle);
    doc.setTextColor(...REPORT_STYLES.colors.secondary);
    doc.text(reportTitle, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
    currentY += 6;

    // Subtítulo (si existe)
    if (reportSubtitle) {
        doc.setFontSize(REPORT_STYLES.fonts.body);
        doc.text(reportSubtitle, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
        currentY += 5;
    }

    // Fecha de generación
    doc.setFontSize(REPORT_STYLES.fonts.small);
    doc.setTextColor(100, 100, 100);
    const dateText = `Generado: ${format(generatedDate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`;
    doc.text(dateText, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
    currentY += 4;

    // Usuario que generó (si existe)
    if (generatedBy) {
        doc.text(`Por: ${generatedBy}`, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
        currentY += 4;
    }

    // Línea separadora
    doc.setDrawColor(...REPORT_STYLES.colors.primary);
    doc.setLineWidth(0.5);
    doc.line(
        REPORT_STYLES.margins.left,
        currentY + 2,
        doc.internal.pageSize.getWidth() - REPORT_STYLES.margins.right,
        currentY + 2
    );
    currentY += 6;

    return currentY;
}

/**
 * Agrega el footer estándar con números de página
 */
export function addReportFooter(
    doc: jsPDF,
    footer: ReportFooter = { pageNumbers: true }
): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(REPORT_STYLES.fonts.small);
        doc.setTextColor(150, 150, 150);

        // Números de página
        if (footer.pageNumbers) {
            const pageText = `Página ${i} de ${pageCount}`;
            doc.text(
                pageText,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: "center" }
            );
        }

        // Texto personalizado
        if (footer.customText) {
            doc.text(
                footer.customText,
                REPORT_STYLES.margins.left,
                doc.internal.pageSize.getHeight() - 10
            );
        }
    }
}

/**
 * Crea una tabla estándar con autoTable
 */
export function addTable(
    doc: jsPDF,
    data: {
        head: string[][];
        body: any[][];
        startY: number;
        title?: string;
    }
): number {
    const { head, body, startY, title } = data;

    // Título de la tabla (opcional)
    if (title) {
        doc.setFontSize(REPORT_STYLES.fonts.heading);
        doc.setTextColor(...REPORT_STYLES.colors.secondary);
        doc.text(title, REPORT_STYLES.margins.left, startY);
    }

    autoTable(doc, {
        head,
        body,
        startY: title ? startY + 5 : startY,
        theme: "grid",
        headStyles: {
            fillColor: REPORT_STYLES.colors.primary,
            textColor: [255, 255, 255],
            fontSize: REPORT_STYLES.fonts.body,
            fontStyle: "bold",
            halign: "center",
        },
        bodyStyles: {
            fontSize: REPORT_STYLES.fonts.small,
            textColor: [50, 50, 50],
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { left: REPORT_STYLES.margins.left, right: REPORT_STYLES.margins.right },
        didDrawPage: (data) => {
            // Hook para customizaciones adicionales
        },
    });

    // @ts-ignore - autoTable agrega esta propiedad
    return doc.lastAutoTable.finalY + 10;
}

/**
 * Agrega un resumen con estadísticas clave
 */
export function addSummarySection(
    doc: jsPDF,
    startY: number,
    summaryData: { label: string; value: string; highlight?: boolean }[]
): number {
    let currentY = startY;

    doc.setFontSize(REPORT_STYLES.fonts.heading);
    doc.setTextColor(...REPORT_STYLES.colors.secondary);
    doc.text("Resumen", REPORT_STYLES.margins.left, currentY);
    currentY += 8;

    // Crear tabla de resumen
    summaryData.forEach((item) => {
        doc.setFontSize(REPORT_STYLES.fonts.body);

        if (item.highlight) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...REPORT_STYLES.colors.primary);
        } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
        }

        doc.text(item.label + ":", REPORT_STYLES.margins.left + 5, currentY);
        doc.text(item.value, doc.internal.pageSize.getWidth() - REPORT_STYLES.margins.right - 5, currentY, {
            align: "right",
        });
        currentY += 6;
    });

    return currentY + 5;
}

/**
 * Formatea cifras monetarias
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency: "NIO",
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Descarga el PDF generado
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
}

/**
 * Genera un PDF en blob para preview o envío por email
 */
export function getPDFBlob(doc: jsPDF): Blob {
    return doc.output("blob");
}

export { REPORT_STYLES };

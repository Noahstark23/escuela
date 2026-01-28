import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface ExcelSheetData {
    sheetName: string;
    headers: string[];
    data: any[][];
}

/**
 * Genera un archivo Excel con una o múltiples hojas
 */
export function generateExcel(sheets: ExcelSheetData[], filename: string): void {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
        // Crear matriz de datos con headers
        const wsData = [sheet.headers, ...sheet.data];

        // Crear worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Aplicar estilos a los headers (ancho de columnas)
        const columnWidths = sheet.headers.map((header) => ({
            wch: Math.max(header.length, 15),
        }));
        worksheet["!cols"] = columnWidths;

        // Agregar al workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });

    // Descargar archivo
    XLSX.writeFile(workbook, filename);
}

/**
 * Genera un Excel simple con una sola hoja
 */
export function generateSimpleExcel(
    headers: string[],
    data: any[][],
    filename: string,
    sheetName: string = "Datos"
): void {
    generateExcel(
        [
            {
                sheetName,
                headers,
                data,
            },
        ],
        filename
    );
}

/**
 * Convierte un array de objetos a matriz para Excel
 */
export function objectsToMatrix<T extends Record<string, any>>(
    objects: T[],
    columns: { key: keyof T; header: string; formatter?: (value: any) => string }[]
): { headers: string[]; data: any[][] } {
    const headers = columns.map((col) => col.header);
    const data = objects.map((obj) =>
        columns.map((col) => {
            const value = obj[col.key];
            return col.formatter ? col.formatter(value) : value ?? "";
        })
    );

    return { headers, data };
}

/**
 * Formatea cifras monetarias para Excel
 */
export function formatCurrencyForExcel(amount: number): string {
    return new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency: "NIO",
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formatea fechas para Excel
 */
export function formatDateForExcel(date: Date): string {
    return format(date, "dd/MM/yyyy", { locale: es });
}

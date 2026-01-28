"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
    data: any[];
    fileName: string;
}

export function ExportButton({ data, fileName }: ExportButtonProps) {

    const cleanDataForExport = (rawData: any[]) => {
        return rawData.map((row) => {
            // Lógica para limpiar el campo Referencia/Nombre
            let referenciaLimpia = row.reference;

            // Si la referencia parece un JSON de nómina, intentamos limpiarla o usar otro campo
            if (typeof row.reference === 'string' && row.reference.startsWith('{')) {
                try {
                    // Si hay relación con empleado/estudiante, usamos eso preferiblemente
                    if (row.employee?.firstName) referenciaLimpia = `${row.employee.firstName} ${row.employee.lastName}`;
                    else if (row.student?.firstName) referenciaLimpia = `${row.student.firstName} ${row.student.lastName}`;
                    else referenciaLimpia = "Detalle de Sistema";
                } catch (e) {
                    referenciaLimpia = "Datos de Sistema";
                }
            }

            // Retornar objeto con claves en Español y valores limpios
            return {
                "Fecha": row.date ? new Date(row.date).toLocaleDateString("es-NI") : "-",
                "Tipo": row.type,
                "Categoría": row.category?.name || row.categoryId || "General",
                "Referencia / Nombre": referenciaLimpia || row.paymentMethod, // Fallback
                "Método de Pago": row.paymentMethod,
                "Monto": row.amount, // Mantener numérico para fórmulas de Excel
                "Notas": row.description || ""
            };
        });
    };

    const handleDownload = () => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar");
            return;
        }

        const processedData = cleanDataForExport(data);

        const worksheet = XLSX.utils.json_to_sheet(processedData);

        // Ajustar ancho de columnas automáticamente (Opcional pero útil)
        const wscols = [
            { wch: 15 }, // Fecha
            { wch: 10 }, // Tipo
            { wch: 20 }, // Categoria
            { wch: 30 }, // Referencia
            { wch: 15 }, // Metodo
            { wch: 15 }, // Monto
            { wch: 20 }  // Notas
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
        </Button>
    );
}

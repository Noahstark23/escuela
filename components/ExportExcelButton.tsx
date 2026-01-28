"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportExcelProps {
    data: any[];
    fileName?: string;
    label?: string;
}

export default function ExportExcelButton({
    data,
    fileName = "reporte",
    label = "Exportar a Excel"
}: ExportExcelProps) {

    const handleExport = () => {
        // 1. Crear hoja de trabajo
        const worksheet = XLSX.utils.json_to_sheet(data);

        // 2. Crear libro de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

        // 3. Generar buffer y descargar
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
        >
            <Download className="h-4 w-4" />
            {label}
        </Button>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { getStudentStatementData } from "@/actions/reports";
import {
    createPDF,
    addReportHeader,
    addReportFooter,
    addTable,
    formatCurrency,
    downloadPDF,
    REPORT_STYLES,
} from "@/lib/pdfGenerator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StudentStatementButtonProps {
    studentId: string;
    studentName: string;
}

export function StudentStatementButton({ studentId, studentName }: StudentStatementButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const result = await getStudentStatementData(studentId);

            if (!result.success || !result.data) {
                toast.error(result.error || "Error al generar el estado de cuenta");
                return;
            }

            const { student, totalPaid, transactionsByYear } = result.data;
            const doc = createPDF();

            // Header
            let currentY = addReportHeader(doc, {
                schoolName: "Colegio Privado",
                reportTitle: "Estado de Cuenta del Alumno",
                reportSubtitle: `${student.lastName}, ${student.firstName}`,
                generatedDate: new Date(),
            });

            // Información del alumno
            doc.setFontSize(REPORT_STYLES.fonts.heading);
            doc.setTextColor(...REPORT_STYLES.colors.secondary);
            doc.text("Información del Alumno", REPORT_STYLES.margins.left, currentY);
            currentY += 7;

            doc.setFontSize(REPORT_STYLES.fonts.body);
            doc.setTextColor(50, 50, 50);

            const studentInfo = [
                `Nombre: ${student.firstName} ${student.lastName}`,
                `Grado: ${student.grade}`,
                `Estado: ${student.status}`,
                `Tutor: ${student.guardian.firstName} ${student.guardian.lastName}`,
                `Teléfono: ${student.guardian.phone || "No registrado"}`,
                `Email: ${student.guardian.email || "No registrado"}`,
            ];

            studentInfo.forEach((info) => {
                doc.text(info, REPORT_STYLES.margins.left + 5, currentY);
                currentY += 5;
            });

            currentY += 5;

            // Resumen financiero
            doc.setFontSize(REPORT_STYLES.fonts.heading);
            doc.setTextColor(...REPORT_STYLES.colors.secondary);
            doc.text("Resumen Financiero", REPORT_STYLES.margins.left, currentY);
            currentY += 7;

            doc.setFontSize(REPORT_STYLES.fonts.body);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...REPORT_STYLES.colors.primary);
            doc.text("Total Pagado:", REPORT_STYLES.margins.left + 5, currentY);
            doc.text(
                formatCurrency(totalPaid),
                doc.internal.pageSize.getWidth() - REPORT_STYLES.margins.right - 5,
                currentY,
                { align: "right" }
            );
            currentY += 10;

            // Historial de transacciones por año
            const years = Object.keys(transactionsByYear).sort((a, b) => parseInt(b) - parseInt(a));

            for (const year of years) {
                const transactions = transactionsByYear[year];

                if (transactions.length > 0) {
                    // Título del año
                    doc.setFontSize(REPORT_STYLES.fonts.heading);
                    doc.setTextColor(...REPORT_STYLES.colors.secondary);
                    doc.text(`Año ${year}`, REPORT_STYLES.margins.left, currentY);
                    currentY += 5;

                    // Tabla de transacciones
                    currentY = addTable(doc, {
                        startY: currentY,
                        head: [["Fecha", "Categoría", "Tipo", "Referencia", "Monto"]],
                        body: transactions.map((t: any) => [
                            format(new Date(t.date), "dd/MM/yyyy"),
                            t.category?.name || "Sin categoría",
                            t.type === "INGRESO" ? "Pago" : "Cargo",
                            t.reference || "-",
                            formatCurrency(t.amount),
                        ]),
                    });

                    currentY += 5;
                }
            }

            // Si no hay transacciones
            if (student.transactions.length === 0) {
                doc.setFontSize(REPORT_STYLES.fonts.body);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    "No hay transacciones registradas para este alumno.",
                    REPORT_STYLES.margins.left,
                    currentY
                );
            }

            // Footer
            addReportFooter(doc, {
                pageNumbers: true,
                customText: "Sistema ERP Escolar",
            });

            // Descargar
            const filename = `estado-cuenta-${student.lastName.toLowerCase()}-${student.firstName.toLowerCase()}.pdf`;
            downloadPDF(doc, filename);

            toast.success("Estado de cuenta generado exitosamente");
        } catch (error) {
            console.error("Error generando estado de cuenta:", error);
            toast.error("Error al generar el estado de cuenta");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button onClick={handleGenerate} disabled={isGenerating} variant="outline" size="sm">
            {isGenerating ? (
                <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generando...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Estado de Cuenta PDF
                </>
            )}
        </Button>
    );
}

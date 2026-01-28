"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getBalanceSheetData } from "@/actions/balance";
import {
    createPDF,
    addReportHeader,
    addReportFooter,
    addTable,
    addSummarySection,
    formatCurrency,
    downloadPDF,
    REPORT_STYLES,
} from "@/lib/pdfGenerator";

export function BalanceSheetForm() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
    }, []);

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            toast.error("Seleccione las fechas");
            return;
        }

        setIsGenerating(true);

        try {
            const result = await getBalanceSheetData(new Date(startDate), new Date(endDate));

            if (!result.success || !result.data) {
                toast.error(result.error || "Error al generar balance");
                return;
            }

            const { incomeByCategory, expenseByCategory, totalIncome, totalExpense, netBalance } = result.data;

            const doc = createPDF();

            // Header
            let currentY = addReportHeader(doc, {
                schoolName: "Colegio Privado",
                reportTitle: "Balance General",
                reportSubtitle: `Del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}`,
                generatedDate: new Date(),
            });

            // Resumen
            currentY = addSummarySection(doc, currentY, [
                { label: "Total Ingresos", value: formatCurrency(totalIncome), highlight: true },
                { label: "Total Egresos", value: formatCurrency(totalExpense) },
                {
                    label: "Balance Neto",
                    value: formatCurrency(netBalance),
                    highlight: true,
                },
            ]);

            // Tabla de Ingresos
            const incomeEntries = Object.entries(incomeByCategory);
            if (incomeEntries.length > 0) {
                currentY = addTable(doc, {
                    title: "💰 Ingresos por Categoría",
                    startY: currentY,
                    head: [["Categoría", "Monto"]],
                    body: incomeEntries.map(([category, amount]) => [category, formatCurrency(amount)]),
                });
            }

            // Tabla de Egresos
            const expenseEntries = Object.entries(expenseByCategory);
            if (expenseEntries.length > 0) {
                currentY = addTable(doc, {
                    title: "📊 Egresos por Categoría",
                    startY: currentY,
                    head: [["Categoría", "Monto"]],
                    body: expenseEntries.map(([category, amount]) => [category, formatCurrency(amount)]),
                });
            }

            // Footer
            addReportFooter(doc, {
                pageNumbers: true,
                customText: "Sistema ERP Escolar",
            });

            // Descargar
            const filename = `balance-general-${startDate}-${endDate}.pdf`;
            downloadPDF(doc, filename);

            toast.success("Balance general generado exitosamente");
        } catch (error) {
            console.error("Error generando balance:", error);
            toast.error("Error al generar el balance");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Balance General
                </CardTitle>
                <CardDescription>Genera un informe financiero consolidado por período</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha Inicio</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha Fin</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Generar Balance PDF
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { getCollectionReportData } from "@/actions/reports";
import {
    createPDF,
    addReportHeader,
    addReportFooter,
    addTable,
    addSummarySection,
    formatCurrency,
    downloadPDF,
} from "@/lib/pdfGenerator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface CollectionReportFormProps {
    availableGrades: string[];
}

export function CollectionReportForm({ availableGrades }: CollectionReportFormProps) {
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(2026);
    const [grade, setGrade] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [years, setYears] = useState<number[]>([]);

    // Initialize with current date on client side to avoid hydration mismatch
    useEffect(() => {
        const currentDate = new Date();
        setMonth(currentDate.getMonth());
        setYear(currentDate.getFullYear());
        setYears(Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i));
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const result = await getCollectionReportData({
                month,
                year,
                grade: grade || undefined,
            });

            if (!result.success || !result.data) {
                toast.error(result.error || "Error al generar el reporte");
                return;
            }

            // Generar PDF en el cliente
            const { data } = result;
            const { students, stats } = data;

            const doc = createPDF();

            // Header
            const startY = addReportHeader(doc, {
                schoolName: "Colegio Privado",
                reportTitle: "Reporte Mensual de Cobranza",
                reportSubtitle: `${MONTHS[month]} ${year}${grade ? ` - Grado: ${grade}` : ""}`,
                generatedDate: new Date(),
            });

            // Resumen
            const collectionRate = stats.totalStudents > 0
                ? (stats.paidCount / stats.totalStudents) * 100
                : 0;

            const summaryY = addSummarySection(doc, startY, [
                { label: "Total de Alumnos Activos", value: stats.totalStudents.toString() },
                { label: "Alumnos que Pagaron", value: stats.paidCount.toString(), highlight: true },
                { label: "Alumnos Pendientes", value: stats.pendingCount.toString() },
                {
                    label: "Tasa de Cobranza",
                    value: `${collectionRate.toFixed(1)}%`,
                    highlight: true,
                },
                {
                    label: "Total Recaudado",
                    value: formatCurrency(stats.totalCollected),
                    highlight: true,
                },
            ]);

            // Separar pagados y morosos
            const paidStudents = students.filter((s) => s.transactions.length > 0);
            const pendingStudents = students.filter((s) => s.transactions.length === 0);

            // Tabla de estudiantes que pagaron
            if (paidStudents.length > 0) {
                const paidTableY = addTable(doc, {
                    title: "✅ Alumnos que Pagaron",
                    startY: summaryY,
                    head: [["#", "Estudiante", "Grado", "Tutor", "Monto Pagado", "Fecha"]],
                    body: paidStudents.map((s, index) => [
                        (index + 1).toString(),
                        `${s.lastName}, ${s.firstName}`,
                        s.grade,
                        `${s.guardian.lastName}, ${s.guardian.firstName}`,
                        formatCurrency(s.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)),
                        s.transactions[0] ? format(new Date(s.transactions[0].date), "dd/MM/yyyy") : "-",
                    ]),
                });

                // Tabla de estudiantes morosos
                if (pendingStudents.length > 0) {
                    addTable(doc, {
                        title: "⚠️ Alumnos Pendientes de Pago (Morosos)",
                        startY: paidTableY,
                        head: [["#", "Estudiante", "Grado", "Tutor", "Teléfono"]],
                        body: pendingStudents.map((s, index) => [
                            (index + 1).toString(),
                            `${s.lastName}, ${s.firstName}`,
                            s.grade,
                            `${s.guardian.lastName}, ${s.guardian.firstName}`,
                            s.guardian.phone || "No registrado",
                        ]),
                    });
                }
            } else {
                // Solo morosos
                addTable(doc, {
                    title: "⚠️ Todos los Alumnos están Pendientes de Pago",
                    startY: summaryY,
                    head: [["#", "Estudiante", "Grado", "Tutor", "Teléfono"]],
                    body: pendingStudents.map((s, index) => [
                        (index + 1).toString(),
                        `${s.lastName}, ${s.firstName}`,
                        s.grade,
                        `${s.guardian.lastName}, ${s.guardian.firstName}`,
                        s.guardian.phone || "No registrado",
                    ]),
                });
            }

            // Footer
            addReportFooter(doc, {
                pageNumbers: true,
                customText: "Sistema ERP Escolar",
            });

            // Descargar
            const filename = `reporte-cobranza-${MONTHS[month].toLowerCase()}-${year}.pdf`;
            downloadPDF(doc, filename);

            toast.success("Reporte generado exitosamente");
        } catch (error) {
            console.error("Error generando reporte:", error);
            toast.error("Error al generar el reporte");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reporte Mensual de Cobranza
                </CardTitle>
                <CardDescription>
                    Genera un reporte PDF detallado del estado de cobranza mensual
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selector de Mes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mes</label>
                        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selector de Año */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Año</label>
                        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selector de Grado (Opcional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Grado (Opcional)</label>
                        <Select value={grade || "ALL"} onValueChange={(v) => setGrade(v === "ALL" ? "" : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los grados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los grados</SelectItem>
                                {availableGrades.map((g) => (
                                    <SelectItem key={g} value={g}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full"
                >
                    {isGenerating ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Generar Reporte PDF
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { generateSimpleExcel, formatCurrencyForExcel } from "@/lib/excelGenerator";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface PayrollReportFormProps {
    employees: any[];
}

export function PayrollReportForm({ employees }: PayrollReportFormProps) {
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(2026);
    const [years, setYears] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const currentDate = new Date();
        setMonth(currentDate.getMonth());
        setYear(currentDate.getFullYear());
        setYears(Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i));
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            if (!employees || employees.length === 0) {
                toast.error("No hay empleados registrados");
                return;
            }

            // Calcular deducciones (porcentajes simplificados de Nicaragua)
            const INSS_RATE = 0.07; // 7% INSS laboral
            const IR_THRESHOLD = 100000; // Exención de IR
            const IR_RATE = 0.15; // 15% IR simplificado

            const payrollData = employees
                .filter((e) => e.status === "ACTIVO")
                .map((emp) => {
                    const baseSalary = emp.salary;
                    const inssDeduction = baseSalary * INSS_RATE;
                    const taxableIncome = baseSalary - inssDeduction - IR_THRESHOLD;
                    const irDeduction = taxableIncome > 0 ? taxableIncome * IR_RATE : 0;
                    const netSalary = baseSalary - inssDeduction - irDeduction;

                    return [
                        `${emp.lastName}, ${emp.firstName}`,
                        emp.position,
                        formatCurrencyForExcel(baseSalary),
                        formatCurrencyForExcel(inssDeduction),
                        formatCurrencyForExcel(irDeduction),
                        formatCurrencyForExcel(netSalary),
                    ];
                });

            // Calcular totales
            const totalBaseSalary = employees
                .filter((e) => e.status === "ACTIVO")
                .reduce((sum, emp) => sum + emp.salary, 0);
            const totalINSS = totalBaseSalary * INSS_RATE;
            const totalNet = employees
                .filter((e) => e.status === "ACTIVO")
                .reduce((sum, emp) => {
                    const inss = emp.salary * INSS_RATE;
                    const taxable = emp.salary - inss - IR_THRESHOLD;
                    const ir = taxable > 0 ? taxable * IR_RATE : 0;
                    return sum + (emp.salary - inss - ir);
                }, 0);

            payrollData.push(
                [],
                [
                    "TOTAL",
                    "",
                    formatCurrencyForExcel(totalBaseSalary),
                    formatCurrencyForExcel(totalINSS),
                    "",
                    formatCurrencyForExcel(totalNet),
                ]
            );

            generateSimpleExcel(
                ["Empleado", "Puesto", "Salario Base", "INSS (7%)", "IR", "Neto a Pagar"],
                payrollData,
                `nomina-${MONTHS[month].toLowerCase()}-${year}.xlsx`,
                `Nómina ${MONTHS[month]} ${year}`
            );

            toast.success("Reporte de nómina generado exitosamente");
        } catch (error) {
            console.error("Error generando nómina:", error);
            toast.error("Error al generar el reporte de nómina");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Reporte de Nómina Mensual
                </CardTitle>
                <CardDescription>
                    Genera un reporte Excel con salarios y deducciones del personal
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Generar Nómina Excel
                        </>
                    )}
                </Button>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        📊 El reporte incluye: Salario Base, INSS (7%), IR, y Neto a Pagar
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

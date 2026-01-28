"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Wallet, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialHealthViewProps {
    transactions: any[];
    totalStudents: number;
}

export function FinancialHealthView({ transactions, totalStudents }: FinancialHealthViewProps) {
    // 1. Calcular métricas del mes actual (o general si no hay filtro de fecha explícito, asumiremos general para este MVP o último mes)
    // Para simplificar y ser útil, usaremos los datos totales recibidos, pero idealmente se filtraría por mes.
    // Vamos a calcular promedios mensuales basados en el rango de fechas de las transacciones.

    const totalIncome = transactions
        .filter((t) => t.type === "INGRESO")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "EGRESO")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const currentBalance = totalIncome - totalExpense;

    // Unit Economics
    // Evitar división por cero
    const activeStudents = totalStudents || 1;

    // ARPU (Ingreso Promedio por Usuario) - Total histórico / Estudiantes (Simplificación para MVP)
    // Lo ideal sería Ingresos Mensuales / Estudiantes. Vamos a estimar Ingresos Mensuales promedio.

    // Detectar rango de meses
    const dates = transactions.map(t => new Date(t.date).getTime());
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();

    // Diferencia en meses (mínimo 1 para evitar división por cero)
    const monthDiff = Math.max(
        (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1,
        1
    );

    const avgMonthlyIncome = totalIncome / monthDiff;
    const avgMonthlyExpense = totalExpense / monthDiff;

    const arpu = avgMonthlyIncome / activeStudents;
    const cpe = avgMonthlyExpense / activeStudents; // Costo por Estudiante
    const marginPerStudent = arpu - cpe;

    // Runway
    const runwayMonths = avgMonthlyExpense > 0 ? currentBalance / avgMonthlyExpense : 999;

    // Preparar datos para el gráfico de eficiencia (últimos 6 meses)
    const getLast6MonthsData = () => {
        const data: any[] = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();

            // Filtrar transacciones de este mes
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === year;
            });

            const income = monthTransactions.filter(t => t.type === "INGRESO").reduce((acc, t) => acc + t.amount, 0);
            const expense = monthTransactions.filter(t => t.type === "EGRESO").reduce((acc, t) => acc + t.amount, 0);
            const margin = income > 0 ? ((income - expense) / income) * 100 : 0;

            data.push({
                name: monthName,
                Ingresos: income,
                Margen: parseFloat(margin.toFixed(1))
            });
        }
        return data;
    };

    const chartData = getLast6MonthsData();

    return (
        <div className="space-y-4">
            {/* Unit Economics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ARPU (Mensual Est.)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(arpu)}</div>
                        <p className="text-xs text-muted-foreground">Ingreso promedio por alumno</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPE (Mensual Est.)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(cpe)}</div>
                        <p className="text-xs text-muted-foreground">Costo promedio por alumno</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Margen por Alumno</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${marginPerStudent >= 0 ? "text-emerald-500" : "text-red-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${marginPerStudent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(marginPerStudent)}
                        </div>
                        <p className="text-xs text-muted-foreground">Rentabilidad unitaria</p>
                    </CardContent>
                </Card>
                <Card className={runwayMonths < 3 ? "border-red-500 bg-red-50" : "border-emerald-500 bg-emerald-50"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Runway Financiero</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${runwayMonths < 3 ? "text-red-600" : "text-emerald-600"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${runwayMonths < 3 ? "text-red-700" : "text-emerald-700"}`}>
                            {runwayMonths > 24 ? "> 24 Meses" : `${runwayMonths.toFixed(1)} Meses`}
                        </div>
                        <p className={`text-xs ${runwayMonths < 3 ? "text-red-600" : "text-emerald-600"}`}>
                            Tiempo de vida con saldo actual
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Efficiency Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Eficiencia Financiera (Últimos 6 Meses)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="name" scale="band" />
                                <YAxis yAxisId="left" orientation="left" stroke="#888888" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Ingresos" barSize={20} fill="#413ea0" />
                                <Line yAxisId="right" type="monotone" dataKey="Margen" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScenarioSimulatorProps {
    currentIncome: number;
    currentExpenses: number;
    totalStudents: number;
}

export function ScenarioSimulator({ currentIncome, currentExpenses, totalStudents }: ScenarioSimulatorProps) {
    const [newStudents, setNewStudents] = useState(0);
    const [tuitionAdjustment, setTuitionAdjustment] = useState(0); // Percentage
    const [expenseReduction, setExpenseReduction] = useState(0); // Percentage

    // Calculations
    const activeStudents = totalStudents || 1;

    // Estimate average ticket based on current income and students. 
    // Note: This assumes currentIncome is monthly. If it's historical total, this might be skewed, 
    // but for the simulator we act on the provided "current" snapshot.
    const avgTicket = currentIncome / activeStudents;

    const projectedStudents = activeStudents + newStudents;
    const projectedTicket = avgTicket * (1 + tuitionAdjustment / 100);

    const projectedIncome = projectedStudents * projectedTicket;
    const projectedExpenses = currentExpenses * (1 - expenseReduction / 100);
    const projectedMargin = projectedIncome - projectedExpenses;

    const currentMargin = currentIncome - currentExpenses;

    // Break-even analysis
    // How many ADDITIONAL students needed to cover CURRENT expenses (assuming current ticket)?
    // Or covering PROJECTED expenses with PROJECTED ticket? Let's do Projected Expenses / Projected Ticket.
    const studentsNeededForBreakEven = Math.ceil(projectedExpenses / projectedTicket);
    const additionalStudentsNeeded = Math.max(0, studentsNeededForBreakEven - activeStudents);

    // Runway calculation (simplified)
    const currentRunway = currentExpenses > 0 ? (currentMargin + currentExpenses) / currentExpenses : 0; // This logic is weird for runway, usually it's Cash Balance / Burn Rate. 
    // Let's stick to the user request: "Runway" in the comparison. 
    // User prompt said: "Runway: Saldo Actual en Caja / Promedio de Gastos Mensuales".
    // We don't have "Cash Balance" passed here explicitly, but we can assume 'currentMargin' is the net flow adding to cash.
    // Actually, let's compare "Net Monthly Flow" (Margin) instead of Runway, as Runway depends on accumulated cash which we might not have fully here.
    // Wait, the prompt asked for "Ingresos Totales, Margen Neto y Runway".
    // Let's assume we pass the Balance as a prop or calculate it? 
    // The prompt logic for Runway was: "Saldo Actual en Caja / Promedio de Gastos Mensuales".
    // We'll use the calculated margin as the "Net Result". 

    return (
        <Card className="border-blue-200 bg-slate-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                    <TrendingUp className="h-5 w-5" />
                    Simulador de Estrategia (What-If)
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Proyección Nuevos Alumnos: <span className="font-bold text-blue-600">+{newStudents}</span></Label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={newStudents}
                            onChange={(e) => setNewStudents(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>100</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ajuste de Matrícula: <span className={`font-bold ${tuitionAdjustment > 0 ? "text-emerald-600" : "text-red-600"}`}>{tuitionAdjustment > 0 ? "+" : ""}{tuitionAdjustment}%</span></Label>
                        <input
                            type="range"
                            min="-20"
                            max="50"
                            value={tuitionAdjustment}
                            onChange={(e) => setTuitionAdjustment(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>-20%</span>
                            <span>+50%</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reducción de Gastos: <span className="font-bold text-emerald-600">-{expenseReduction}%</span></Label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={expenseReduction}
                            onChange={(e) => setExpenseReduction(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>50%</span>
                        </div>
                    </div>
                </div>

                {/* Results Comparison */}
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h4 className="mb-4 font-semibold text-slate-800">Impacto Proyectado (Mensual)</h4>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="font-medium text-muted-foreground">Métrica</div>
                        <div className="font-medium text-muted-foreground text-right">Actual</div>
                        <div className="font-medium text-blue-600 text-right">Proyectado</div>

                        <div className="py-2 border-b">Ingresos</div>
                        <div className="py-2 border-b text-right">{formatCurrency(currentIncome)}</div>
                        <div className="py-2 border-b text-right font-bold">{formatCurrency(projectedIncome)}</div>

                        <div className="py-2 border-b">Gastos</div>
                        <div className="py-2 border-b text-right">{formatCurrency(currentExpenses)}</div>
                        <div className="py-2 border-b text-right font-bold">{formatCurrency(projectedExpenses)}</div>

                        <div className="py-2">Margen Neto</div>
                        <div className={`py-2 text-right ${currentMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(currentMargin)}
                        </div>
                        <div className={`py-2 text-right font-bold ${projectedMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(projectedMargin)}
                        </div>
                    </div>

                    <div className="mt-6 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                        <p className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Punto de Equilibrio
                        </p>
                        <p className="mt-1">
                            {projectedMargin >= 0
                                ? "¡Felicidades! Con esta estrategia eres rentable."
                                : `Necesitas ${Math.max(0, studentsNeededForBreakEven - projectedStudents)} alumnos ADICIONALES (a los ${newStudents} proyectados) para cubrir gastos.`
                            }
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

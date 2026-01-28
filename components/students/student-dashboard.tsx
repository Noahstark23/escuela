"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, AlertCircle, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface StudentDashboardProps {
    totalStudents: number;
    activeStudents: number;
    retentionRate: number;
    studentsWithDebt: number;
    studentsByGrade: { name: string; count: number }[];
}

export function StudentDashboard({
    totalStudents,
    activeStudents,
    retentionRate,
    studentsWithDebt,
    studentsByGrade,
}: StudentDashboardProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        de {totalStudents} registrados históricamente
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasa de Retención</CardTitle>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{retentionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Alumnos activos vs Total
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cartera Vencida</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{studentsWithDebt}</div>
                    <p className="text-xs text-muted-foreground">
                        Alumnos con saldo pendiente
                    </p>
                </CardContent>
            </Card>
            <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Población por Grado</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[80px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentsByGrade}>
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #ccc', fontSize: '12px' }}
                                    itemStyle={{ color: '#000' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

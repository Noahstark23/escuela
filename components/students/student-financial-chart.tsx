"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface StudentFinancialChartProps {
    transactions: any[];
}

export function StudentFinancialChart({ transactions }: StudentFinancialChartProps) {
    // Process transactions to get monthly payments history
    // We want to show "Payments" over the last 6 months.

    const getLast6MonthsData = () => {
        const data: any[] = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();

            // Filter payments (INGRESO) for this student in this month
            const monthlyPayments = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.type === "INGRESO" &&
                        tDate.getMonth() === d.getMonth() &&
                        tDate.getFullYear() === year;
                })
                .reduce((acc, t) => acc + t.amount, 0);

            data.push({
                name: monthName,
                Pagos: monthlyPayments
            });
        }
        return data;
    };

    const data = getLast6MonthsData();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Historial de Pagos (6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip formatter={(value: number) => [`$${value}`, "Pagado"]} />
                            <Line type="monotone" dataKey="Pagos" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CashFlowChartProps {
    data: {
        name: string;
        ingreso: number;
        egreso: number;
    }[];
}

export const CashFlowChart = ({ data }: CashFlowChartProps) => {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Flujo de Caja (Últimos 6 Meses)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `C$${value}`}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ingreso" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="egreso" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

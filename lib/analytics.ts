import { Transaction } from "@prisma/client";

export const getMonthlyCashFlow = (transactions: any[]) => {
    const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const data = months.map(month => ({
        name: month,
        Ingresos: 0,
        Egresos: 0
    }));

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthIndex = date.getMonth();

        if (t.type === "INGRESO") {
            data[monthIndex].Ingresos += t.amount;
        } else if (t.type === "EGRESO") {
            data[monthIndex].Egresos += t.amount;
        }
    });

    return data;
};

export const getExpensesByCategory = (transactions: any[]) => {
    const expenses = transactions.filter(t => t.type === "EGRESO");
    const categoryMap = new Map<string, number>();

    expenses.forEach(t => {
        const categoryName = t.category?.name || "Sin Categoría";
        const current = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, current + t.amount);
    });

    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#6366f1", "#d946ef"];

    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        fill: colors[index % colors.length]
    }));
};

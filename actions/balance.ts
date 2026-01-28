"use server";

import { db } from "@/lib/db";

export async function getBalanceSheetData(startDate: Date, endDate: Date) {
    try {
        // Obtener todas las transacciones en el período
        const transactions = await db.transaction.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        // Agrupar por categoría
        const incomeByCategory: Record<string, number> = {};
        const expenseByCategory: Record<string, number> = {};

        transactions.forEach((t) => {
            const categoryName = t.category?.name || "Sin categoría";
            if (t.type === "INGRESO") {
                incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + t.amount;
            } else {
                expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + t.amount;
            }
        });

        const totalIncome = Object.values(incomeByCategory).reduce((sum, val) => sum + val, 0);
        const totalExpense = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);
        const netBalance = totalIncome - totalExpense;

        return {
            success: true,
            data: {
                incomeByCategory,
                expenseByCategory,
                totalIncome,
                totalExpense,
                netBalance,
                startDate,
                endDate,
            },
        };
    } catch (error) {
        console.error("Error obteniendo balance:", error);
        return {
            success: false,
            error: "Error al obtener datos de balance",
        };
    }
}

"use server";

import { db } from "@/lib/db";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export async function getMonthlyCollectionStats(month: number, year: number) {
    try {
        // 1. Get all Active Students
        const activeStudents = await db.student.findMany({
            where: { status: "ACTIVO" },
            include: { guardian: true },
            orderBy: { lastName: "asc" }
        });

        // 2. Get "Mensualidad" Category ID
        const category = await db.transactionCategory.findFirst({
            where: { name: "Mensualidad" }
        });

        if (!category) {
            return {
                totalActive: activeStudents.length,
                paidCount: 0,
                percentage: 0,
                paidStudents: [],
                pendingStudents: activeStudents,
                monthName: MONTHS[month]
            };
        }

        // 3. Define Date Range for the Month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        const monthName = MONTHS[month];

        // 4. Get Transactions for this month (by Date OR by Reference)
        // We fetch all transactions for active students in this category to filter in memory
        // because filtering by "reference contains string" AND "date range" in OR condition might be complex in one query if we want to be precise.
        // Actually, let's try a precise Prisma query.

        const transactions = await db.transaction.findMany({
            where: {
                categoryId: category.id,
                studentId: { in: activeStudents.map(s => s.id) },
                OR: [
                    {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    {
                        reference: {
                            contains: monthName
                        }
                    }
                ]
            },
            select: {
                studentId: true
            }
        });

        const paidStudentIds = new Set(transactions.map(t => t.studentId).filter(id => id !== null) as string[]);

        const paidStudents = activeStudents.filter(s => paidStudentIds.has(s.id));
        const pendingStudents = activeStudents.filter(s => !paidStudentIds.has(s.id));

        const totalActive = activeStudents.length;
        const paidCount = paidStudentIds.size;
        const percentage = totalActive > 0 ? (paidCount / totalActive) * 100 : 0;

        return {
            totalActive,
            paidCount,
            percentage,
            paidStudents: paidStudents.map(s => s.id),
            pendingStudents,
            monthName
        };

    } catch (error) {
        console.error("Error calculating monthly stats:", error);
        return {
            totalActive: 0,
            paidCount: 0,
            percentage: 0,
            paidStudents: [],
            pendingStudents: [],
            monthName: MONTHS[month]
        };
    }
}

export async function getFinancialStats() {
    try {
        const today = new Date();
        const chartData = [];

        // Loop for the last 6 months (including current)
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = MONTHS[date.getMonth()];
            const year = date.getFullYear();

            const startDate = new Date(year, date.getMonth(), 1);
            const endDate = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);

            // Aggregate Income
            const income = await db.transaction.aggregate({
                where: {
                    type: "INGRESO",
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });

            // Aggregate Expense
            const expense = await db.transaction.aggregate({
                where: {
                    type: "EGRESO",
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });

            chartData.push({
                name: monthName.substring(0, 3), // Short name for chart
                ingreso: income._sum.amount || 0,
                egreso: expense._sum.amount || 0
            });
        }

        return chartData;
    } catch (error) {
        console.error("Error fetching financial stats:", error);
        return [];
    }
}

import { revalidatePath } from "next/cache";

export async function createTransaction(data: {
    type: "INGRESO" | "EGRESO";
    amount: number;
    categoryId?: string; // ID de la categoría seleccionada
    newCategory?: string; // Nombre si es una categoría nueva
    description?: string;
    paymentMethod: string;
    studentId?: string; // Solo para ingresos de matrícula/mensualidad
}) {
    try {
        let categoryId = data.categoryId;

        // Si el usuario escribió una categoría nueva (ej: "Gasolina"), la creamos al vuelo
        if (!categoryId && data.newCategory) {
            const newCat = await db.transactionCategory.create({
                data: { name: data.newCategory, isExpense: data.type === "EGRESO" }
            });
            categoryId = newCat.id;
        }

        await db.transaction.create({
            data: {
                amount: data.amount,
                type: data.type,
                categoryId: categoryId!, // Debe validarse en el front
                paymentMethod: data.paymentMethod,
                studentId: data.studentId,
                date: new Date(),
                reference: data.description || "Movimiento rápido" // Usar descripción como referencia
            }
        });

        revalidatePath("/"); // Actualizar Dashboard
        revalidatePath("/finance");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Error al registrar movimiento" };
    }
}

// Helper para cargar datos en los selectores
export async function getFinanceOptions() {
    const [categories, students] = await Promise.all([
        db.transactionCategory.findMany(),
        db.student.findMany({
            where: { status: "ACTIVO" },
            select: { id: true, firstName: true, lastName: true }
        })
    ]);
    return { categories, students };
}

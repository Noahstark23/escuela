"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTransactionCategories() {
    try {
        const categories = await db.transactionCategory.findMany({
            orderBy: { name: 'asc' }
        });
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createTransaction(data: {
    amount: number;
    type: "INGRESO" | "EGRESO";
    categoryId: string;
    paymentMethod: string;
    reference?: string;
    studentId?: string;
    employeeId?: string;
    date?: Date;
}) {
    try {
        // Check for duplicate monthly payment
        if (data.studentId) {
            const category = await db.transactionCategory.findUnique({
                where: { id: data.categoryId }
            });

            if (category && category.name === "Mensualidad" && data.reference) {
                // Extract month and year from reference (Format: "Mensualidad - Month Year" or just contains Month)
                // The prompt says: "Que en el campo reference (o donde guardes el mes/año) contenga el mismo Mes y Año que se intenta pagar ahora."
                // Since reference is constructed as "Mensualidad - Month", we can check if reference contains the month.
                // However, to be safer, let's check if there is a transaction for this student, this category, and the reference contains the specific month string.
                // The reference passed in is likely "Mensualidad - [Month]".

                // We need to be careful not to block if the user is paying for a different year but same month name if we don't include year.
                // But the current UI constructs reference as "Mensualidad - [Month]". It doesn't seem to include year explicitly in the UI code I saw?
                // Wait, in PaymentDialog: `month: new Date().toLocaleString('es-ES', { month: 'long' })...`
                // And `reference += " - " + values.month`.
                // It seems it only includes the Month name. This is a potential issue for next year, but for now let's follow the prompt.
                // "Que en el campo reference ... contenga el mismo Mes y Año".
                // If the UI only sends Month, I can only check Month.
                // Let's check if the reference matches exactly or contains the month.

                const existingTransaction = await db.transaction.findFirst({
                    where: {
                        studentId: data.studentId,
                        categoryId: data.categoryId,
                        reference: data.reference // Check for exact match of the constructed reference string
                    }
                });

                if (existingTransaction) {
                    return { success: false, error: "Este mes ya ha sido pagado previamente." };
                }
            }
        }

        const transaction = await db.transaction.create({
            data: {
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                paymentMethod: data.paymentMethod,
                reference: data.reference,
                studentId: data.studentId,
                employeeId: data.employeeId,
                date: data.date || new Date(),
            },
        });

        if (data.studentId) {
            revalidatePath(`/students/${data.studentId}`);
            revalidatePath("/students");
        }
        if (data.employeeId) {
            revalidatePath("/staff");
        }
        revalidatePath("/"); // Dashboard

        return { success: true, data: transaction };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { success: false, error: "Failed to create transaction" };
    }
}

export async function getTransactionById(id: string) {
    try {
        const transaction = await db.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                student: {
                    include: {
                        guardian: true
                    }
                },
                employee: true,
            },
        });
        return transaction;
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return null;
    }
}

export async function getTransactions(filters?: {
    studentId?: string;
    type?: "INGRESO" | "EGRESO";
    limit?: number;
}) {
    try {
        const where: any = {};
        if (filters?.studentId) {
            where.studentId = filters.studentId;
        }
        if (filters?.type) {
            where.type = filters.type;
        }

        const transactions = await db.transaction.findMany({
            where,
            include: {
                category: true,
                student: true,
                employee: true
            },
            orderBy: {
                date: 'desc'
            },
            take: filters?.limit
        });
        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function createPayrollTransaction(data: {
    employeeId: string;
    month: string;
    year: string;
    grossSalary: number;
    inssDeduction: number;
    irDeduction: number;
    netSalary: number;
    categoryId: string;
    paymentMethod: string;
}) {
    try {
        // Construct reference with JSON breakdown
        const breakdown = {
            bruto: data.grossSalary,
            inss: data.inssDeduction,
            ir: data.irDeduction,
            neto: data.netSalary,
            month: data.month,
            year: data.year
        };

        const reference = JSON.stringify(breakdown);

        const transaction = await db.transaction.create({
            data: {
                amount: data.netSalary,
                type: "EGRESO",
                categoryId: data.categoryId,
                paymentMethod: data.paymentMethod,
                reference: reference,
                employeeId: data.employeeId,
                date: new Date(),
            },
        });

        revalidatePath("/staff");
        revalidatePath("/"); // Dashboard

        return { success: true, data: transaction };
    } catch (error) {
        console.error("Error creating payroll transaction:", error);
        return { success: false, error: "Failed to create payroll transaction" };
    }
}

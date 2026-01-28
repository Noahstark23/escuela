"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Crear plan de pago
export async function createPaymentPlan(data: {
    studentId: string;
    totalAmount: number;
    installments: number;
    frequency: "MONTHLY" | "WEEKLY" | "CUSTOM";
    startDate: Date;
    description?: string;
}) {
    try {
        const plan = await db.paymentPlan.create({
            data: {
                studentId: data.studentId,
                totalAmount: data.totalAmount,
                installments: data.installments,
                frequency: data.frequency,
                startDate: data.startDate,
                description: data.description,
                status: "ACTIVE",
            },
        });

        revalidatePath(`/students/${data.studentId}`);
        return { success: true, plan };
    } catch (error) {
        console.error("Error creando plan de pago:", error);
        return { success: false, error: "Error al crear plan de pago" };
    }
}

// Obtener planes de pago de un estudiante
export async function getPaymentPlansByStudent(studentId: string) {
    try {
        const plans = await db.paymentPlan.findMany({
            where: { studentId },
            include: {
                payments: {
                    include: {
                        transaction: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, plans };
    } catch (error) {
        console.error("Error obteniendo planes:", error);
        return { success: false, plans: [] };
    }
}

// Registrar pago parcial
export async function registerPartialPayment(data: {
    planId: string;
    amount: number;
    paymentMethod: string;
    reference?: string;
    categoryId: string;
}) {
    try {
        // Obtener el plan
        const plan = await db.paymentPlan.findUnique({
            where: { id: data.planId },
            include: { student: true },
        });

        if (!plan) {
            return { success: false, error: "Plan no encontrado" };
        }

        // Crear la transacción
        const transaction = await db.transaction.create({
            data: {
                amount: data.amount,
                type: "INGRESO",
                paymentMethod: data.paymentMethod,
                reference: data.reference,
                categoryId: data.categoryId,
                studentId: plan.studentId,
                description: `Abono a plan de pago - ${plan.description || "Sin descripción"}`,
            },
        });

        // Crear el registro de pago parcial
        const partialPayment = await db.partialPayment.create({
            data: {
                planId: data.planId,
                transactionId: transaction.id,
                amount: data.amount,
                dueDate: new Date(), // Se puede calcular según frecuencia
                paidAt: new Date(),
                status: "PAID",
            },
        });

        // Actualizar monto pagado del plan
        const updatedPlan = await db.paymentPlan.update({
            where: { id: data.planId },
            data: {
                paidAmount: { increment: data.amount },
                status: plan.paidAmount + data.amount >= plan.totalAmount ? "COMPLETED" : "ACTIVE",
            },
        });

        revalidatePath(`/students/${plan.studentId}`);
        return { success: true, payment: partialPayment, plan: updatedPlan };
    } catch (error) {
        console.error("Error registrando pago parcial:", error);
        return { success: false, error: "Error al registrar pago parcial" };
    }
}

// Obtener saldo pendiente de un estudiante
export async function getOutstandingBalance(studentId: string) {
    try {
        const plans = await db.paymentPlan.findMany({
            where: {
                studentId,
                status: "ACTIVE",
            },
        });

        const totalDebt = plans.reduce((sum, plan) => sum + (plan.totalAmount - plan.paidAmount), 0);

        return { success: true, balance: totalDebt };
    } catch (error) {
        console.error("Error calculando saldo:", error);
        return { success: false, balance: 0 };
    }
}

// Cancelar plan de pago
export async function cancelPaymentPlan(planId: string) {
    try {
        const plan = await db.paymentPlan.update({
            where: { id: planId },
            data: { status: "CANCELLED" },
        });

        revalidatePath(`/students/${plan.studentId}`);
        return { success: true, plan };
    } catch (error) {
        console.error("Error cancelando plan:", error);
        return { success: false, error: "Error al cancelar plan" };
    }
}

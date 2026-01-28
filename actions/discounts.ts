"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Crear descuento
export async function createDiscount(data: {
    studentId: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    reason: string;
    startDate: Date;
    endDate?: Date;
}) {
    try {
        const discount = await db.discount.create({
            data: {
                studentId: data.studentId,
                type: data.type,
                value: data.value,
                reason: data.reason,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: true,
            },
        });

        revalidatePath(`/students/${data.studentId}`);
        return { success: true, discount };
    } catch (error) {
        console.error("Error creando descuento:", error);
        return { success: false, error: "Error al crear descuento" };
    }
}

// Obtener descuentos activos de un estudiante
export async function getActiveDiscounts(studentId: string) {
    try {
        const now = new Date();
        const discounts = await db.discount.findMany({
            where: {
                studentId,
                isActive: true,
                startDate: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, discounts };
    } catch (error) {
        console.error("Error obteniendo descuentos:", error);
        return { success: false, discounts: [] };
    }
}

// Calcular monto final con descuentos
export async function calculateDiscountedAmount(studentId: string, originalAmount: number) {
    try {
        const { discounts } = await getActiveDiscounts(studentId);

        let finalAmount = originalAmount;

        for (const discount of discounts) {
            if (discount.type === "PERCENTAGE") {
                finalAmount = finalAmount * (1 - discount.value / 100);
            } else if (discount.type === "FIXED") {
                finalAmount = Math.max(0, finalAmount - discount.value);
            }
        }

        return {
            success: true,
            originalAmount,
            finalAmount,
            totalDiscount: originalAmount - finalAmount,
        };
    } catch (error) {
        console.error("Error calculando descuento:", error);
        return { success: false, originalAmount, finalAmount: originalAmount, totalDiscount: 0 };
    }
}

// Desactivar descuento
export async function deactivateDiscount(discountId: string) {
    try {
        const discount = await db.discount.update({
            where: { id: discountId },
            data: { isActive: false },
        });

        revalidatePath(`/students/${discount.studentId}`);
        return { success: true, discount };
    } catch (error) {
        console.error("Error desactivando descuento:", error);
        return { success: false, error: "Error al desactivar descuento" };
    }
}

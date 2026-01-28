"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getCategories() {
    try {
        return await db.transactionCategory.findMany({ orderBy: { name: 'asc' } });
    } catch (error) {
        return [];
    }
}

export async function createCategory(name: string, isExpense: boolean) {
    try {
        await db.transactionCategory.create({
            data: { name, isExpense }
        });
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { error: "Error al crear categoría" };
    }
}

export async function deleteCategory(id: string) {
    try {
        // Check for transactions
        const count = await db.transaction.count({ where: { categoryId: id } });
        if (count > 0) {
            return { error: "No se puede eliminar: tiene transacciones asociadas" };
        }

        await db.transactionCategory.delete({ where: { id } });
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { error: "Error al eliminar categoría" };
    }
}

export async function getUsers() {
    try {
        return await db.user.findMany({ orderBy: { email: 'asc' } });
    } catch (error) {
        return [];
    }
}

export async function createUser(email: string, role: string = "ADMIN") {
    try {
        const existing = await db.user.findUnique({ where: { email } });
        if (existing) return { error: "El usuario ya existe" };

        const hashedPassword = await bcrypt.hash("123456", 10); // Default password
        await db.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                name: email.split('@')[0]
            }
        });
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        return { error: "Error al crear usuario" };
    }
}

"use server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function changePassword(currentPass: string, newPass: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return { error: "No autorizado" };

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: "Usuario no encontrado" };

    const match = await bcrypt.compare(currentPass, user.password);
    if (!match) return { error: "La contraseña actual es incorrecta" };

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await db.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword }
    });

    return { success: true };
}

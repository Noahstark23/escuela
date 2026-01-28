import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// --- 🛑 ZONA DE FUERZA BRUTA (Inyección de Variables) 🛑 ---
// Esto le dice al sistema DÓNDE está la base de datos manualmente.
// Asumimos que dev.db está en la carpeta prisma o raíz.
process.env.DATABASE_URL = "file:./dev.db";
// ------------------------------------------------------------

// Inicializamos Prisma con la URL forzada en el constructor por si acaso
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

export async function GET() {
    try {
        console.log("Intentando crear admin con URL:", process.env.DATABASE_URL);

        // 1. Encriptar contraseña
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // 2. Crear usuario en la base de datos
        // Usamos 'upsert' para que si ya existe, solo actualice la contraseña
        const user = await prisma.user.upsert({
            where: { email: "admin@school.com" },
            update: {
                password: hashedPassword,
                role: "ADMIN",
            },
            create: {
                email: "admin@school.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        return NextResponse.json({
            success: true,
            message: "✅ ¡ÉXITO! Usuario Admin creado correctamente.",
            user_id: user.id
        });

    } catch (error: any) {
        console.error("Error detallado:", error);
        return NextResponse.json({
            success: false,
            error_type: "Error de Base de Datos",
            message: error.message,
        }, { status: 500 });
    }
}
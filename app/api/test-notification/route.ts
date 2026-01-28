import { NextResponse } from "next/server";
import { createNotification } from "@/actions/notifications";

// Endpoint de prueba temporal para crear notificaciones
export async function POST() {
    try {
        const result = await createNotification({
            type: "SYSTEM",
            title: "🎉 Notificación de Prueba",
            message: "El sistema de notificaciones está funcionando correctamente. Esta es una prueba del polling automático.",
            priority: "HIGH",
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creando notificación de prueba:", error);
        return NextResponse.json(
            { success: false, error: "Error al crear notificación" },
            { status: 500 }
        );
    }
}

// También permitir GET para facilitar pruebas desde navegador
export async function GET() {
    return POST();
}

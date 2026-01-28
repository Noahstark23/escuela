import { NextResponse } from "next/server";
import { checkPendingPayments } from "@/actions/notifications";

// Cron endpoint para verificar pagos pendientes
// Se puede configurar en Vercel para ejecutarse diariamente
// https://vercel.com/docs/cron-jobs
export async function GET(request: Request) {
    try {
        // Verificar autorización (opcional - proteger con API key)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const result = await checkPendingPayments();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Se crearon ${result.createdCount} notificaciones`,
                count: result.createdCount,
            });
        }

        return NextResponse.json({
            success: false,
            error: result.error,
        }, { status: 500 });
    } catch (error) {
        console.error("Error en cron job:", error);
        return NextResponse.json({
            success: false,
            error: "Error ejecutando cron job",
        }, { status: 500 });
    }
}

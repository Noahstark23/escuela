import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Import authOptions to ensure session works
import fs from "fs";
import path from "path";

export async function GET() {
    const session = await getServerSession(authOptions);

    // Validación básica de seguridad
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Localizar la DB (ajusta el nombre si es necesario, ej: dev.db)
    const dbPath = path.join(process.cwd(), "dev.db");

    if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

    // Devolver el archivo como descarga
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Disposition": `attachment; filename=backup_school_${Date.now()}.db`,
            "Content-Type": "application/x-sqlite3",
        },
    });
}

"use server";

import { db } from "@/lib/db";
import {
    createPDF,
    addReportHeader,
    addReportFooter,
    addTable,
    addSummarySection,
    formatCurrency,
    downloadPDF,
    getPDFBlob,
} from "@/lib/pdfGenerator";
import { generateSimpleExcel, objectsToMatrix, formatCurrencyForExcel, formatDateForExcel } from "@/lib/excelGenerator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// ==================== REPORTE MENSUAL DE COBRANZA ====================

export interface CollectionReportData {
    month: number;
    year: number;
    grade?: string;
}

export async function generateCollectionReport(params: CollectionReportData) {
    try {
        const { month, year, grade } = params;

        // 1. Obtener todos los estudiantes activos
        const students = await db.student.findMany({
            where: {
                status: "ACTIVO",
                ...(grade && { grade }),
            },
            include: {
                guardian: true,
                transactions: {
                    where: {
                        type: "INGRESO",
                        date: {
                            gte: new Date(year, month, 1),
                            lte: new Date(year, month + 1, 0, 23, 59, 59),
                        },
                    },
                },
            },
            orderBy: { lastName: "asc" },
        });

        // 2. Calcular estadísticas
        const totalStudents = students.length;
        const paidStudents = students.filter((s) => s.transactions.length > 0);
        const pendingStudents = students.filter((s) => s.transactions.length === 0);
        const collectionRate = totalStudents > 0 ? (paidStudents.length / totalStudents) * 100 : 0;

        const totalCollected = students.reduce(
            (sum, s) => sum + s.transactions.reduce((tSum, t) => tSum + t.amount, 0),
            0
        );

        // 3. Crear PDF
        const doc = createPDF();

        // Header
        const startY = addReportHeader(doc, {
            schoolName: "Colegio Privado",
            reportTitle: "Reporte Mensual de Cobranza",
            reportSubtitle: `${MONTHS[month]} ${year}${grade ? ` - Grado: ${grade}` : ""}`,
            generatedDate: new Date(),
        });

        // Resumen
        const summaryY = addSummarySection(doc, startY, [
            { label: "Total de Alumnos Activos", value: totalStudents.toString() },
            { label: "Alumnos que Pagaron", value: paidStudents.length.toString(), highlight: true },
            { label: "Alumnos Pendientes", value: pendingStudents.length.toString() },
            {
                label: "Tasa de Cobranza",
                value: `${collectionRate.toFixed(1)}%`,
                highlight: true,
            },
            {
                label: "Total Recaudado",
                value: formatCurrency(totalCollected),
                highlight: true,
            },
        ]);

        // Tabla de estudiantes que pagaron
        if (paidStudents.length > 0) {
            const paidTableY = addTable(doc, {
                title: "✅ Alumnos que Pagaron",
                startY: summaryY,
                head: [["#", "Estudiante", "Grado", "Tutor", "Monto Pagado", "Fecha"]],
                body: paidStudents.map((s, index) => [
                    (index + 1).toString(),
                    `${s.lastName}, ${s.firstName}`,
                    s.grade,
                    `${s.guardian.lastName}, ${s.guardian.firstName}`,
                    formatCurrency(s.transactions.reduce((sum, t) => sum + t.amount, 0)),
                    s.transactions[0] ? format(new Date(s.transactions[0].date), "dd/MM/yyyy") : "-",
                ]),
            });

            // Tabla de estudiantes morosos
            if (pendingStudents.length > 0) {
                addTable(doc, {
                    title: "⚠️ Alumnos Pendientes de Pago (Morosos)",
                    startY: paidTableY,
                    head: [["#", "Estudiante", "Grado", "Tutor", "Teléfono"]],
                    body: pendingStudents.map((s, index) => [
                        (index + 1).toString(),
                        `${s.lastName}, ${s.firstName}`,
                        s.grade,
                        `${s.guardian.lastName}, ${s.guardian.firstName}`,
                        s.guardian.phone || "No registrado",
                    ]),
                });
            }
        } else {
            // Solo morosos
            addTable(doc, {
                title: "⚠️ Todos los Alumnos están Pendientes de Pago",
                startY: summaryY,
                head: [["#", "Estudiante", "Grado", "Tutor", "Teléfono"]],
                body: pendingStudents.map((s, index) => [
                    (index + 1).toString(),
                    `${s.lastName}, ${s.firstName}`,
                    s.grade,
                    `${s.guardian.lastName}, ${s.guardian.firstName}`,
                    s.guardian.phone || "No registrado",
                ]),
            });
        }

        // Footer
        addReportFooter(doc, {
            pageNumbers: true,
            customText: "Sistema ERP Escolar",
        });

        // Retornar el PDF como blob para descarga en el cliente
        const pdfBlob = getPDFBlob(doc);
        const filename = `reporte-cobranza-${MONTHS[month].toLowerCase()}-${year}.pdf`;

        // Convertir blob a base64 para enviar al cliente
        return {
            success: true,
            filename,
            // En un escenario real, devolverías una URL firmada o subirías a storage
            message: "Reporte generado exitosamente. Usa el componente cliente para descargar.",
        };
    } catch (error) {
        console.error("Error generando reporte de cobranza:", error);
        return {
            success: false,
            error: "Error al generar el reporte de cobranza",
        };
    }
}

// Versión que devuelve datos para generar en el cliente
export async function getCollectionReportData(params: CollectionReportData) {
    try {
        const { month, year, grade } = params;

        const students = await db.student.findMany({
            where: {
                status: "ACTIVO",
                ...(grade && { grade }),
            },
            include: {
                guardian: true,
                transactions: {
                    where: {
                        type: "INGRESO",
                        date: {
                            gte: new Date(year, month, 1),
                            lte: new Date(year, month + 1, 0, 23, 59, 59),
                        },
                    },
                },
            },
            orderBy: { lastName: "asc" },
        });

        return {
            success: true,
            data: {
                month,
                year,
                grade,
                students,
                stats: {
                    totalStudents: students.length,
                    paidCount: students.filter((s) => s.transactions.length > 0).length,
                    pendingCount: students.filter((s) => s.transactions.length === 0).length,
                    totalCollected: students.reduce(
                        (sum, s) => sum + s.transactions.reduce((tSum, t) => tSum + t.amount, 0),
                        0
                    ),
                },
            },
        };
    } catch (error) {
        console.error("Error obteniendo datos de cobranza:", error);
        return {
            success: false,
            error: "Error al obtener datos de cobranza",
        };
    }
}

// ==================== ESTADO DE CUENTA POR ALUMNO ====================

export async function getStudentStatementData(studentId: string) {
    try {
        const student = await db.student.findUnique({
            where: { id: studentId },
            include: {
                guardian: true,
                transactions: {
                    orderBy: { date: "desc" },
                    include: { category: true },
                },
            },
        });

        if (!student) {
            return { success: false, error: "Estudiante no encontrado" };
        }

        // Calcular totales
        const totalPaid = student.transactions
            .filter((t) => t.type === "INGRESO")
            .reduce((sum, t) => sum + t.amount, 0);

        // Separar por año
        const currentYear = new Date().getFullYear();
        const transactionsByYear = student.transactions.reduce((acc: any, t) => {
            const year = new Date(t.date).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(t);
            return acc;
        }, {});

        return {
            success: true,
            data: {
                student,
                totalPaid,
                transactionsByYear,
            },
        };
    } catch (error) {
        console.error("Error obteniendo estado de cuenta:", error);
        return { success: false, error: "Error al obtener estado de cuenta" };
    }
}

export async function generateStudentStatement(studentId: string) {
    try {
        const result = await getStudentStatementData(studentId);

        if (!result.success || !result.data) {
            return { success: false, error: result.error };
        }

        // El cliente generará el PDF
        return {
            success: true,
            message: "Datos obtenidos correctamente",
        };
    } catch (error) {
        return { success: false, error: "Error al generar estado de cuenta" };
    }
}

// ==================== REPORTE DE NÓMINA ====================

export async function generatePayrollReport(month: number, year: number) {
    try {
        // Placeholder - Implementaremos esto después
        return {
            success: true,
            message: "Función de nómina en desarrollo",
        };
    } catch (error) {
        return { success: false, error: "Error al generar reporte de nómina" };
    }
}

// ==================== BALANCE GENERAL ====================

export async function generateBalanceSheet(startDate: Date, endDate: Date) {
    try {
        // Placeholder - Implementaremos esto después
        return {
            success: true,
            message: "Función de balance en desarrollo",
        };
    } catch (error) {
        return { success: false, error: "Error al generar balance general" };
    }
}

// ==================== UTILIDADES ====================

export async function getAvailableGrades() {
    const grades = await db.student.findMany({
        where: { status: "ACTIVO" },
        select: { grade: true },
        distinct: ["grade"],
        orderBy: { grade: "asc" },
    });

    return grades.map((g) => g.grade);
}

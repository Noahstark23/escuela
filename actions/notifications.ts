"use server";

import { db } from "@/lib/db";

// Tipos de notificaciones
export type NotificationType =
    | "PAYMENT_PENDING"
    | "PAYMENT_RECEIVED"
    | "MONTHLY_DUE"
    | "SYSTEM"
    | "ALERT";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    userId?: string;
    studentId?: string;
    expiresAt?: Date;
}

// Crear notificación
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await db.notification.create({
            data: {
                type: params.type,
                title: params.title,
                message: params.message,
                priority: params.priority || "MEDIUM",
                userId: params.userId,
                studentId: params.studentId,
                expiresAt: params.expiresAt,
            },
        });

        return { success: true, notification };
    } catch (error) {
        console.error("Error creando notificación:", error);
        return { success: false, error: "Error al crear notificación" };
    }
}

// Obtener notificaciones del usuario
export async function getNotifications(userId?: string) {
    try {
        const where: any = {
            AND: [
                {
                    OR: [
                        { userId: userId },
                        { userId: null }
                    ]
                },
                {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: new Date() } }
                    ]
                }
            ]
        };

        const notifications = await db.notification.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: [
                { isRead: "asc" },
                { createdAt: "desc" },
            ],
            take: 50,
        });

        return { success: true, notifications };
    } catch (error) {
        console.error("Error obteniendo notificaciones:", error);
        return { success: false, error: "Error al obtener notificaciones" };
    }
}

// Marcar como leída
export async function markAsRead(notificationId: string) {
    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error("Error marcando notificación:", error);
        return { success: false, error: "Error al marcar notificación" };
    }
}

// Marcar todas como leídas
export async function markAllAsRead(userId?: string) {
    try {
        await db.notification.updateMany({
            where: {
                userId: userId || undefined,
                isRead: false,
            },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error("Error marcando todas las notificaciones:", error);
        return { success: false, error: "Error al marcar notificaciones" };
    }
}

// Obtener número de notificaciones no leídas
export async function getUnreadCount(userId?: string) {
    try {
        const count = await db.notification.count({
            where: {
                AND: [
                    {
                        OR: [
                            { userId: userId },
                            { userId: null }
                        ]
                    },
                    { isRead: false },
                    {
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gte: new Date() } }
                        ]
                    }
                ]
            },
        });

        return { success: true, count };
    } catch (error) {
        console.error("Error contando notificaciones:", error);
        return { success: false, count: 0 };
    }
}

// Verificar pagos pendientes y crear notificaciones
export async function checkPendingPayments() {
    try {
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Obtener categoría de mensualidad
        const category = await db.transactionCategory.findFirst({
            where: { name: { contains: "Mensualidad" } },
        });

        if (!category) return { success: false, error: "Categoría no encontrada" };

        // Estudiantes activos
        const students = await db.student.findMany({
            where: { status: "ACTIVO" },
            include: {
                transactions: {
                    where: {
                        categoryId: category.id,
                        date: { gte: fiveDaysAgo },
                    },
                },
            },
        });

        let createdCount = 0;

        for (const student of students) {
            // Si no tiene pagos en los últimos 5 días
            if (student.transactions.length === 0) {
                // Verificar si ya existe notificación similar reciente
                const existingNotification = await db.notification.findFirst({
                    where: {
                        studentId: student.id,
                        type: "PAYMENT_PENDING",
                        createdAt: { gte: fiveDaysAgo },
                    },
                });

                if (!existingNotification) {
                    await createNotification({
                        type: "PAYMENT_PENDING",
                        title: "Pago Pendiente",
                        message: `${student.firstName} ${student.lastName} no ha realizado el pago mensual`,
                        priority: "HIGH",
                        studentId: student.id,
                    });
                    createdCount++;
                }
            }
        }

        return { success: true, createdCount };
    } catch (error) {
        console.error("Error verificando pagos pendientes:", error);
        return { success: false, error: "Error al verificar pagos" };
    }
}

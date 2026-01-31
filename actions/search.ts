"use server";

import { db } from "@/lib/db";

export interface SearchResult {
    students: {
        id: string;
        firstName: string;
        lastName: string;
        grade: string;
        guardian: {
            firstName: string;
            lastName: string;
        };
    }[];
    employees: {
        id: string;
        firstName: string;
        lastName: string;
        position: string;
        status: string;
    }[];
    transactions: {
        id: string;
        date: Date;
        amount: number;
        type: string;
        reference: string | null;
        description: string | null;
        category: {
            name: string;
        } | null;
    }[];
}

export async function globalSearch(query: string): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
        return {
            students: [],
            employees: [],
            transactions: [],
        };
    }

    const searchTerm = query.trim();

    try {
        const [students, employees, transactions] = await Promise.all([
            // Buscar estudiantes
            db.student.findMany({
                where: {
                    OR: [
                        { firstName: { contains: searchTerm } },
                        { lastName: { contains: searchTerm } },
                        { grade: { contains: searchTerm } },
                        {
                            guardian: {
                                OR: [
                                    { firstName: { contains: searchTerm } },
                                    { lastName: { contains: searchTerm } },
                                ],
                            },
                        },
                    ],
                },
                include: {
                    guardian: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                take: 5,
                orderBy: {
                    lastName: "asc",
                },
            }),

            // Buscar empleados
            db.employee.findMany({
                where: {
                    OR: [
                        { firstName: { contains: searchTerm } },
                        { lastName: { contains: searchTerm } },
                        { position: { contains: searchTerm } },
                    ],
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    position: true,
                    status: true,
                },
                take: 5,
                orderBy: {
                    lastName: "asc",
                },
            }),

            // Buscar transacciones
            db.transaction.findMany({
                where: {
                    OR: [
                        { reference: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                        // Buscar por monto (si es número)
                        ...(isNaN(Number(searchTerm))
                            ? []
                            : [{ amount: { equals: Number(searchTerm) } }]),
                    ],
                },
                include: {
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
                take: 5,
                orderBy: {
                    date: "desc",
                },
            }),
        ]);

        return {
            students,
            employees,
            transactions,
        };
    } catch (error) {
        console.error("Error en búsqueda global:", error);
        return {
            students: [],
            employees: [],
            transactions: [],
        };
    }
}

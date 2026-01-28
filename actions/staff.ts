"use server";

import { PrismaClient } from "@prisma/client";

// Instancia segura de Prisma para evitar conexiones zombies
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const db = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function getEmployees() {
    try {
        const employees = await db.employee.findMany({
            orderBy: {
                lastName: "asc"
            },
            include: {
                transactions: {
                    orderBy: {
                        date: 'desc'
                    },
                    include: {
                        category: true
                    }
                }
            }
        });
        return employees;
    } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
}

export async function createEmployee(data: {
    firstName: string;
    lastName: string;
    position: string;
    salary: number;
    phone?: string;
    email?: string;
    hireDate?: Date;
    baseSalary?: number;
    cedula?: string;
    bankAccount?: string;
}) {
    try {
        const employee = await db.employee.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                position: data.position,
                salary: data.salary,
                baseSalary: data.baseSalary || data.salary,
                phone: data.phone,
                email: data.email,
                hireDate: data.hireDate,
                cedula: data.cedula,
                bankAccount: data.bankAccount,
            }
        });
        return { success: true, data: employee };
    } catch (error) {
        console.error("Error creating employee:", error);
        return { success: false, error: "Failed to create employee" };
    }
}

export async function getEmployeeById(id: string) {
    try {
        if (!id) throw new Error("ID requerido");

        const employee = await db.employee.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 5
                }
            }
        });

        return employee;
    } catch (error) {
        console.error("Error fetching employee:", error);
        return null;
    }
}

export async function updateEmployee(id: string, data: {
    firstName: string;
    lastName: string;
    position: string;
    baseSalary: number;
    phone?: string;
    email?: string;
    bankAccount?: string;
    cedula?: string;
}) {
    try {
        const employee = await db.employee.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                position: data.position,
                baseSalary: data.baseSalary,
                salary: data.baseSalary, // Keep synced
                phone: data.phone,
                email: data.email,
                bankAccount: data.bankAccount,
                cedula: data.cedula,
            }
        });
        return { success: true, data: employee };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { success: false, error: "Failed to update employee" };
    }
}

export async function terminateEmployee(id: string, terminationDate: Date) {
    try {
        const employee = await db.employee.update({
            where: { id },
            data: {
                status: "INACTIVE",
                terminationDate: terminationDate
            }
        });
        return { success: true, data: employee };
    } catch (error) {
        console.error("Error terminating employee:", error);
        return { success: false, error: "Failed to terminate employee" };
    }
}

export async function updateEmployeeStatus(id: string, status: string) {
    try {
        await db.employee.update({
            where: { id },
            data: {
                status,
                terminationDate: status === 'INACTIVE' ? new Date() : null
            }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar estado" };
    }
}

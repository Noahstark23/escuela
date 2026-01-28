"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { QuickPaymentDialog } from "@/components/payments/QuickPaymentDialog";
import { getOutstandingBalance } from "@/actions/paymentPlans";

interface StudentListProps {
    students: any[];
    paidStudentIds?: string[];
}

export function StudentList({ students, paidStudentIds }: StudentListProps) {
    const router = useRouter();
    const [balances, setBalances] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBalances = async () => {
            const balanceMap = new Map<string, number>();

            for (const student of students) {
                const result = await getOutstandingBalance(student.id);
                balanceMap.set(student.id, result.balance);
            }

            setBalances(balanceMap);
            setIsLoading(false);
        };

        loadBalances();
    }, [students]);

    const refreshBalances = async () => {
        setIsLoading(true);
        const balanceMap = new Map<string, number>();

        for (const student of students) {
            const result = await getOutstandingBalance(student.id);
            balanceMap.set(student.id, result.balance);
        }

        setBalances(balanceMap);
        setIsLoading(false);
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Grado</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Estado de Cuenta</TableHead>
                        <TableHead className="text-right">Saldo Pendiente</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => {
                        const balance = balances.get(student.id) || 0;

                        let badgeColor = "bg-emerald-500 hover:bg-emerald-600";
                        let statusText = "Al Día";

                        if (balance > 1000) {
                            badgeColor = "bg-red-500 hover:bg-red-600";
                            statusText = "Riesgo";
                        } else if (balance > 0) {
                            badgeColor = "bg-yellow-500 hover:bg-yellow-600";
                            statusText = "Atención";
                        }

                        return (
                            <TableRow
                                key={student.id}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell
                                    className="font-medium"
                                    onClick={() => router.push(`/students/${student.id}`)}
                                >
                                    {student.lastName}, {student.firstName}
                                </TableCell>
                                <TableCell onClick={() => router.push(`/students/${student.id}`)}>
                                    {student.grade}
                                </TableCell>
                                <TableCell onClick={() => router.push(`/students/${student.id}`)}>
                                    {student.guardian.firstName} {student.guardian.lastName}
                                </TableCell>
                                <TableCell onClick={() => router.push(`/students/${student.id}`)}>
                                    <Badge variant={student.status === "ACTIVO" ? "default" : "secondary"}>
                                        {student.status}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={() => router.push(`/students/${student.id}`)}>
                                    <Badge className={badgeColor}>
                                        {statusText}
                                    </Badge>
                                </TableCell>
                                <TableCell
                                    className="text-right font-medium"
                                    onClick={() => router.push(`/students/${student.id}`)}
                                >
                                    {isLoading ? "..." : formatCurrency(balance)}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    {balance > 0 && (
                                        <QuickPaymentDialog
                                            studentId={student.id}
                                            studentName={`${student.firstName} ${student.lastName}`}
                                            outstandingBalance={balance}
                                            onSuccess={refreshBalances}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No hay estudiantes registrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

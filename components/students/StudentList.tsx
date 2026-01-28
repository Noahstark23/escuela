"use client";

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
import { formatCurrency } from "@/lib/utils"; // Assuming this exists or I'll create it/inline it

interface StudentListProps {
    students: any[];
    paidStudentIds?: string[];
}

export function StudentList({ students, paidStudentIds }: StudentListProps) {
    const router = useRouter();

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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => {
                        const isPaid = paidStudentIds ? paidStudentIds.includes(student.id) : false;
                        return (
                            <TableRow
                                key={student.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => router.push(`/students/${student.id}`)}
                            >
                                <TableCell className="font-medium">
                                    {student.lastName}, {student.firstName}
                                </TableCell>
                                <TableCell>{student.grade}</TableCell>
                                <TableCell>
                                    {student.guardian.firstName} {student.guardian.lastName}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={student.status === "ACTIVO" ? "default" : "secondary"}>
                                        {student.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const isPaid = paidStudentIds ? paidStudentIds.includes(student.id) : false;
                                        // Mock balance logic for demo: 
                                        // Paid = 0
                                        // Not Paid = 1500 (Red Risk) or 500 (Yellow Attention)
                                        // Let's randomize slightly for demo if not paid, or just use fixed logic
                                        const mockBalance = isPaid ? 0 : 1500;

                                        let badgeColor = "bg-emerald-500 hover:bg-emerald-600";
                                        let statusText = "Al Día";

                                        if (mockBalance > 1000) {
                                            badgeColor = "bg-red-500 hover:bg-red-600";
                                            statusText = "Riesgo";
                                        } else if (mockBalance > 0) {
                                            badgeColor = "bg-yellow-500 hover:bg-yellow-600";
                                            statusText = "Atención";
                                        }

                                        return (
                                            <Badge className={badgeColor}>
                                                {statusText}
                                            </Badge>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(() => {
                                        const isPaid = paidStudentIds ? paidStudentIds.includes(student.id) : false;
                                        const mockBalance = isPaid ? 0 : 1500;
                                        return formatCurrency(mockBalance);
                                    })()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={paidStudentIds ? 6 : 5} className="h-24 text-center">
                                No hay estudiantes registrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInMonths, addMonths, setDate, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";

interface EmployeeListProps {
    employees: any[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
    const getNextPaymentDate = () => {
        const today = new Date();
        const fifteenth = setDate(today, 15);
        const thirtieth = setDate(today, 30); // Approximate for end of month

        if (isAfter(today, thirtieth)) {
            return setDate(addMonths(today, 1), 15);
        } else if (isAfter(today, fifteenth)) {
            return thirtieth;
        } else {
            return fifteenth;
        }
    };

    const nextPayment = getNextPaymentDate();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Antigüedad</TableHead>
                        <TableHead>Próximo Pago</TableHead>
                        <TableHead className="text-right">Salario Base</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => {
                        const hireDate = employee.hireDate ? new Date(employee.hireDate) : new Date();
                        const monthsOfService = differenceInMonths(new Date(), hireDate);
                        const isNewHire = monthsOfService < 6;

                        return (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{employee.lastName}, {employee.firstName}</span>
                                        {isNewHire && (
                                            <Badge className="w-fit mt-1 bg-blue-500 hover:bg-blue-600 text-[10px] px-1 py-0 h-5">
                                                Nuevo Ingreso
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>
                                    {employee.hireDate
                                        ? format(new Date(employee.hireDate), "dd/MM/yyyy", { locale: es })
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    {format(nextPayment, "dd 'de' MMMM", { locale: es })}
                                </TableCell>
                                <TableCell className="text-right">
                                    {employee.baseSalary ? formatCurrency(employee.baseSalary) : (employee.salary ? formatCurrency(employee.salary) : "-")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/staff/${employee.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {employees.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No hay empleados registrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

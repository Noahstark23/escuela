"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, Filter } from "lucide-react";

interface Transaction {
    id: string;
    amount: number;
    type: "INGRESO" | "EGRESO";
    category: { name: string };
    paymentMethod: string;
    reference?: string | null;
    date: Date;
    student?: { firstName: string; lastName: string } | null;
    employee?: { firstName: string; lastName: string } | null;
}

interface FinanceTableProps {
    initialTransactions: Transaction[];
}

export function FinanceTable({ initialTransactions }: FinanceTableProps) {
    const [filter, setFilter] = useState<"ALL" | "INGRESO" | "EGRESO">("ALL");

    const filteredTransactions = initialTransactions.filter((t) => {
        if (filter === "ALL") return true;
        return t.type === filter;
    });

    const handleExport = () => {
        // Visual only for now as requested
        alert("Funcionalidad de exportar a CSV próximamente.");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={filter}
                        onValueChange={(value: "ALL" | "INGRESO" | "EGRESO") =>
                            setFilter(value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Ver todo</SelectItem>
                            <SelectItem value="INGRESO">Solo Ingresos</SelectItem>
                            <SelectItem value="EGRESO">Solo Gastos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a CSV
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Referencia / Nombre</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No se encontraron transacciones.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((transaction) => {
                                const isIncome = transaction.type === "INGRESO";
                                const entityName = transaction.student
                                    ? `${transaction.student.lastName}, ${transaction.student.firstName}`
                                    : transaction.employee
                                        ? `${transaction.employee.lastName}, ${transaction.employee.firstName}`
                                        : transaction.reference || "-";

                                return (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {format(new Date(transaction.date), "dd/MM/yyyy", {
                                                locale: es,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={isIncome ? "default" : "destructive"}
                                                className={
                                                    isIncome
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                                }
                                            >
                                                {transaction.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{transaction.category.name}</TableCell>
                                        <TableCell className="font-medium">
                                            {entityName}
                                        </TableCell>
                                        <TableCell>{transaction.paymentMethod}</TableCell>
                                        <TableCell
                                            className={`text-right font-bold ${isIncome ? "text-emerald-600" : "text-red-600"
                                                }`}
                                        >
                                            {isIncome ? "+" : "-"}
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-muted-foreground text-center">
                Mostrando {filteredTransactions.length} de {initialTransactions.length} transacciones
            </div>
        </div>
    );
}

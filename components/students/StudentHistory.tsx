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
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StudentHistoryProps {
    transactions: any[];
}

export function StudentHistory({ transactions }: StudentHistoryProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                {format(new Date(tx.date), "dd/MM/yyyy", { locale: es })}
                            </TableCell>
                            <TableCell>{tx.category.name}</TableCell>
                            <TableCell>{tx.paymentMethod}</TableCell>
                            <TableCell>{tx.reference || "-"}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600">
                                + {formatCurrency(tx.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No hay transacciones registradas.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

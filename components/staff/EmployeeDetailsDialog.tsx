"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { es } from "date-fns/locale";
import { calculateIndemnity, calculateVacationPay } from "@/lib/payrollUtils";
import { User, Calendar, CreditCard, Building2, Wallet } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { FileText } from "lucide-react";

interface EmployeeDetailsDialogProps {
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        position: string;
        hireDate?: Date | null;
        baseSalary?: number | null;
        cedula?: string | null;
        bankAccount?: string | null;
        accumulatedVacation: number;
        email?: string | null;
        phone?: string | null;
        transactions?: any[];
        salary?: number | null;
    };
}

export function EmployeeDetailsDialog({ employee }: EmployeeDetailsDialogProps) {
    const hireDate = employee.hireDate ? new Date(employee.hireDate) : null;
    const yearsOfService = hireDate ? differenceInYears(new Date(), hireDate) : 0;
    const monthsOfService = hireDate ? differenceInMonths(new Date(), hireDate) : 0;

    const salary = employee.baseSalary || employee.salary || 0;
    const vacationValue = calculateVacationPay(salary, employee.accumulatedVacation || 0) || 0;
    const indemnityValue = calculateIndemnity(salary, yearsOfService + (monthsOfService % 12) / 12) || 0;

    const payrollTransactions = employee.transactions?.filter(t => t.type === "EGRESO") || [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Ver Detalles</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">{employee.firstName} {employee.lastName}</DialogTitle>
                    <DialogDescription>
                        {employee.position} | {employee.cedula || "Sin Cédula"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Detalles y Prestaciones</TabsTrigger>
                        <TabsTrigger value="history">Historial de Pagos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <div className="grid gap-6 py-4">
                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.email || "Sin email"}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.phone || "Sin teléfono"}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Ingreso: {hireDate ? format(hireDate, "PPP", { locale: es }) : "-"}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span>Cuenta: {employee.bankAccount || "No registrada"}</span>
                                </div>
                            </div>

                            {/* Financial Stats */}
                            <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                                <h4 className="font-semibold flex items-center">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Datos Financieros & Prestaciones
                                </h4>

                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <div className="text-muted-foreground">Salario Base Mensual:</div>
                                    <div className="font-medium text-right">{formatCurrency(salary)}</div>

                                    <div className="text-muted-foreground">Antigüedad:</div>
                                    <div className="font-medium text-right">{yearsOfService} años, {monthsOfService % 12} meses</div>

                                    <div className="text-muted-foreground">Vacaciones Acumuladas:</div>
                                    <div className="font-medium text-right">{(employee.accumulatedVacation || 0).toFixed(2)} días</div>

                                    <div className="text-muted-foreground">Valor Vacaciones:</div>
                                    <div className="font-medium text-right text-blue-600">{formatCurrency(vacationValue)}</div>

                                    <div className="text-muted-foreground">Indemnización (Estimada):</div>
                                    <div className="font-medium text-right text-emerald-600">{formatCurrency(indemnityValue)}</div>
                                </div>

                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                    * Cálculos estimados según Art. 45 y salario base actual.
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="space-y-4 py-4">
                            {payrollTransactions.length > 0 ? (
                                <div className="rounded-md border">
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm">
                                            <thead className="[&_tr]:border-b">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Concepto</th>
                                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Monto</th>
                                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {payrollTransactions.map((tx: any) => (
                                                    <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle">
                                                            {format(new Date(tx.date), "dd/MM/yyyy", { locale: es })}
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{tx.category?.name || "Pago"}</span>
                                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                    {tx.reference?.startsWith("{") ? "Nómina" : tx.reference}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-middle text-right font-medium">
                                                            {formatCurrency(tx.amount)}
                                                        </td>
                                                        <td className="p-4 align-middle text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/receipt/${tx.id}`}>
                                                                    <FileText className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay historial de pagos registrado.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPayrollTransaction } from "@/actions/transactions";
import { Banknote, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateINSS, calculateIR, calculateEmployerCosts } from "@/lib/payrollUtils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    employeeId: z.string().min(1, "Empleado requerido"),
    paymentMethod: z.string().min(1, "Método de pago requerido"),
    periodMonth: z.string().min(1, "Mes requerido"),
    periodYear: z.string().min(1, "Año requerido"),
});

interface PayrollDialogProps {
    employees: {
        id: string;
        firstName: string;
        lastName: string;
        baseSalary?: number | null;
        salary?: number | null;
    }[];
    salaryCategoryId: string;
}

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const years = ["2024", "2025", "2026"];

export function PayrollDialog({ employees, salaryCategoryId }: PayrollDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [calculations, setCalculations] = useState<{
        gross: number;
        inss: number;
        ir: number;
        net: number;
        employerInss: number;
        inatec: number;
    } | null>(null);

    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: 0,
            employeeId: "",
            paymentMethod: "Transferencia",
            periodMonth: new Date().toLocaleString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('es-ES', { month: 'long' }).slice(1),
            periodYear: new Date().getFullYear().toString(),
        },
    });

    const selectedEmployeeId = form.watch("employeeId");

    // Auto-calculate when employee is selected
    useEffect(() => {
        if (selectedEmployeeId) {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            console.log("Empleado seleccionado:", employee);

            // Defensive coding: Handle null/undefined baseSalary with fallback to legacy salary
            const gross = employee?.baseSalary
                ? Number(employee.baseSalary)
                : (employee?.salary ? Number(employee.salary) : 0);

            // Ensure calculations don't produce NaN
            const inss = calculateINSS(gross) || 0;
            const ir = calculateIR(gross) || 0;
            const net = gross - inss - ir;
            const employerCosts = calculateEmployerCosts(gross);

            setCalculations({
                gross,
                inss,
                ir,
                net,
                employerInss: employerCosts.inssPatronal || 0,
                inatec: employerCosts.inatec || 0
            });

            // Set the calculated net amount to the form
            form.setValue("amount", Number(net.toFixed(2)));
        }
    }, [selectedEmployeeId, employees, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Intentando pagar:", values);
        setIsLoading(true);

        if (values.amount <= 0) {
            toast.error("El monto a pagar debe ser mayor a 0");
            setIsLoading(false);
            return;
        }

        const currentCalculations = calculations || {
            gross: 0,
            inss: 0,
            ir: 0,
            net: values.amount,
            employerInss: 0,
            inatec: 0
        };

        const result = await createPayrollTransaction({
            employeeId: values.employeeId,
            month: values.periodMonth,
            year: values.periodYear,
            grossSalary: currentCalculations.gross,
            inssDeduction: currentCalculations.inss,
            irDeduction: currentCalculations.ir,
            netSalary: values.amount, // Use the form value which might be manually edited
            categoryId: salaryCategoryId,
            paymentMethod: values.paymentMethod,
        });

        if (result.success && result.data) {
            toast.success("Pago de nómina registrado correctamente");
            setOpen(false);
            form.reset();
            setCalculations(null);
            router.push(`/receipt/${result.data.id}`);
        } else {
            console.error(result.error);
            toast.error(result.error || "Error al registrar el pago");
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Banknote className="mr-2 h-4 w-4" /> Pagar Nómina
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago de Nómina</DialogTitle>
                    <DialogDescription>
                        Cálculo automático de deducciones de ley (Nicaragua).
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Empleado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione empleado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.lastName}, {emp.firstName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {calculations && (
                            <div className="bg-slate-50 p-3 rounded-md text-sm space-y-1 border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Salario Bruto:</span>
                                    <span className="font-medium">{formatCurrency(calculations.gross)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>INSS Laboral (7%):</span>
                                    <span>- {formatCurrency(calculations.inss)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>IR (Renta):</span>
                                    <span>- {formatCurrency(calculations.ir)}</span>
                                </div>
                                <div className="border-t pt-1 mt-1 flex justify-between font-bold text-emerald-600">
                                    <span>Salario Neto (Calculado):</span>
                                    <span>{formatCurrency(calculations.net)}</span>
                                </div>
                                <div className="border-t pt-1 mt-1 text-xs text-muted-foreground">
                                    <p>Aportes Patronales (Informativo):</p>
                                    <div className="flex justify-between">
                                        <span>INSS Patronal (21.5%):</span>
                                        <span>{formatCurrency(calculations.employerInss)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>INATEC (2%):</span>
                                        <span>{formatCurrency(calculations.inatec)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="periodMonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mes</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Mes" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {months.map((m) => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Año" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Pagar (Neto)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione método" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" variant="destructive" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                                    </>
                                ) : (
                                    "Registrar y Generar Recibo"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

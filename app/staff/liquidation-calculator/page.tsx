"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEmployees } from "@/actions/staff";
import { formatCurrency } from "@/lib/utils";
import { calculateIndemnity, calculateVacationPay, calculateAguinaldo } from "@/lib/payrollUtils";
import { Calculator, FileText } from "lucide-react";

const formSchema = z.object({
    employeeId: z.string().optional(),
    baseSalary: z.coerce.number().min(1, "Salario base requerido"),
    hireDate: z.string().min(1, "Fecha de inicio requerida"),
    endDate: z.string().min(1, "Fecha de salida requerida"),
    accumulatedVacation: z.coerce.number().default(0),
});

type CalculationResult = {
    years: number;
    months: number;
    days: number;
    indemnity: number;
    vacationPay: number;
    aguinaldo: number;
    total: number;
};

export default function LiquidationCalculatorPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            employeeId: "",
            baseSalary: 0,
            hireDate: "",
            endDate: "",
            accumulatedVacation: 0,
        },
    });

    useEffect(() => {
        getEmployees().then(setEmployees);
    }, []);

    const handleEmployeeSelect = (employeeId: string) => {
        const employee = employees.find((e) => e.id === employeeId);
        if (employee) {
            form.setValue("baseSalary", employee.salary || 0);
            form.setValue("hireDate", employee.hireDate ? format(new Date(employee.hireDate), "yyyy-MM-dd") : "");
            form.setValue("accumulatedVacation", 0); // No existe accumulatedVacation en schema
        }
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const startDate = new Date(values.hireDate);
        const endDate = new Date(values.endDate);
        const salary = values.baseSalary;

        const years = differenceInYears(endDate, startDate);
        const months = differenceInMonths(endDate, startDate) % 12;
        const days = differenceInDays(endDate, startDate) % 30; // Approx

        // Calculate Indemnity (Antigüedad)
        const indemnity = calculateIndemnity(salary, years + months / 12 + days / 365);

        // Calculate Vacation Pay
        // Note: In a real scenario, we'd calculate proportional vacation based on time worked since last anniversary + accumulated.
        // Here we assume the user inputs the total days pending.
        const vacationPay = calculateVacationPay(salary, values.accumulatedVacation);

        // Calculate Aguinaldo (Proportional)
        // Aguinaldo runs from Dec 1 to Nov 30. We need to calculate months worked in the current "Aguinaldo year".
        // Simplified logic: Calculate proportional based on current year's worked time if less than a year, or time since last Dec 1.
        let aguinaldoStartDate = new Date(endDate.getFullYear(), 11, 1); // Dec 1 of current year
        if (endDate < aguinaldoStartDate) {
            aguinaldoStartDate = new Date(endDate.getFullYear() - 1, 11, 1); // Dec 1 of previous year
        }
        // If hire date is after the last Dec 1, use hire date
        const effectiveAguinaldoStart = startDate > aguinaldoStartDate ? startDate : aguinaldoStartDate;

        const aguinaldoDays = differenceInDays(endDate, effectiveAguinaldoStart);
        const aguinaldoProportion = aguinaldoDays / 365;
        const aguinaldo = salary * aguinaldoProportion;

        setResult({
            years,
            months,
            days,
            indemnity,
            vacationPay,
            aguinaldo,
            total: indemnity + vacationPay + aguinaldo,
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calculadora de Liquidación</h2>
                    <p className="text-muted-foreground">
                        Cálculo de prestaciones sociales por finalización de contrato (Nicaragua).
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Datos del Empleado
                        </CardTitle>
                        <CardDescription>Ingrese los datos para el cálculo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="employeeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Seleccionar Empleado (Opcional)</FormLabel>
                                            <Select onValueChange={(val) => { field.onChange(val); handleEmployeeSelect(val); }}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {employees.map((e) => (
                                                        <SelectItem key={e.id} value={e.id}>
                                                            {e.lastName}, {e.firstName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hireDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Inicio</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Salida</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="baseSalary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Salario Mensual</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accumulatedVacation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Días Vacaciones</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full">Calcular Liquidación</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <FileText className="h-5 w-5" />
                                Resultado del Cálculo
                            </CardTitle>
                            <CardDescription>
                                Antigüedad: {result.years} años, {result.months} meses, {result.days} días
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Indemnización (Art. 45):</span>
                                    <span className="font-medium">{formatCurrency(result.indemnity)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vacaciones Proporcionales:</span>
                                    <span className="font-medium">{formatCurrency(result.vacationPay)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Aguinaldo Proporcional:</span>
                                    <span className="font-medium">{formatCurrency(result.aguinaldo)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg text-slate-900">
                                    <span>Total a Pagar:</span>
                                    <span>{formatCurrency(result.total)}</span>
                                </div>
                            </div>

                            <div className="rounded-md bg-yellow-50 p-4 text-xs text-yellow-800 border border-yellow-100">
                                <strong>Nota:</strong> Este cálculo es una estimación basada en la legislación laboral vigente.
                                Se recomienda verificar con un contador o asesor legal antes de procesar el pago final.
                                Las deducciones de INSS e IR sobre vacaciones y aguinaldo pueden aplicar según el caso.
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { registerPartialPayment, getPaymentPlansByStudent, createPaymentPlan } from "@/actions/paymentPlans";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/pdfGenerator";

interface QuickPaymentDialogProps {
    studentId: string;
    studentName: string;
    outstandingBalance: number;
    onSuccess?: () => void;
}

export function QuickPaymentDialog({
    studentId,
    studentName,
    outstandingBalance,
    onSuccess,
}: QuickPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [formData, setFormData] = useState({
        amount: "",
        paymentMethod: "EFECTIVO",
        reference: "",
    });

    const handleOpen = async () => {
        setOpen(true);
        // Cargar planes de pago existentes
        const result = await getPaymentPlansByStudent(studentId);
        if (result.success) {
            const activePlans = result.plans.filter((p: any) => p.status === "ACTIVE");
            setPaymentPlans(activePlans);
            if (activePlans.length > 0) {
                setSelectedPlan(activePlans[0].id);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const amount = parseFloat(formData.amount);

            if (amount <= 0) {
                toast.error("El monto debe ser mayor a 0");
                setIsLoading(false);
                return;
            }

            // Si no hay plan seleccionado, crear uno nuevo
            let planId = selectedPlan;

            if (!planId) {
                const newPlan = await createPaymentPlan({
                    studentId,
                    totalAmount: outstandingBalance,
                    installments: 1,
                    frequency: "CUSTOM",
                    startDate: new Date(),
                    description: "Pago rápido",
                });

                if (!newPlan.success) {
                    toast.error("Error al crear plan de pago");
                    setIsLoading(false);
                    return;
                }

                planId = newPlan.plan.id;
            }

            // Obtener categoría de mensualidad (suponiendo que existe)
            const categories = await fetch("/api/categories").then((r) => r.json());
            const mensualidadCategory = categories.find((c: any) => c.name === "Mensualidad");

            const result = await registerPartialPayment({
                planId,
                amount,
                paymentMethod: formData.paymentMethod,
                reference: formData.reference,
                categoryId: mensualidadCategory?.id || categories[0]?.id,
            });

            if (result.success) {
                toast.success(`Pago de ${formatCurrency(amount)} registrado exitosamente`);
                setOpen(false);
                setFormData({ amount: "", paymentMethod: "EFECTIVO", reference: "" });
                onSuccess?.();
            } else {
                toast.error(result.error || "Error al registrar pago");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al procesar el pago");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleOpen}
                    disabled={outstandingBalance <= 0}
                >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Pagar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Pago</DialogTitle>
                        <DialogDescription>
                            Registra un abono para <strong>{studentName}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Saldo pendiente:</span>
                                <span className="font-semibold text-red-600">
                                    {formatCurrency(outstandingBalance)}
                                </span>
                            </div>
                        </div>

                        {paymentPlans.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="plan">Plan de Pago</Label>
                                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                    <SelectTrigger id="plan">
                                        <SelectValue placeholder="Seleccionar plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentPlans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.description || "Plan sin descripción"} -{" "}
                                                {formatCurrency(plan.totalAmount - plan.paidAmount)} pendiente
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Monto a Pagar</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="1000.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">Método de Pago</Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, paymentMethod: value })
                                }
                            >
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reference">Referencia (Opcional)</Label>
                            <Input
                                id="reference"
                                placeholder="Ej: Transferencia #12345"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Procesando..." : "Registrar Pago"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

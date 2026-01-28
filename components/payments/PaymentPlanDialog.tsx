"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createPaymentPlan } from "@/actions/paymentPlans";
import { toast } from "sonner";

interface PaymentPlanDialogProps {
    studentId: string;
    onSuccess?: () => void;
}

export function PaymentPlanDialog({ studentId, onSuccess }: PaymentPlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        totalAmount: "",
        installments: "",
        frequency: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createPaymentPlan({
                studentId,
                totalAmount: parseFloat(formData.totalAmount),
                installments: parseInt(formData.installments),
                frequency: formData.frequency as "MONTHLY" | "WEEKLY" | "CUSTOM",
                startDate: new Date(formData.startDate),
                description: formData.description,
            });

            if (result.success) {
                toast.success("Plan de pago creado exitosamente");
                setOpen(false);
                setFormData({
                    totalAmount: "",
                    installments: "",
                    frequency: "MONTHLY",
                    startDate: new Date().toISOString().split("T")[0],
                    description: "",
                });
                onSuccess?.();
            } else {
                toast.error(result.error || "Error al crear plan");
            }
        } catch (error) {
            toast.error("Error al crear plan de pago");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Plan de Pago
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Plan de Pago</DialogTitle>
                        <DialogDescription>
                            Configura un plan de pago personalizado con cuotas
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="totalAmount">Monto Total</Label>
                            <Input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                placeholder="1000.00"
                                value={formData.totalAmount}
                                onChange={(e) =>
                                    setFormData({ ...formData, totalAmount: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="installments">Número de Cuotas</Label>
                            <Input
                                id="installments"
                                type="number"
                                min="2"
                                placeholder="12"
                                value={formData.installments}
                                onChange={(e) =>
                                    setFormData({ ...formData, installments: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="frequency">Frecuencia</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, frequency: value })
                                }
                            >
                                <SelectTrigger id="frequency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                                    <SelectItem value="CUSTOM">Personalizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Mensualidad 2026"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
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
                            {isLoading ? "Creando..." : "Crear Plan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

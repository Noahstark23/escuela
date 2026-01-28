"use client";

import { formatCurrency } from "@/lib/pdfGenerator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PaymentPlan {
    id: string;
    totalAmount: number;
    paidAmount: number;
    installments: number;
    frequency: string;
    startDate: Date;
    status: string;
    description: string | null;
    payments: any[];
    createdAt: Date;
}

interface PaymentPlanViewProps {
    plan: PaymentPlan;
}

const statusConfig = {
    ACTIVE: { label: "Activo", icon: Clock, color: "text-blue-500" },
    COMPLETED: { label: "Completado", icon: CheckCircle, color: "text-green-500" },
    CANCELLED: { label: "Cancelado", icon: XCircle, color: "text-red-500" },
};

const frequencyLabels = {
    MONTHLY: "Mensual",
    WEEKLY: "Semanal",
    CUSTOM: "Personalizada",
};

export function PaymentPlanView({ plan }: PaymentPlanViewProps) {
    const progress = (plan.paidAmount / plan.totalAmount) * 100;
    const remaining = plan.totalAmount - plan.paidAmount;
    const statusInfo = statusConfig[plan.status as keyof typeof statusConfig];
    const Icon = statusInfo?.icon || Clock;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {plan.description || "Plan de Pago"}
                            <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>
                                <Icon className="h-3 w-3 mr-1" />
                                {statusInfo?.label}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {plan.installments} cuotas • Frecuencia:{" "}
                            {frequencyLabels[plan.frequency as keyof typeof frequencyLabels]}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-semibold">{formatCurrency(plan.totalAmount)}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Pagado</div>
                        <div className="font-semibold text-green-600">
                            {formatCurrency(plan.paidAmount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Pendiente</div>
                        <div className="font-semibold text-orange-600">
                            {formatCurrency(remaining)}
                        </div>
                    </div>
                </div>

                {/* Payments History */}
                {plan.payments.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Historial de Pagos</h4>
                        <div className="space-y-2">
                            {plan.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg"
                                >
                                    <div>
                                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(payment.createdAt), {
                                                addSuffix: true,
                                                locale: es,
                                            })}
                                        </div>
                                    </div>
                                    <Badge variant={payment.status === "PAID" ? "default" : "secondary"}>
                                        {payment.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

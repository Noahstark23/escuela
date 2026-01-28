"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, DollarSign, AlertCircle } from "lucide-react";
import { PaymentDialog } from "@/components/students/PaymentDialog";
import { useState } from "react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    guardian: {
        firstName: string;
        lastName: string;
        phone?: string | null;
    };
}

interface CollectionStats {
    totalActive: number;
    paidCount: number;
    percentage: number;
    paidStudents: string[];
    pendingStudents: Student[];
    monthName: string;
}

interface CollectionStatusProps {
    stats: CollectionStats;
    categories: { id: string; name: string }[];
}

export function CollectionStatus({ stats, categories }: CollectionStatusProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const getWhatsAppLink = (student: Student) => {
        if (!student.guardian.phone) return null;
        const phone = student.guardian.phone.replace(/\D/g, '');
        const message = `Hola ${student.guardian.firstName}, le saludamos del Colegio. Le recordamos amablemente que está pendiente la mensualidad de ${stats.monthName} de su hijo/a ${student.firstName}. ¡Saludos!`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-6">
            {/* Progress Section */}
            <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex justify-between items-center">
                        <span>Estado de Cobranza - {stats.monthName}</span>
                        <Badge variant={stats.percentage > 90 ? "default" : stats.percentage < 50 ? "destructive" : "secondary"}>
                            {stats.percentage.toFixed(1)}% Recaudado
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Progress value={stats.percentage} className="h-4" />
                        <p className="text-sm text-muted-foreground text-right">
                            {stats.paidCount} de {stats.totalActive} estudiantes al día
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Delinquency List */}
            <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center text-red-600">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Lista de Morosos ({stats.pendingStudents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="relative w-full overflow-auto max-h-[400px]">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estudiante</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Grado</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tutor</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {stats.pendingStudents.map((student) => (
                                        <tr key={student.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{student.firstName} {student.lastName}</td>
                                            <td className="p-4 align-middle">{student.grade}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span>{student.guardian.firstName} {student.guardian.lastName}</span>
                                                    <span className="text-xs text-muted-foreground">{student.guardian.phone || "Sin teléfono"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    {student.guardian.phone && (
                                                        <Button variant="outline" size="icon" asChild className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50">
                                                            <a href={getWhatsAppLink(student)!} target="_blank" rel="noopener noreferrer">
                                                                <MessageCircle className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}

                                                    {/* We use a trigger button here that sets the state, but PaymentDialog is a Dialog itself. 
                                                        We need to render the PaymentDialog conditionally or control it. 
                                                        The PaymentDialog component has its own trigger. 
                                                        Let's just render the PaymentDialog here directly. 
                                                    */}
                                                    <PaymentDialog
                                                        studentId={student.id}
                                                        categories={categories}
                                                        trigger={
                                                            <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">
                                                                <DollarSign className="mr-1 h-3 w-3" /> Cobrar
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.pendingStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                ¡Excelente! No hay estudiantes morosos este mes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

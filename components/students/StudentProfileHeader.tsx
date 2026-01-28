"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface StudentProfileHeaderProps {
    student: any;
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-3">
                <CardContent className="p-6 flex items-start space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-xl">
                            {student.firstName[0]}
                            {student.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">
                            {student.firstName} {student.lastName}
                        </h2>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <span>{student.grade}</span>
                            <span>•</span>
                            <Badge variant={student.status === "ACTIVO" ? "default" : "secondary"}>
                                {student.status}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            <p>
                                <span className="font-medium text-foreground">Tutor:</span>{" "}
                                {student.guardian.firstName} {student.guardian.lastName}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Email:</span>{" "}
                                {student.guardian.email || "-"}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Teléfono:</span>{" "}
                                {student.guardian.phone || "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex flex-col justify-center h-full">
                    <div className="text-sm font-medium text-muted-foreground">
                        Saldo Pendiente
                    </div>
                    <div className="text-3xl font-bold text-red-600 mt-2">
                        {formatCurrency(0)} {/* Mock balance */}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Calculado al día de hoy
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

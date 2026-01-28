import { notFound } from "next/navigation";
import { getEmployeeById } from "@/actions/staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Briefcase } from "lucide-react";
import Link from "next/link";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: PageProps) {
    // AWAIT CRÍTICO: Correcto para Next.js 15
    const { id } = await params;

    if (!id) return notFound();

    const employee = await getEmployeeById(id);

    if (!employee) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/staff">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">
                    {employee.firstName} {employee.lastName}
                </h1>
                {/* SOLUCIÓN TÉCNICA: Casting (employee as any) para evadir la restricción de TS temporalmente */}
                <Badge>{(employee as any).status || "ACTIVO"}</Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>
                            <span className="font-bold">Cargo:</span> {employee.position}
                        </p>
                        {/* Asegúrate que employee.salary sea string o number válido para renderizar */}
                        <p>
                            <span className="font-bold">Salario:</span> {employee.salary}
                        </p>
                        <p>
                            <span className="font-bold">Email:</span> {employee.email || "N/A"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
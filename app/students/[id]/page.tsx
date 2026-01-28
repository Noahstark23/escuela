import { getStudentById } from "@/actions/students";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, CreditCard, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { StudentFinancialChart } from "@/components/students/student-financial-chart";
import { StudentStatementButton } from "@/components/students/StudentStatementButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    const student = await getStudentById(params.id);

    if (!student) {
        notFound();
    }

    // Get initials for Avatar
    const initials = `${student.firstName[0]}${student.lastName[0]}`;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    href="/students"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Alumnos
                </Link>
                <StudentStatementButton
                    studentId={params.id}
                    studentName={`${student.firstName} ${student.lastName}`}
                />
                <div className="flex items-center gap-4 ml-auto"> {/* Adjusted for new layout */}
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${initials}`} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-sm">{student.grade}</Badge>
                            <Badge variant={student.status === "ACTIVO" ? "default" : "secondary"}>
                                {student.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Registrar Pago
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Contactar
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Tutor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="font-medium">{student.guardian.firstName} {student.guardian.lastName}</p>
                                    <p className="text-sm text-muted-foreground">Tutor Legal</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <a href={`mailto:${student.guardian.email}`} className="text-blue-600 hover:underline">
                                        {student.guardian.email || "No registrado"}
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <a href={`tel:${student.guardian.phone}`} className="text-blue-600 hover:underline">
                                        {student.guardian.phone || "No registrado"}
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p>{student.guardian.billingInfo || "Dirección no registrada"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Financial History */}
                <div className="space-y-6">
                    <StudentFinancialChart transactions={student.transactions} />
                </div>
            </div>

            {/* Bottom: Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Últimas Transacciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {student.transactions.slice(0, 5).map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{t.category?.name || "General"}</TableCell>
                                    <TableCell>{t.paymentMethod}</TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'INGRESO' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {student.transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No hay transacciones registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

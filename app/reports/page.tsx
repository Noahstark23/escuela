import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, DollarSign } from "lucide-react";

export default function ReportsPage() {
    const reports = [
        {
            title: "Reporte de Cobranza",
            description: "Estado mensual de pagos y cobranza por alumno",
            icon: DollarSign,
            href: "/reports/collections",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            available: true,
        },
        {
            title: "Estado de Cuenta",
            description: "Historial de pagos y saldo de cada alumno",
            icon: FileText,
            href: "/reports/statement",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            available: false,
        },
        {
            title: "Nómina Mensual",
            description: "Reporte de salarios y deducciones del personal",
            icon: Users,
            href: "/reports/payroll",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            available: true,
        },
        {
            title: "Balance General",
            description: "Reporte financiero consolidado por período",
            icon: TrendingUp,
            href: "/reports/balance",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            available: true,
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reportes del Sistema</h2>
                <p className="text-muted-foreground">
                    Genera reportes profesionales en PDF y Excel para análisis y documentación
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {reports.map((report) => {
                    const Icon = report.icon;
                    const content = (
                        <Card
                            className={`relative overflow-hidden transition-all ${report.available
                                ? "hover:shadow-lg cursor-pointer border-2 hover:border-primary"
                                : "opacity-60 cursor-not-allowed"
                                }`}
                        >
                            {!report.available && (
                                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                    Próximamente
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                                        <Icon className={`h-8 w-8 ${report.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{report.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {report.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    );

                    if (report.available) {
                        return (
                            <Link key={report.href} href={report.href}>
                                {content}
                            </Link>
                        );
                    }

                    return <div key={report.href}>{content}</div>;
                })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información sobre Reportes
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Los reportes se generan en formato PDF profesional</li>
                    <li>Los reportes de nómina también se pueden exportar a Excel</li>
                    <li>Puedes filtrar por período (mes/año) y otros criterios específicos</li>
                    <li>Los reportes incluyen gráficos y estadísticas detalladas</li>
                </ul>
            </div>
        </div>
    );
}

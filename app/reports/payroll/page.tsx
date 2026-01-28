import { PayrollReportForm } from "@/components/reports/PayrollReportForm";
import { getEmployees } from "@/actions/staff";

export default async function PayrollReportPage() {
    const employees = await getEmployees();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reporte de Nómina</h2>
                <p className="text-muted-foreground">
                    Genera reportes de nómina con cálculos de INSS e IR
                </p>
            </div>

            <PayrollReportForm employees={employees} />
        </div>
    );
}

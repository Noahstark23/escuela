import { CollectionReportForm } from "@/components/reports/CollectionReportForm";
import { getAvailableGrades } from "@/actions/reports";

export default async function CollectionReportPage() {
    const grades = await getAvailableGrades();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reportes de Cobranza</h2>
                <p className="text-muted-foreground">
                    Genera reportes detallados del estado de cobranza mensual
                </p>
            </div>

            <CollectionReportForm availableGrades={grades} />
        </div>
    );
}

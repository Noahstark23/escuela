import { BalanceSheetForm } from "@/components/reports/BalanceSheetForm";

export default function BalanceSheetPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Balance General</h2>
                <p className="text-muted-foreground">
                    Genera un reporte financiero consolidado por período
                </p>
            </div>

            <BalanceSheetForm />
        </div>
    );
}

import { getEmployees } from "@/actions/staff";
import { getTransactionCategories } from "@/actions/transactions";
import { EmployeeList } from "@/components/staff/EmployeeList";
import { PayrollDialog } from "@/components/staff/PayrollDialog";
import { NewEmployeeDialog } from "@/components/staff/NewEmployeeDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { HRDashboard } from "@/components/staff/hr-dashboard";

export default async function StaffPage() {
    const employees = await getEmployees();
    const categories = await getTransactionCategories();

    // Find or use a default "Salary" category
    // In a real app, we should probably seed this or have a better way to find it.
    // For now, let's try to find one with "Sueldo" or "Salario" or "Nómina" in the name, 
    // or just pick the first Expense category if not found, or handle it gracefully.
    const salaryCategory = categories.find(
        (c) =>
            c.isExpense &&
            (c.name.toLowerCase().includes("sueldo") ||
                c.name.toLowerCase().includes("salario") ||
                c.name.toLowerCase().includes("nómina"))
    );

    // If no category found, we might want to disable the button or show a warning.
    // But for this MVP, let's assume one exists or just use the first expense category.
    const defaultCategory = salaryCategory || categories.find((c) => c.isExpense);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Personal y RRHH</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/staff/liquidation-calculator">
                        <Button variant="outline">
                            <Calculator className="mr-2 h-4 w-4" />
                            Liquidaciones
                        </Button>
                    </Link>
                    <NewEmployeeDialog />
                    {defaultCategory && (
                        <PayrollDialog
                            employees={employees}
                            salaryCategoryId={defaultCategory.id}
                        />
                    )}
                </div>
            </div>

            <HRDashboard employees={employees} />

            <EmployeeList employees={employees} />
        </div>
    );
}

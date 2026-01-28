import { getTransactions } from "@/actions/transactions";
import { FinanceTable } from "@/components/finance/FinanceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Activity, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { ExportButton } from "@/components/ui/export-button";
import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { ExpensePieChart } from "@/components/finance/expense-pie-chart";
import { getMonthlyCashFlow, getExpensesByCategory } from "@/lib/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialHealthView } from "@/components/finance/financial-health-view";
import { ScenarioSimulator } from "@/components/finance/scenario-simulator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function FinancePage() {
    const transactions = await getTransactions();
    const totalStudents = await prisma.student.count({ where: { status: "ACTIVO" } });

    const totalIncome = transactions
        .filter((t) => t.type === "INGRESO")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "EGRESO")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    // Process data for charts
    const cashFlowData = getMonthlyCashFlow(transactions);
    const expenseData = getExpensesByCategory(transactions);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Finanzas y Libro Mayor</h2>
                <div className="flex items-center space-x-2">
                    <ExportButton data={transactions} fileName="Finanzas" />
                </div>
            </div>

            <Tabs defaultValue="operations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="operations">Operaciones</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics & Salud Financiera</TabsTrigger>
                </TabsList>

                <TabsContent value="operations" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {formatCurrency(totalIncome)}
                                </div>
                                <p className="text-xs text-muted-foreground">Acumulado histórico</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                                <CreditCard className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(totalExpense)}
                                </div>
                                <p className="text-xs text-muted-foreground">Acumulado histórico</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"
                                        }`}
                                >
                                    {formatCurrency(balance)}
                                </div>
                                <p className="text-xs text-muted-foreground">Cash Flow Actual</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Intelligence Dashboard */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <CashFlowChart data={cashFlowData} />
                        <ExpensePieChart data={expenseData} />
                    </div>

                    {/* Master Transaction Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-slate-500" />
                            <h3 className="text-xl font-semibold tracking-tight">
                                Registro de Transacciones
                            </h3>
                        </div>
                        <FinanceTable initialTransactions={transactions as any[]} />
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <FinancialHealthView transactions={transactions} totalStudents={totalStudents} />
                    <ScenarioSimulator
                        currentIncome={totalIncome}
                        currentExpenses={totalExpense}
                        totalStudents={totalStudents}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

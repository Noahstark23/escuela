import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Activity, Users } from "lucide-react";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { Button } from "@/components/ui/button";
import { getMonthlyCollectionStats, getFinancialStats } from "@/actions/finance";
import { CollectionStatus } from "@/components/dashboard/CollectionStatus";
import { getTransactionCategories, getTransactions } from "@/actions/transactions";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const prisma = new PrismaClient();

async function getFinancialData() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "INGRESO")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EGRESO")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
}

import { IncomeDialog } from "@/components/dashboard/income-dialog";
import { ExpenseDialog } from "@/components/dashboard/expense-dialog";

export default async function DashboardPage() {
  const { totalIncome, totalExpense, balance } = await getFinancialData();

  const now = new Date();
  const collectionStats = await getMonthlyCollectionStats(now.getMonth(), now.getFullYear());
  const categories = await getTransactionCategories();
  const chartData = await getFinancialStats();
  const recentTransactions = await getTransactions({ limit: 5 });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard CFO</h2>
        <div className="flex items-center space-x-2">
          <IncomeDialog />
          <ExpenseDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% vs mes anterior</p>
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
            <p className="text-xs text-muted-foreground">+180.1% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">Cash Flow Actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionStats.totalActive}</div>
            <p className="text-xs text-muted-foreground">Total matriculados</p>
          </CardContent>
        </Card>
      </div>

      {/* New Collection Status Section */}
      <div className="grid gap-4">
        <CollectionStatus stats={collectionStats} categories={categories} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <CashFlowChart data={chartData} />
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentTransactions.map((t) => {
                const isPayroll = !!t.employee;
                const isStudentPayment = !!t.student;

                let title = t.category.name;
                let subtitle = "";

                if (isPayroll) {
                  title = "Pago de Nómina";
                  subtitle = t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : "";
                } else if (isStudentPayment) {
                  title = t.category.name;
                  subtitle = t.student ? `${t.student.firstName} ${t.student.lastName}` : "";
                } else {
                  subtitle = t.reference && !t.reference.startsWith('{') ? t.reference : "General";
                }

                return (
                  <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{title}</p>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                      <p className="text-xs text-muted-foreground/70">
                        {format(new Date(t.date), "dd MMM, h:mm a", { locale: es })}
                      </p>
                    </div>
                    <div className={`font-medium ${t.type === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'INGRESO' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No hay transacciones recientes.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


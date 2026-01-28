import { getTransactionById } from "@/actions/transactions";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { School } from "lucide-react";
import { ReceiptActions } from "@/components/receipt/ReceiptActions";

interface ReceiptPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const { id } = await params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
        notFound();
    }

    const isIncome = transaction.type === "INGRESO";
    let title = isIncome ? "RECIBO DE PAGO" : "COMPROBANTE DE EGRESO";
    const entityName = transaction.student
        ? `${transaction.student.lastName}, ${transaction.student.firstName}`
        : transaction.employee
            ? `${transaction.employee.lastName}, ${transaction.employee.firstName}`
            : "General";

    // Check if it's a Payroll Transaction (Reference is JSON)
    let isPayroll = false;
    let payrollData: any = null;
    try {
        if (transaction.reference && transaction.reference.startsWith("{")) {
            payrollData = JSON.parse(transaction.reference);
            isPayroll = true;
            title = "COMPROBANTE DE PAGO DE SALARIO";
        }
    } catch (e) {
        // Not JSON, standard reference
    }

    const whatsappMessage = `Hola, le enviamos su comprobante de pago por ${formatCurrency(
        transaction.amount
    )}. Puede verlo aquí: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/receipt/${transaction.id}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-md overflow-hidden print:shadow-none print:w-full print:max-w-none">
                {/* Receipt Header */}
                <div className="bg-slate-900 text-white p-6 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-center mb-4 print:hidden">
                        <School className="h-12 w-12" />
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{title}</h1>
                    <p className="text-sm opacity-80 mt-1">School ERP System</p>
                    <p className="text-xs opacity-60 mt-2">RUC: 1234567890</p>
                </div>

                {/* Receipt Body */}
                <div className="p-8 space-y-6">
                    {isPayroll ? (
                        // PAYROLL LAYOUT
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground">Mes Correspondiente</p>
                                <p className="font-bold text-lg">{payrollData.month} {payrollData.year}</p>
                            </div>

                            <div className="border rounded-md p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Salario Bruto:</span>
                                    <span className="font-medium">{formatCurrency(payrollData.bruto)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>INSS Laboral:</span>
                                    <span>- {formatCurrency(payrollData.inss)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>IR (Renta):</span>
                                    <span>- {formatCurrency(payrollData.ir)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>Neto a Recibir:</span>
                                    <span>{formatCurrency(payrollData.neto)}</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <p className="text-sm font-medium">Empleado:</p>
                                <p className="text-lg">{entityName}</p>
                                <p className="text-xs text-muted-foreground">{transaction.employee?.position || "Docente"}</p>
                            </div>
                        </div>
                    ) : (
                        // STANDARD LAYOUT
                        <>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Monto Total</p>
                                <div className="text-4xl font-bold text-slate-900 mt-1">
                                    {formatCurrency(transaction.amount)}
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <span className="font-medium">
                                        {format(new Date(transaction.date), "dd 'de' MMMM, yyyy", {
                                            locale: es,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">ID Transacción:</span>
                                    <span className="font-mono text-xs">{transaction.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Concepto:</span>
                                    <span className="font-medium">{transaction.category.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Referencia:</span>
                                    <span className="font-medium">{transaction.reference || "-"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Método de Pago:</span>
                                    <span className="font-medium">{transaction.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-muted-foreground">
                                        {transaction.student ? "Alumno" : "Beneficiario"}:
                                    </span>
                                    <span className="font-bold text-right">{entityName}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Signature Line for Payroll */}
                {isPayroll && (
                    <div className="px-8 pb-8 print:block hidden">
                        <div className="border-t border-black mt-12 pt-2 text-center text-sm">
                            <p className="font-medium">{entityName}</p>
                            <p className="text-xs text-muted-foreground">Recibí Conforme</p>
                        </div>
                    </div>
                )}

                {/* Receipt Footer / Actions */}
                <ReceiptActions whatsappUrl={whatsappUrl} />

                {/* Footer for Print */}
                <div className="hidden print:block p-8 text-center text-xs text-muted-foreground">
                    <p>Generado automáticamente por School ERP</p>
                </div>
            </div>
        </div>
    );
}

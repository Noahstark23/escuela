"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PayslipButtonProps {
    employee: any;
}

export function PayslipButton({ employee }: PayslipButtonProps) {
    const generatePayslip = () => {
        const doc = new jsPDF();
        const today = new Date();
        const monthYear = format(today, "MMMM yyyy", { locale: es }).toUpperCase();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Blue
        doc.text("COLEGIO INTERNACIONAL", 105, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text("COMPROBANTE DE PAGO DE NÓMINA", 105, 30, { align: "center" });
        doc.text(monthYear, 105, 38, { align: "center" });

        // Employee Info Box
        doc.setDrawColor(200);
        doc.setFillColor(245, 247, 250);
        doc.rect(14, 45, 182, 35, "FD");

        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.setFont("helvetica", "bold");
        doc.text("Empleado:", 20, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`${employee.lastName}, ${employee.firstName}`, 60, 55);

        doc.setFont("helvetica", "bold");
        doc.text("Cargo:", 20, 62);
        doc.setFont("helvetica", "normal");
        doc.text(employee.position || "N/A", 60, 62);

        doc.setFont("helvetica", "bold");
        doc.text("Cédula:", 110, 55);
        doc.setFont("helvetica", "normal");
        doc.text(employee.cedula || "N/A", 140, 55);

        doc.setFont("helvetica", "bold");
        doc.text("Fecha Ingreso:", 110, 62);
        doc.setFont("helvetica", "normal");
        doc.text(employee.hireDate ? format(new Date(employee.hireDate), "dd/MM/yyyy") : "N/A", 140, 62);

        // Financial Details
        const baseSalary = employee.baseSalary || employee.salary || 0;
        const deductions = baseSalary * 0.15; // Simulated 15% deductions (INSS, IR, etc.)
        const netSalary = baseSalary - deductions;

        const tableData = [
            ["Salario Base Mensual", formatCurrency(baseSalary)],
            ["Deducciones de Ley (15%)", `-${formatCurrency(deductions)}`],
            ["Bonificaciones", formatCurrency(0)],
            ["Otros Descuentos", formatCurrency(0)],
        ];

        autoTable(doc, {
            startY: 90,
            head: [['Concepto', 'Monto']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 130 },
                1: { cellWidth: 50, halign: 'right' },
            },
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("NETO A RECIBIR:", 130, finalY);
        doc.setTextColor(41, 128, 185);
        doc.text(formatCurrency(netSalary), 195, finalY, { align: "right" });

        // Signatures
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.line(30, finalY + 40, 90, finalY + 40);
        doc.text("Firma Empleador", 60, finalY + 45, { align: "center" });

        doc.line(120, finalY + 40, 180, finalY + 40);
        doc.text("Firma Empleado", 150, finalY + 45, { align: "center" });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 105, 280, { align: "center" });

        doc.save(`Nomina_${employee.lastName}_${monthYear}.pdf`);
    };

    return (
        <Button onClick={generatePayslip} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4" />
            Generar Colilla de Pago
        </Button>
    );
}

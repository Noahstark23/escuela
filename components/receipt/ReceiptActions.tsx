"use client";

import { Button } from "@/components/ui/button";
import { Printer, Share2 } from "lucide-react";
import Link from "next/link";

interface ReceiptActionsProps {
    whatsappUrl: string;
}

export function ReceiptActions({ whatsappUrl }: ReceiptActionsProps) {
    return (
        <div className="p-6 bg-slate-50 border-t flex flex-col gap-3 print:hidden">
            <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                asChild
            >
                <Link href={whatsappUrl} target="_blank">
                    <Share2 className="mr-2 h-4 w-4" /> Enviar por WhatsApp
                </Link>
            </Button>

            <Button
                variant="outline"
                className="w-full"
                onClick={() => window.print()}
            >
                <Printer className="mr-2 h-4 w-4" /> Imprimir Comprobante
            </Button>

            <Button variant="ghost" className="w-full" asChild>
                <Link href="/">Volver al Inicio</Link>
            </Button>
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { DatabaseBackup } from "lucide-react";

export default function BackupDbButton() {
    const handleBackup = async () => {
        const response = await fetch("/api/admin/backup");

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `backup_school_erp_${new Date().toISOString().split('T')[0]}.db`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert("Error al descargar el backup. Asegúrate de ser administrador.");
        }
    };

    return (
        <Button onClick={handleBackup} variant="destructive" className="gap-2">
            <DatabaseBackup className="h-4 w-4" />
            Descargar Backup DB
        </Button>
    );
}

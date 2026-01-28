"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { changePassword } from "@/actions/user";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed or use alert

export function PasswordForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        if (formData.new !== formData.confirm) {
            setMessage("Las contraseñas nuevas no coinciden");
            return;
        }

        setLoading(true);
        const res = await changePassword(formData.current, formData.new);
        if (res.success) {
            setMessage("Contraseña actualizada correctamente");
            setFormData({ current: "", new: "", confirm: "" });
        } else {
            setMessage(res.error || "Error al actualizar");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="current">Contraseña Actual</Label>
                <Input
                    id="current"
                    type="password"
                    value={formData.current}
                    onChange={e => setFormData({ ...formData, current: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new">Nueva Contraseña</Label>
                <Input
                    id="new"
                    type="password"
                    value={formData.new}
                    onChange={e => setFormData({ ...formData, new: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar Nueva</Label>
                <Input
                    id="confirm"
                    type="password"
                    value={formData.confirm}
                    onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                    required
                />
            </div>

            {message && (
                <p className={`text-sm ${message.includes("correctamente") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Contraseña
            </Button>
        </form>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { createTransaction, getFinanceOptions } from "@/actions/finance";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ExpenseDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        amount: "",
        categoryId: "",
        newCategory: "",
        paymentMethod: "Efectivo",
        description: "",
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            getFinanceOptions().then((data) => {
                setCategories(data.categories.filter((c) => c.isExpense));
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert("Monto inválido");
            setLoading(false);
            return;
        }

        const res = await createTransaction({
            type: "EGRESO",
            amount,
            categoryId: formData.categoryId === "new" ? undefined : formData.categoryId,
            newCategory: formData.categoryId === "new" ? formData.newCategory : undefined,
            paymentMethod: formData.paymentMethod,
            description: formData.description,
        });

        if (res.success) {
            setOpen(false);
            setFormData({
                amount: "",
                categoryId: "",
                newCategory: "",
                paymentMethod: "Efectivo",
                description: "",
            });
            router.refresh();
        } else {
            alert("Error al guardar");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Registrar Gasto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Gasto</DialogTitle>
                    <DialogDescription>
                        Registre una salida de dinero o gasto.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Monto (C$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                                <SelectItem value="new">+ Crear Nueva Categoría</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.categoryId === "new" && (
                        <div className="grid gap-2">
                            <Label htmlFor="newCategory">Nombre de Nueva Categoría</Label>
                            <Input
                                id="newCategory"
                                value={formData.newCategory}
                                onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ej: Gasolina Bus #1"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione método" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">Caja Chica (Efectivo)</SelectItem>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Gasto
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

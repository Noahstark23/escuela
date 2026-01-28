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

export function IncomeDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        amount: "",
        categoryId: "",
        newCategory: "",
        studentId: "",
        paymentMethod: "Efectivo",
        description: "",
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            getFinanceOptions().then((data) => {
                setCategories(data.categories.filter((c) => !c.isExpense));
                setStudents(data.students);
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
            type: "INGRESO",
            amount,
            categoryId: formData.categoryId === "new" ? undefined : formData.categoryId,
            newCategory: formData.categoryId === "new" ? formData.newCategory : undefined,
            paymentMethod: formData.paymentMethod,
            studentId: formData.studentId || undefined,
            description: formData.description,
        });

        if (res.success) {
            setOpen(false);
            setFormData({
                amount: "",
                categoryId: "",
                newCategory: "",
                studentId: "",
                paymentMethod: "Efectivo",
                description: "",
            });
            router.refresh();
        } else {
            alert("Error al guardar");
        }
        setLoading(false);
    };

    const selectedCategoryName = categories.find(c => c.id === formData.categoryId)?.name?.toLowerCase();
    const showStudentSelect = selectedCategoryName?.includes("mensualidad") || selectedCategoryName?.includes("matrícula");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800">Registrar Ingreso</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Ingreso</DialogTitle>
                    <DialogDescription>
                        Registre un nuevo ingreso al sistema.
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
                        <Label htmlFor="category">Concepto</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione concepto" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                                <SelectItem value="new">+ Crear Nuevo Concepto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.categoryId === "new" && (
                        <div className="grid gap-2">
                            <Label htmlFor="newCategory">Nombre del Nuevo Concepto</Label>
                            <Input
                                id="newCategory"
                                value={formData.newCategory}
                                onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {showStudentSelect && (
                        <div className="grid gap-2">
                            <Label htmlFor="student">Alumno</Label>
                            <Select
                                value={formData.studentId}
                                onValueChange={(val) => setFormData({ ...formData, studentId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione alumno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Ingreso
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

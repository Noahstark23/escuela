"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createCategory, deleteCategory } from "@/actions/settings";
import { Loader2, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoriesTab({ categories }: { categories: any[] }) {
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState("");
    const [isExpense, setIsExpense] = useState(true);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        setLoading(true);
        const res = await createCategory(newName, isExpense);
        if (res.success) {
            setNewName("");
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
        const res = await deleteCategory(id);
        if (!res.success) {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Nueva Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex items-end gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label>Nombre</Label>
                            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Transporte" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <div className="flex items-center space-x-2 h-10">
                                <Button
                                    type="button"
                                    variant={isExpense ? "destructive" : "outline"}
                                    onClick={() => setIsExpense(true)}
                                    className="w-24"
                                >
                                    Gasto
                                </Button>
                                <Button
                                    type="button"
                                    variant={!isExpense ? "default" : "outline"}
                                    onClick={() => setIsExpense(false)}
                                    className="w-24 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Ingreso
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Agregar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Ingresos</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {categories.filter(c => !c.isExpense).map(c => (
                            <div key={c.id} className="flex items-center justify-between p-2 border rounded-md">
                                <span>{c.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Gastos</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {categories.filter(c => c.isExpense).map(c => (
                            <div key={c.id} className="flex items-center justify-between p-2 border rounded-md">
                                <span>{c.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

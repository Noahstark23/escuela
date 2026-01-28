"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, GraduationCap, Users, DollarSign, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { globalSearch, SearchResult } from "@/actions/search";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/pdfGenerator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult>({
        students: [],
        employees: [],
        transactions: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults({ students: [], employees: [], transactions: [] });
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await globalSearch(searchQuery);
            setResults(searchResults);
        } catch (error) {
            console.error("Error en búsqueda:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleNavigate = (path: string) => {
        router.push(path);
        onOpenChange(false);
        setQuery("");
    };

    const totalResults =
        results.students.length + results.employees.length + results.transactions.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0">
                <DialogHeader className="p-4 pb-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar estudiantes, empleados, transacciones..."
                            className="pl-10 pr-10"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Buscando...
                        </div>
                    ) : query.length < 2 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Escribe al menos 2 caracteres para buscar</p>
                            <p className="text-xs mt-2">
                                Tip: Presiona <kbd>Ctrl+K</kbd> para abrir esta búsqueda
                            </p>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron resultados</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Estudiantes */}
                            {results.students.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        Estudiantes ({results.students.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.students.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => handleNavigate(`/students/${student.id}`)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="font-medium">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {student.grade} • Tutor: {student.guardian.firstName}{" "}
                                                    {student.guardian.lastName}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empleados */}
                            {results.employees.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        Empleados ({results.employees.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.employees.map((employee) => (
                                            <button
                                                key={employee.id}
                                                onClick={() => handleNavigate(`/staff/${employee.id}`)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="font-medium">
                                                    {employee.firstName} {employee.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {employee.position} • {employee.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Transacciones */}
                            {results.transactions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        Transacciones ({results.transactions.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.transactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">
                                                        {transaction.category?.name || "Sin categoría"}
                                                    </div>
                                                    <div
                                                        className={
                                                            transaction.type === "INGRESO"
                                                                ? "text-green-600 font-semibold"
                                                                : "text-red-600 font-semibold"
                                                        }
                                                    >
                                                        {transaction.type === "INGRESO" ? "+" : "-"}
                                                        {formatCurrency(transaction.amount)}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {transaction.reference && `Ref: ${transaction.reference} • `}
                                                    {formatDistanceToNow(new Date(transaction.date), {
                                                        addSuffix: true,
                                                        locale: es,
                                                    })}
                                                </div>
                                                {transaction.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {transaction.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t p-3 text-xs text-muted-foreground text-center">
                    Presiona <kbd className="px-2 py-1 bg-muted rounded">ESC</kbd> para cerrar
                </div>
            </DialogContent>
        </Dialog>
    );
}

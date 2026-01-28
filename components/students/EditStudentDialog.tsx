"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateStudent } from "@/actions/students";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    firstName: z.string().min(2, "Nombre requerido"),
    lastName: z.string().min(2, "Apellido requerido"),
    grade: z.string().min(1, "Grado requerido"),
    status: z.string().min(1, "Estado requerido"),
    guardianFirstName: z.string().min(2, "Nombre del tutor requerido"),
    guardianLastName: z.string().min(2, "Apellido del tutor requerido"),
    guardianEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    guardianPhone: z.string().optional(),
});

interface EditStudentDialogProps {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        grade: string;
        status: string;
        guardian: {
            firstName: string;
            lastName: string;
            email?: string | null;
            phone?: string | null;
        };
    };
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            status: student.status,
            guardianFirstName: student.guardian.firstName,
            guardianLastName: student.guardian.lastName,
            guardianEmail: student.guardian.email || "",
            guardianPhone: student.guardian.phone || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await updateStudent(student.id, {
            firstName: values.firstName,
            lastName: values.lastName,
            grade: values.grade,
            status: values.status,
            guardian: {
                firstName: values.guardianFirstName,
                lastName: values.guardianLastName,
                email: values.guardianEmail || undefined,
                phone: values.guardianPhone || undefined,
            },
        });

        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            console.error(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Editar Información
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Estudiante</DialogTitle>
                    <DialogDescription>
                        Modifique los datos del estudiante y su tutor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Alumno</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido Alumno</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione grado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1er Grado">1er Grado</SelectItem>
                                                <SelectItem value="2do Grado">2do Grado</SelectItem>
                                                <SelectItem value="3er Grado">3er Grado</SelectItem>
                                                <SelectItem value="4to Grado">4to Grado</SelectItem>
                                                <SelectItem value="5to Grado">5to Grado</SelectItem>
                                                <SelectItem value="6to Grado">6to Grado</SelectItem>
                                                <SelectItem value="7mo Grado">7mo Grado</SelectItem>
                                                <SelectItem value="8vo Grado">8vo Grado</SelectItem>
                                                <SelectItem value="9no Grado">9no Grado</SelectItem>
                                                <SelectItem value="10mo Grado">10mo Grado</SelectItem>
                                                <SelectItem value="11vo Grado">11vo Grado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                                                <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                                                <SelectItem value="RETIRADO">RETIRADO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-medium mb-4">Datos del Tutor</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="guardianFirstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre Tutor</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guardianLastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido Tutor</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="guardianPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guardianEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

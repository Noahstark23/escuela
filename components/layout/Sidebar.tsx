"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    GraduationCap,
    Wallet,
    Users,
    Package,
    Settings,
    School,
    LogOut,
    FileText,
} from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Alumnos",
        icon: GraduationCap,
        href: "/students",
        color: "text-violet-500",
    },
    {
        label: "Finanzas",
        icon: Wallet,
        href: "/finance",
        color: "text-emerald-500",
    },
    {
        label: "RRHH",
        icon: Users,
        href: "/staff",
        color: "text-pink-700",
    },
    {
        label: "Reportes",
        icon: FileText,
        href: "/reports",
        color: "text-orange-500",
    },
    {
        label: "Configuración",
        icon: Settings,
        href: "/settings",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    if (pathname === "/login") return null;

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <School className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">School ERP</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href
                                    ? "text-white bg-white/10"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <button
                    onClick={() => signOut()}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Cerrar Sesión
                    </div>
                </button>
            </div>
        </div>
    );
};

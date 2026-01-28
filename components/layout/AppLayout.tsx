"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [searchOpen, setSearchOpen] = useState(false);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onSearchOpen: () => setSearchOpen(true),
    });

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72">
                <Header />
                {children}
            </main>

            {/* Global Search Modal */}
            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
    );
}

"use client";

import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
    onSearchOpen: () => void;
}

export function useKeyboardShortcuts({ onSearchOpen }: UseKeyboardShortcutsProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + K para abrir búsqueda
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault();
                onSearchOpen();
            }

            // ESC está manejado por el Dialog
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onSearchOpen]);
}

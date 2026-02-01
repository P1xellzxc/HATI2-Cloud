"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function FloatingAddButton() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get dashboard context from URL: /folder/[folderId]
    const dashboardIdFromPath = pathname.match(/\/folder\/([^\/]+)/)?.[1];
    const dashboardId = dashboardIdFromPath;

    // Don't show FAB if not in dashboard context or already on add page
    if (!dashboardId || pathname.includes("/new") || pathname.includes("/edit")) {
        return null;
    }

    return (
        <Link href={`/folder/${dashboardId}/expenses/new`}>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="fixed z-[60] flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400 text-black border-2 border-black"
                style={{
                    // Position: bottom-right, above bottom nav (64px) + safe area
                    bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
                    right: "1.5rem",
                    boxShadow: "4px 4px 0px 0px #000",
                }}
            >
                <Plus className="w-8 h-8" strokeWidth={3} />
            </motion.div>
        </Link>
    );
}

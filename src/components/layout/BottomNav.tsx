"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Clock, PieChart, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
    href: string;
    icon: typeof Home;
    label: string;
}

export function BottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Extract dashboard ID from URL path: /folder/[folderId]
    const dashboardIdFromPath = pathname.match(/\/folder\/([^\/]+)/)?.[1];
    const dashboardId = dashboardIdFromPath;

    // Hide BottomNav on add/edit pages
    if (pathname.includes("/new") || pathname.includes("/edit")) {
        return null;
    }

    // Hide on Login/Auth pages
    if (pathname.startsWith("/auth") || pathname === "/login") {
        return null;
    }

    const navItems: NavItem[] = dashboardId
        ? [
            { href: `/folder/${dashboardId}`, icon: Home, label: "Home" },
            { href: `/folder/${dashboardId}/analytics`, icon: PieChart, label: "Analytics" }, // Mapped 'Charts' to 'Analytics'
            { href: `/folder/${dashboardId}/settings`, icon: Clock, label: "Settings" }, // Using Clock icon for Settings/History placeholder
            { href: "/", icon: LayoutGrid, label: "Hub" },
        ]
        : [
            { href: "/", icon: Home, label: "Hub" },
            // Global history/charts not yet implemented in cloud version, so hiding them or redirecting to hub
            { href: "/", icon: LayoutGrid, label: "Folders" },
        ];

    // Deduplicate if Hub is twice
    const uniqueNavItems = navItems.filter((item, index, self) =>
        index === self.findIndex((t) => t.href === item.href)
    );

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-black pb-safe"
        >
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {uniqueNavItems.map((item) => {
                    // Active check logic
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 h-full relative"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`flex flex-col items-center gap-1 ${isActive ? "text-yellow-600" : "text-gray-400"
                                    }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px] text-black" : "text-gray-500"}`} />
                                <span className={`text-[10px] font-bold uppercase ${isActive ? "text-black" : "text-gray-500"}`}>{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}

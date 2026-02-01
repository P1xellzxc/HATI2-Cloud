'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Folder, User, Mail, Plus } from 'lucide-react'

export function MobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2 pb-safe-area-bottom">
            <nav className="flex items-center justify-around bg-black text-white p-2 rounded-xl shadow-[0px_-4px_10px_rgba(0,0,0,0.2)] border-2 border-white/10">
                <Link
                    href="/"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/') ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Hub</span>
                </Link>

                <Link
                    href="/invitations"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/invitations') ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <div className="relative">
                        <Mail className="w-6 h-6" />
                        {/* Optional: Add badge here if needed */}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider">Invites</span>
                </Link>

                {/* Main Action - Create New Folder (Center) */}
                <Link
                    href="/new-folder"
                    className="flex flex-col items-center justify-center -mt-6"
                >
                    <div className="h-14 w-14 bg-yellow-400 rounded-full border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#fff]">
                        <Plus className="w-8 h-8 text-black stroke-[3]" />
                    </div>
                </Link>

                <Link
                    href="/settings/profile"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive('/settings') ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-wider">ID Card</span>
                </Link>
            </nav>
        </div>
    )
}

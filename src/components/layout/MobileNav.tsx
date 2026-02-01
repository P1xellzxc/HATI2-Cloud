'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Mail, Plus } from 'lucide-react'

export function MobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="md:hidden mobile-nav">
            <nav className="flex items-center justify-around px-2 py-1">
                {/* Hub */}
                <Link
                    href="/"
                    className={`mobile-nav-item ${isActive('/') ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
                >
                    <Home className="w-6 h-6" strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Hub</span>
                </Link>

                {/* Invites */}
                <Link
                    href="/invitations"
                    className={`mobile-nav-item ${isActive('/invitations') ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
                >
                    <div className="relative">
                        <Mail className="w-6 h-6" strokeWidth={isActive('/invitations') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Invites</span>
                </Link>

                {/* FAB - Create New */}
                <Link
                    href="/new-folder"
                    className="mobile-nav-item -mt-4"
                >
                    <div className="mobile-fab animate-float">
                        <Plus className="w-7 h-7 text-black" strokeWidth={3} />
                    </div>
                </Link>

                {/* Spacer for symmetry */}
                <div className="w-[56px]" />

                {/* Profile */}
                <Link
                    href="/settings/profile"
                    className={`mobile-nav-item ${isActive('/settings') ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
                >
                    <User className="w-6 h-6" strokeWidth={isActive('/settings') ? 2.5 : 2} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Profile</span>
                </Link>
            </nav>
        </div>
    )
}

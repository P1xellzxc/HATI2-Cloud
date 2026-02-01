'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOfflineSync, OfflineAction } from '@/hooks/useOfflineSync'

const OfflineSyncContext = createContext<{
    isOnline: boolean
    addToQueue: (type: OfflineAction['type'], payload: any) => void
} | null>(null)

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
    const { isOnline, addToQueue } = useOfflineSync()

    return (
        <OfflineSyncContext.Provider value={{ isOnline, addToQueue }}>
            {children}
        </OfflineSyncContext.Provider>
    )
}

export function useOffline() {
    const context = useContext(OfflineSyncContext)
    if (!context) throw new Error('useOffline must be used within OfflineSyncProvider')
    return context
}

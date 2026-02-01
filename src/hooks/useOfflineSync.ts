'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner' // Ensure sonner is installed

// Type for a queued action
export type OfflineAction = {
    id: string
    type: 'CREATE_EXPENSE' | 'CREATE_FOLDER' | 'UPDATE_EXPENSE'
    payload: Record<string, any>
    timestamp: number
}

const STORAGE_KEY = 'hati2_offline_queue'

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true)
    const [queue, setQueue] = useState<OfflineAction[]>([])

    // Initialize Online Status
    useEffect(() => {
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)

        const handleOnline = () => {
            setIsOnline(true)
            processQueue()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Load existing queue
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            setQueue(JSON.parse(stored))
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Add to Queue
    const addToQueue = (type: OfflineAction['type'], payload: Record<string, any>) => {
        const action: OfflineAction = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now()
        }

        const newQueue = [...queue, action]
        setQueue(newQueue)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue))

        toast.info('Offline: Action queued for sync.')
    }

    // Process Queue (The Sync Logic)
    const processQueue = async () => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return

        const currentQueue: OfflineAction[] = JSON.parse(stored)
        if (currentQueue.length === 0) return

        toast.loading('Syncing offline data...')

        const remainingQueue: OfflineAction[] = []
        let successCount = 0

        for (const action of currentQueue) {
            try {
                const result = await executeAction(action)

                if (!result.success) {
                    throw new Error(result.message)
                }
                successCount++
            } catch (error) {
                console.error('Sync failed for action', action, error)
                // Keep in queue to retry
                remainingQueue.push(action)
            }
        }

        // Update Queue
        setQueue(remainingQueue)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue))

        toast.dismiss() // Dismiss loading

        if (successCount > 0) {
            toast.success(`Synced ${successCount} items!`)
            window.location.reload()
        }

        if (remainingQueue.length > 0) {
            toast.error('Some items failed to sync.')
        }
    }

    return { isOnline, addToQueue, queue }
}

// Mapper for actions
async function executeAction(action: OfflineAction) {
    // Dynamic import actions to avoid hydration issues
    const { createExpense, createFolder, updateExpense } = await import('@/app/(dashboard)/actions')

    const formData = new FormData()

    // Reconstruct FormData from payload object
    Object.entries(action.payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => formData.append(key, String(v)))
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value))
        }
    })

    if (action.type === 'CREATE_EXPENSE') {
        return await createExpense(null, formData)
    }
    if (action.type === 'UPDATE_EXPENSE') {
        return await updateExpense(null, formData)
    }
    if (action.type === 'CREATE_FOLDER') {
        return await createFolder(null, formData)
    }

    return { success: false, message: 'Unknown action type' }
}

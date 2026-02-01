'use client'

import { useActionState, useState, useEffect } from 'react'
import { createExpense, updateExpense } from '@/app/(dashboard)/actions'
import { useOffline } from '@/components/providers/OfflineSyncProvider'
import { Loader2, Calculator, Percent, Users, AlertCircle, Trash2, WifiOff } from 'lucide-react'

interface Member {
    id: string
    userId: string | null
    email: string
    displayName: string
}

type SplitMode = 'EQUAL' | 'EXACT' | 'PERCENT'

interface ExpenseFormProps {
    folderId: string
    members: Member[]
    initialData?: {
        id: string
        description: string
        amount: number
        date: string
        category: string
        paid_by_member_id: string | null
        split_details: any
    }
}

export default function ExpenseForm({ folderId, members, initialData }: ExpenseFormProps) {
    const isEditMode = !!initialData

    // Choose Action
    const action = isEditMode ? updateExpense : createExpense
    const [state, formAction, isPending] = useActionState(action, null)

    // Initialize State from initialData
    const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '')

    // Parse Initial Split Details
    const initialSplit = initialData?.split_details || { type: 'equal', members: [] }

    // Determine Split Mode
    const getInitialMode = (): SplitMode => {
        if (!initialData) return 'EQUAL'
        if (initialSplit.type === 'exact') return 'EXACT'
        if (initialSplit.type === 'percentage') return 'PERCENT'
        return 'EQUAL'
    }

    const [splitMode, setSplitMode] = useState<SplitMode>(getInitialMode())

    // Initialize Allocations / Selection
    const getInitialAllocations = () => {
        if (!initialData) return {}
        // Convert numbers to strings for input fields
        const allocationsToStrings: Record<string, string> = {}
        for (const memberId in initialSplit.allocations) {
            allocationsToStrings[memberId] = initialSplit.allocations[memberId].toString()
        }
        return allocationsToStrings
    }

    const getInitialSelected = (): Set<string> => {
        if (!initialData) return new Set(members.map(m => m.id))
        if (initialSplit.type === 'equal') {
            return new Set((initialSplit.members as string[]) || [])
        }
        return new Set(members.map(m => m.id))
    }

    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(getInitialSelected())
    const [allocations, setAllocations] = useState<Record<string, string>>(getInitialAllocations())

    const [validationError, setValidationError] = useState<string | null>(null)

    // Reset validations when amount/mode changes
    useEffect(() => {
        validateSplit()
    }, [amount, splitMode, allocations, selectedMembers])

    const validateSplit = () => {
        setValidationError(null)
        if (!amount || Number(amount) <= 0) return

        const totalAmount = Number(amount)

        if (splitMode === 'EXACT') {
            const sum = Object.values(allocations).reduce((acc, val) => acc + (Number(val) || 0), 0)
            if (Math.abs(sum - totalAmount) > 0.01) {
                setValidationError(`Total allocated: ${sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Remaining: ${(totalAmount - sum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            }
        } else if (splitMode === 'PERCENT') {
            const sum = Object.values(allocations).reduce((acc, val) => acc + (Number(val) || 0), 0)
            if (Math.abs(sum - 100) > 0.1) {
                setValidationError(`Total allocation: ${sum}%. Remaining: ${(100 - sum).toFixed(1)}%`)
            }
        } else if (splitMode === 'EQUAL') {
            if (selectedMembers.size === 0) {
                setValidationError('Select at least one person to split with.')
            }
        }
    }

    // Helper to format deserialized data for server
    const getSplitDetailsJSON = () => {
        if (splitMode === 'EQUAL') {
            return JSON.stringify({
                type: 'equal',
                members: Array.from(selectedMembers)
            })
        } else if (splitMode === 'EXACT') {
            return JSON.stringify({
                type: 'exact',
                allocations: allocations // keys are memberIds, values are amounts
            })
        } else if (splitMode === 'PERCENT') {
            return JSON.stringify({
                type: 'percentage',
                allocations: allocations // keys are memberIds, values are percentages
            })
        }
        return ''
    }

    // Offline Hook
    const { isOnline, addToQueue } = useOffline()

    const handleSubmission = (formData: FormData) => {
        if (isOnline) {
            formAction(formData)
        } else {
            // 1. Construct Payload
            const payload: Record<string, any> = {}
            formData.forEach((value, key) => {
                // Check if key already exists (array)
                if (payload[key]) {
                    if (!Array.isArray(payload[key])) {
                        payload[key] = [payload[key]]
                    }
                    payload[key].push(value)
                } else {
                    payload[key] = value
                }
            })

            // 2. Queue
            addToQueue(isEditMode ? 'UPDATE_EXPENSE' : 'CREATE_EXPENSE', payload)

            // 3. Fake Success State or Reset (Optional for UX)
            // In a real app, we might redirect or clear form. 
            // For now, let's toast is handled by addToQueue.
            // We can maybe reset the form or redirect manually?
            // Since we can't redirect easily without router, we might just let the user know.
            // Ideally we redirect back to folder.
        }
    }

    return (
        <form action={handleSubmission} className="space-y-6 manga-panel p-8">
            {/* ... Header ... */}
            <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h2 className="manga-title text-xl text-black">
                        {isEditMode ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                </div>
                {isEditMode && (
                    <span className="text-xs bg-yellow-300 text-black px-2 py-1 font-bold uppercase">Correction Mode</span>
                )}
                {!isOnline && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 font-bold uppercase flex items-center gap-1">
                        <WifiOff className="w-3 h-3" /> Offline
                    </span>
                )}
            </div>

            <input type="hidden" name="folderId" value={folderId} />
            {isEditMode && <input type="hidden" name="expenseId" value={initialData.id} />}

            {/* Hidden input to pass the complex JSON to server */}
            <input type="hidden" name="splitDetails" value={getSplitDetailsJSON()} />

            {/* ... Basic Inputs ... */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-xs font-black uppercase tracking-widest text-black">
                    Description
                </label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    required
                    placeholder="e.g. Ramen with friends"
                    className="manga-input w-full"
                    autoFocus={!isEditMode}
                    defaultValue={initialData?.description}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="amount" className="block text-xs font-black uppercase tracking-widest text-black">
                        Amount
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="manga-input w-full font-mono text-right"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="date" className="block text-xs font-black uppercase tracking-widest text-black">
                        Date
                    </label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={initialData?.date ? String(initialData.date).split('T')[0] : new Date().toISOString().split('T')[0]}
                        required
                        className="manga-input w-full font-mono"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="category" className="block text-xs font-black uppercase tracking-widest text-black">
                    Category
                </label>
                <select
                    id="category"
                    name="category"
                    className="manga-input w-full h-[50px]"
                    defaultValue={initialData?.category || 'General'}
                >
                    <option value="General">📦 General</option>
                    <option value="Food">🍜 Food</option>
                    <option value="Transport">🚇 Transport</option>
                    <option value="Utilities">💡 Utilities</option>
                    <option value="Entertainment">🎮 Entertainment</option>
                </select>
            </div>

            <div className="space-y-6 pt-6 border-t-2 border-black border-dashed">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-black uppercase bg-black text-white inline-block px-2">Splitting Protocols</p>
                    {validationError && (
                        <span className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationError}
                        </span>
                    )}
                </div>

                {/* PAID BY */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Paid By</label>
                    <select
                        name="paidByMemberId"
                        className="manga-input w-full h-[50px] uppercase font-bold"
                        defaultValue={initialData?.paid_by_member_id || members[0]?.id}
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id} className="font-bold">
                                {member.displayName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SPLIT TABS */}
                <div className="space-y-4">
                    <div className="flex rounded-none border-2 border-black p-0.5 gap-0.5 bg-black">
                        {(['EQUAL', 'EXACT', 'PERCENT'] as const).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                    setSplitMode(mode)
                                    setAllocations({})
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-wide transition-all ${splitMode === mode
                                    ? 'bg-yellow-300 text-black border-black'
                                    : 'bg-white text-slate-500 hover:text-black'
                                    }`}
                            >
                                {mode === 'EQUAL' && <Users className="w-3 h-3" />}
                                {mode === 'EXACT' && <Calculator className="w-3 h-3" />}
                                {mode === 'PERCENT' && <Percent className="w-3 h-3" />}
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* EQUAL MODE */}
                    {splitMode === 'EQUAL' && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                            {members.map(member => (
                                <label key={`split-${member.id}`} className="flex items-center gap-2 p-3 border-2 border-slate-200 cursor-pointer hover:border-black transition-all bg-white has-[:checked]:border-black has-[:checked]:shadow-[2px_2px_0_0_#000]">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.has(member.id)}
                                        onChange={(e) => {
                                            const newSet = new Set(selectedMembers)
                                            if (e.target.checked) newSet.add(member.id)
                                            else newSet.delete(member.id)
                                            setSelectedMembers(newSet)
                                        }}
                                        className="w-4 h-4 border-2 border-slate-400 text-black focus:ring-0 rounded-none checked:bg-black"
                                    />
                                    <span className="text-sm font-bold truncate uppercase">{member.displayName}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* EXACT / PERCENT MODE */}
                    {splitMode !== 'EQUAL' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-2">
                                    <div className="w-32 flex-shrink-0 text-xs font-bold uppercase truncate" title={member.displayName}>
                                        {member.displayName}
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            step={splitMode === 'EXACT' ? '0.01' : '1'}
                                            placeholder="0"
                                            value={allocations[member.id] || ''}
                                            onChange={(e) => {
                                                setAllocations({ ...allocations, [member.id]: e.target.value })
                                            }}
                                            className="manga-input w-full text-right py-1 px-2 h-8 text-sm"
                                        />
                                        <span className="absolute right-8 top-1.5 text-xs font-mono text-slate-400 pointer-events-none">
                                            {splitMode === 'EXACT' ? '' : '%'}
                                        </span>
                                    </div>
                                    {splitMode === 'PERCENT' && amount && (
                                        <div className="w-20 text-right text-xs font-mono text-slate-500">
                                            {(((Number(allocations[member.id] || 0)) / 100) * Number(amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending || !!validationError}
                    className="manga-button-primary w-full flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                    {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                    {isPending ? 'PROCESSING...' : (validationError ? 'FIX SPLIT TOTALS' : (isEditMode ? 'UPDATE ENTRY' : 'CONFIRM ENTRY'))}
                </button>
            </div>

            {state?.message && (
                <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${state.success ? 'bg-green-100' : 'bg-red-100'} font-bold flex items-center gap-2 uppercase font-mono text-sm`}>
                    {state.success ? 'Success:' : 'Error:'} {state.message}
                </div>
            )}
        </form>
    )
}


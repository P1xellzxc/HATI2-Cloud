export interface Member {
    id: string
    displayName: string
}

export interface Expense {
    id: string
    description: string
    amount: number
    date: string | Date
    category?: string
    paid_by_member_id: string | null
    split_details: any // JSON structure
}

export interface TransactionLog {
    expenseId: string
    description: string
    date: string
    amount: number
    isOffset: boolean // True if this reduced the debt
}

export interface Debt {
    from: string // Member ID who owes
    to: string   // Member ID who is owed
    amount: number
    history: TransactionLog[]
}

// Helper to round to 2 decimals
const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

export function calculateSettlements(expenses: Expense[], members: Member[]): Debt[] {
    // Matrix to track total amounts
    const debtMatrix: Record<string, Record<string, number>> = {}

    // Matrix to track detailed history
    // historyMatrix[borrower][lender] = List of transactions where borrower borrowed from lender
    const historyMatrix: Record<string, Record<string, TransactionLog[]>> = {}

    // Initialize matrices
    members.forEach(m1 => {
        debtMatrix[m1.id] = {}
        historyMatrix[m1.id] = {}
        members.forEach(m2 => {
            debtMatrix[m1.id][m2.id] = 0
            historyMatrix[m1.id][m2.id] = []
        })
    })

    for (const expense of expenses) {
        if (!expense.paid_by_member_id) continue
        if (!expense.split_details) continue

        const lenderId = expense.paid_by_member_id
        const amount = Number(expense.amount)
        const details = expense.split_details
        const dateStr = String(expense.date)

        // Helper to record a debt part
        const addDebt = (borrowerId: string, debtAmount: number) => {
            if (borrowerId !== lenderId && debtAmount > 0) {
                // Update Total
                debtMatrix[borrowerId][lenderId] = (debtMatrix[borrowerId][lenderId] || 0) + debtAmount

                // Record History
                historyMatrix[borrowerId][lenderId].push({
                    expenseId: expense.id,
                    description: expense.description,
                    date: dateStr,
                    amount: debtAmount,
                    isOffset: false
                })
            }
        }

        // Calculate how much each person owes the lender for this specific expense
        if (details.type === 'equal') {
            const splitMembers: string[] = details.members || []
            if (splitMembers.length > 0) {
                const share = amount / splitMembers.length
                splitMembers.forEach(borrowerId => addDebt(borrowerId, share))
            }
        }
        else if (details.type === 'exact') {
            const allocations: Record<string, number> = details.allocations || {}
            Object.entries(allocations).forEach(([borrowerId, allocatedAmount]) => {
                addDebt(borrowerId, Number(allocatedAmount))
            })
        }
        else if (details.type === 'percentage') {
            const allocations: Record<string, number> = details.allocations || {}
            Object.entries(allocations).forEach(([borrowerId, percentage]) => {
                const share = (Number(percentage) / 100) * amount
                addDebt(borrowerId, share)
            })
        }
    }

    // Simplify Pair-wise (Netting between 2 people only)
    const debts: Debt[] = []
    const processedPairs = new Set<string>()

    members.forEach(m1 => {
        members.forEach(m2 => {
            if (m1.id === m2.id) return

            // Create a unique key for the pair
            const pairKey = [m1.id, m2.id].sort().join('-')
            if (processedPairs.has(pairKey)) return
            processedPairs.add(pairKey)

            // Compare debts
            const m1OwesM2 = debtMatrix[m1.id][m2.id] || 0
            const m2OwesM1 = debtMatrix[m2.id][m1.id] || 0

            if (m1OwesM2 > m2OwesM1) {
                const net = round(m1OwesM2 - m2OwesM1)
                if (net > 0) {
                    // M1 Owes M2. 
                    // History = (M1 borrowed from M2) + (M2 borrowed from M1 as OFFSET)

                    const primaryHistory = historyMatrix[m1.id][m2.id] || []
                    const offsetHistory = (historyMatrix[m2.id][m1.id] || []).map(h => ({
                        ...h,
                        amount: -h.amount, // Negate amount for offset
                        isOffset: true
                    }))

                    debts.push({
                        from: m1.id,
                        to: m2.id,
                        amount: net,
                        history: [...primaryHistory, ...offsetHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    })
                }
            } else if (m2OwesM1 > m1OwesM2) {
                const net = round(m2OwesM1 - m1OwesM2)
                if (net > 0) {
                    // M2 Owes M1.
                    const primaryHistory = historyMatrix[m2.id][m1.id] || []
                    const offsetHistory = (historyMatrix[m1.id][m2.id] || []).map(h => ({
                        ...h,
                        amount: -h.amount,
                        isOffset: true
                    }))

                    debts.push({
                        from: m2.id,
                        to: m1.id,
                        amount: net,
                        history: [...primaryHistory, ...offsetHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    })
                }
            }
        })
    })

    return debts.sort((a, b) => b.amount - a.amount)
}

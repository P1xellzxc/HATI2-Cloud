'use client'

import Link from "next/link"
import { Debt, Member } from "@/lib/logic/settlements"
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react"

export function SettlementPanel({ debts, members, folderId }: { debts: Debt[], members: Member[], folderId: string }) {

    const getMemberName = (id: string) => {
        return members.find(m => m.id === id)?.displayName || 'Unknown'
    }

    // Helper to format currency
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount)
    }

    return (
        <div className="manga-panel h-full flex flex-col relative group">
            <Link href={`/folder/${folderId}/settlements`} className="absolute inset-0 z-10" />
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4 bg-black -mx-6 -mt-6 p-4 group-hover:bg-yellow-400 transition-colors">
                <h3 className="text-white group-hover:text-black font-black uppercase tracking-widest text-lg flex items-center gap-2">
                    <span className="text-yellow-400 group-hover:text-black">⚡</span> Settlement Arc
                </h3>
                <ExternalLink className="w-4 h-4 text-white group-hover:text-black" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {debts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                        <CheckCircle2 className="w-12 h-12 mb-2 text-green-500" />
                        <p className="font-bold font-mono">ALL DEBTS SETTLED</p>
                        <p className="text-xs uppercase">Peace has been restored.</p>
                    </div>
                ) : (
                    debts.map((debt, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border-2 border-slate-200 hover:border-black transition-all bg-white shadow-[2px_2px_0_0_#e2e8f0] hover:shadow-[4px_4px_0_0_#000]">

                            {/* DEBTOR */}
                            <div className="flex flex-col items-start w-1/3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">PAYER</span>
                                <span className="font-bold text-sm truncate w-full" title={getMemberName(debt.from)}>
                                    {getMemberName(debt.from)}
                                </span>
                            </div>

                            {/* ARROW & AMOUNT */}
                            <div className="flex flex-col items-center justify-center w-1/3">
                                <span className="font-black font-mono text-red-500 text-sm">
                                    {formatMoney(debt.amount)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-slate-300 mt-1" />
                            </div>

                            {/* CREDITOR */}
                            <div className="flex flex-col items-end w-1/3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">RECEIVER</span>
                                <span className="font-bold text-sm truncate w-full text-right" title={getMemberName(debt.to)}>
                                    {getMemberName(debt.to)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

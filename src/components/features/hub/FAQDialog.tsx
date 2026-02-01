"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, HelpCircle, Wallet, Wifi, X, Info, Volume2, StopCircle, Cloud } from "lucide-react";
import { useState, useEffect } from "react";

interface FAQDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FAQDialog({ isOpen, onClose }: FAQDialogProps) {
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

    const cancelSpeech = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                cancelSpeech();
                setSpeakingIndex(null);
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            cancelSpeech();
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, onClose]);

    const faqs = [
        {
            question: "What is a Volume?",
            answer: "A Volume is a dashboard or folder. Think of it like a manga volume that contains a specific story arc—for example, 'Bali Trip 2024' or 'House Expenses'.",
            icon: BookOpen
        },
        {
            question: "How does syncing work?",
            answer: "HATI² Cloud automatically syncs your data when you are online. If you lose internet, you can still add expenses, and they will sync once connection is restored.",
            icon: Cloud
        },
        {
            question: "Can I share a Volume?",
            answer: "Yes! Open a Volume and click the 'Waitlist / Share' button to invite friends via email or link.",
            icon: Wallet
        }
    ];

    const handleSpeak = (text: string, index: number) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        if (speakingIndex === index) {
            cancelSpeech();
            setSpeakingIndex(null);
            return;
        }

        cancelSpeech();

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.onend = () => setSpeakingIndex(null);
            utterance.onerror = () => setSpeakingIndex(null);

            setSpeakingIndex(index);
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Speech synthesis error:", e);
            setSpeakingIndex(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="border-2 border-black rounded-sm w-full max-w-md bg-white overflow-hidden flex flex-col max-h-[85vh] shadow-[6px_6px_0px_0px_#000]"
                    >
                        <div className="p-4 border-b-2 border-black bg-yellow-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-black" />
                                <h2 className="font-black uppercase text-lg">HATI² Guide</h2>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                            <div className="space-y-6">
                                {faqs.map((faq, index) => {
                                    const Icon = faq.icon;
                                    const isSpeaking = speakingIndex === index;

                                    return (
                                        <div key={index} className="flex gap-4 group">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-8 h-8 rounded-sm border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="font-bold uppercase text-sm mb-1">{faq.question}</h3>
                                                    <button
                                                        onClick={() => handleSpeak(faq.answer, index)}
                                                        className="p-1 text-gray-400 hover:text-black transition-colors"
                                                    >
                                                        {isSpeaking ? (
                                                            <StopCircle className="w-4 h-4 animate-pulse text-red-500" />
                                                        ) : (
                                                            <Volume2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="font-medium text-sm text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 border-t-2 border-black bg-gray-50">
                            <button
                                onClick={onClose}
                                className="w-full border-2 border-black rounded-sm bg-black text-white hover:bg-gray-800 shadow-[3px_3px_0px_0px_#666] py-3 font-bold uppercase"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

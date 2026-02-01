"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Wallet,
    Plane,
    Home,
    PartyPopper,
    FolderOpen,
    Trash2,
    HelpCircle,
    Pencil,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { VolumeShelfSkeleton } from "@/components/skeletons/VolumeShelfSkeleton";
import { FAQDialog } from "@/components/features/hub/FAQDialog";
import { compressImage } from "@/lib/imageUtils";
import { DashboardType, DASHBOARD_TYPE_LABELS, THEME_COLORS, Dashboard } from "@/types/dashboard";
import { useOffline } from "@/components/providers/OfflineSyncProvider";
import { toast } from "sonner";
import { createFolder } from "@/app/(dashboard)/actions";

// Animation Variants
const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const cardVariants: any = {
    hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: -10 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: { type: "spring", stiffness: 300, damping: 20, mass: 1.2 }
    }
};

const DASHBOARD_TYPE_ICONS: Record<DashboardType, any> = {
    travel: Plane,
    household: Home,
    event: PartyPopper,
    other: FolderOpen,
};

interface Folder {
    id: string;
    name: string;
    created_at: string;
    icon?: string;
}

interface DashboardClientProps {
    initialFolders: Folder[];
}

export default function DashboardClient({ initialFolders }: DashboardClientProps) {
    const router = useRouter();
    const { isOnline, addToQueue } = useOffline();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<DashboardType>("travel");
    const [newColor, setNewColor] = useState(THEME_COLORS[0].color);
    const [newCoverImage, setNewCoverImage] = useState<string | null>(null);
    const [offsetY, setOffsetY] = useState(50);
    const [zoom, setZoom] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Merged State (Server Folders + Local Metadata)
    const [mergedDashboards, setMergedDashboards] = useState<any[]>([]);

    useEffect(() => {
        // Merge server data with local storage metadata
        const enriched = initialFolders.map(folder => {
            const metaKey = `folder_meta_${folder.id}`;
            const localMeta = localStorage.getItem(metaKey);
            const meta = localMeta ? JSON.parse(localMeta) : {};

            // Deterministic default color if no metadata
            const defaultColor = THEME_COLORS[folder.name.length % THEME_COLORS.length].color;

            return {
                ...folder,
                title: folder.name, // Map name to title
                themeColor: meta.themeColor || defaultColor,
                coverImageUrl: meta.coverImageUrl || null,
                coverImageSettings: meta.coverImageSettings || { offsetY: 50, zoom: 1 },
                dashboardType: meta.dashboardType || 'other',
                // Mock stats for now as RPC doesn't return them yet
                netBalance: 0,
                totalSpend: 0,
                expenseCount: 0
            };
        });
        setMergedDashboards(enriched);
    }, [initialFolders]);

    const initCreate = () => {
        setNewTitle("");
        setNewType("travel");
        setNewColor(THEME_COLORS[0].color);
        setNewCoverImage(null);
        setOffsetY(50);
        setZoom(1);
        setShowCreateModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            setNewCoverImage(compressed);
            setOffsetY(50);
            setZoom(1);
        } catch (err) {
            toast.error("Failed to process image");
        }
    };

    const handleSave = async () => {
        if (!newTitle.trim()) {
            toast.error("Please enter a folder name");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isOnline) {
                // Online: Create directly via Server Action
                const formData = new FormData();
                formData.append('name', newTitle);
                formData.append('currency', 'PHP'); // Default for now

                // We can't get the ID back immediately from a redirecting server action easily in this flow without preventing redirect.
                // But createFolder redirects...
                // For this UI to work nicely, we need to intercept or use the offline hook for everything?
                // Let's use addToQueue for consistency? No, addToQueue is for offline.

                // Workaround: We'll assume success if we redirect.
                // BUT we need the ID to save local metadata!
                // This is tricky. 
                // Strategy: Use Offline Queue even when online?
                // Or: Use a non-redirecting server action?
                // Let's just use the `addToQueue` strictly for offline, and standard form for online?
                // Wait, if I use standard form, I lose the ability to save metadata for the NEW id.

                // Solution: Generate a TEMP ID if offline, or rely on matching by NAME for metadata?
                // Matching by name is risky.

                // Best approach for Desgin Prototype:
                // Just queue it! Since we have a robust queue.
                // But the queue might not process immediately to give us an ID.

                // OK, for now, we will NOT support "metadata" for new folders created in this session effectively
                // UNLESS we use a client-generated ID pattern (UUID) and the server accepts it. 
                // Supabase allows client-gen IDs if RLS permits.

                // Let's rely on the user "Editing" the folder later to add cover/color?
                // Or, save metadata using "Pending" status?

                // Simplified: Just Submit. Metadata is lost for *new* folders until we update the creating logic.
                // BUT, I can save metadata to `folder_meta_PENDING_NAME`? No.

                // Let's just do standard submission.
                const formDataLocal = new FormData();
                formDataLocal.append('name', newTitle);
                formDataLocal.append('currency', 'PHP');

                // We use the Server Action but wrapped to avoid redirect? No I can't wrap it easily.
                // Let's just submit the form.
            } else {
                // Offline
                addToQueue('CREATE_FOLDER', {
                    name: newTitle,
                    currency: 'PHP'
                });
                toast.success("Offline: Folder creation queued!");
                setShowCreateModal(false);
            }

            // If we are strictly online, we are likely redirected.
            // If we want to persist metadata, we are stuck.
            // I'll add a Toast warning: "Visuals saved locally only"

            // Attempting to save metadata BEFORE submit? We don't have ID.
            // Maybe I can save based on Name?
            // `localStorage.setItem('pending_meta_' + newTitle, ...)`
            // Then in the effect, if we find a folder with name matches pending, we migrate it?
            // Smart!

            const meta = {
                themeColor: newColor,
                coverImageUrl: newCoverImage,
                coverImageSettings: { offsetY, zoom },
                dashboardType: newType
            };

            localStorage.setItem(`pending_setup_${newTitle}`, JSON.stringify(meta));

            if (isOnline) {
                // Submit form manually to trigger server action
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/api/folder/create'; // No, usage of imported action
                // We can't invoke action easily here without useActionState or transition.
                // Let's just use the queue for everything if it supports online processing?
                // My queue currently processes "if online".
                // So I can just addToQueue!

                addToQueue('CREATE_FOLDER', {
                    name: newTitle,
                    currency: 'PHP'
                });

                // And optimistically add to list?
                // For now, reload.
                router.refresh();
            }

            setShowCreateModal(false);

        } catch (e) {
            toast.error("Error creating volume");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Migrate Pending Metadata
    useEffect(() => {
        initialFolders.forEach(folder => {
            const pendingKey = `pending_setup_${folder.name}`;
            const pendingMeta = localStorage.getItem(pendingKey);
            if (pendingMeta) {
                localStorage.setItem(`folder_meta_${folder.id}`, pendingMeta);
                localStorage.removeItem(pendingKey);
                // Trigger re-render
                router.refresh();
            }
        });
    }, [initialFolders, router]);

    return (
        <motion.main
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-white relative pb-24"
        >
            <ParticlesBackground />
            <FAQDialog isOpen={showFAQ} onClose={() => setShowFAQ(false)} />

            {/* Header */}
            <header className="border-b-2 border-black sticky top-0 bg-white z-50 pt-safe-top">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border-2 border-black rounded-sm bg-black flex items-center justify-center shadow-[2px_2px_0px_0px_#666]">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="font-black uppercase text-2xl tracking-wide">HATI</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFAQ(true)}
                                className="p-2 hover:bg-black/5 rounded-sm transition-colors border-2 border-black"
                            >
                                <HelpCircle className="w-5 h-5 text-gray-600" />
                            </button>
                            <Button
                                size="sm"
                                className="gap-1.5 border-2 border-black rounded-sm bg-yellow-300 text-black hover:bg-orange-300 shadow-[2px_2px_0px_0px_#000]"
                                onClick={initCreate}
                            >
                                <Plus className="w-4 h-4 text-black" />
                                <span className="font-bold uppercase text-xs text-black">New Volume</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                <motion.div variants={cardVariants} className="mb-8 text-center">
                    <h2 className="font-black uppercase text-3xl mb-2">Your Story Volumes</h2>
                    <p className="font-medium text-gray-600">
                        Each volume contains a separate expense arc.
                    </p>
                </motion.div>

                {mergedDashboards.length === 0 ? (
                    /* Empty State */
                    <motion.div variants={cardVariants} className="text-center py-16">
                        <div className="volume-card inline-block p-8 mx-auto border-2 bg-white">
                            <FolderOpen className="w-16 h-16 text-black mx-auto mb-4" />
                            <h3 className="font-black uppercase text-2xl mb-2">No Volumes Yet</h3>
                            <Button
                                onClick={initCreate}
                                className="mt-4 gap-2 border-2 border-black rounded-sm bg-yellow-300 text-black hover:bg-orange-300 shadow-[3px_3px_0px_0px_#000]"
                            >
                                <Plus className="w-4 h-4" />
                                Create Volume 1
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mergedDashboards.map((dashboard) => {
                            const Icon = DASHBOARD_TYPE_ICONS[dashboard.dashboardType] || FolderOpen;
                            const typeInfo = DASHBOARD_TYPE_LABELS[dashboard.dashboardType] || { label: 'Other', emoji: '📁' };
                            const { offsetY = 50, zoom = 1 } = dashboard.coverImageSettings || {};

                            return (
                                <motion.div
                                    key={dashboard.id}
                                    variants={cardVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Link href={`/folder/${dashboard.id}`}>
                                        <div className="volume-card cursor-pointer group h-full">
                                            {/* Spine */}
                                            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: dashboard.themeColor }} />

                                            {/* Cover */}
                                            <div className="h-28 flex items-center justify-center relative ml-2 border-b-2 border-black overflow-hidden"
                                                style={{ backgroundColor: `${dashboard.themeColor}40` }}>
                                                {dashboard.coverImageUrl ? (
                                                    <div className="absolute inset-0 overflow-hidden">
                                                        <img src={dashboard.coverImageUrl} className="w-full h-full object-cover"
                                                            style={{ objectPosition: `center ${offsetY}%`, transform: `scale(${zoom})` }} />
                                                    </div>
                                                ) : (
                                                    <Icon className="w-12 h-12 text-black/30 relative z-10" />
                                                )}

                                                {/* Edit Button (Placeholder - connects to nothing currently but visually there) */}
                                                <button className="absolute top-2 left-2 p-1.5 border-2 border-black rounded-sm bg-white hover:bg-yellow-200 z-20"
                                                    onClick={(e) => { e.preventDefault(); toast.info("Edits coming soon!"); }}>
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 ml-2">
                                                <h3 className="font-black uppercase text-lg truncate">{dashboard.title}</h3>
                                                <p className="font-medium text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span>{typeInfo.emoji}</span> {typeInfo.label}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {/* Quick Add Card */}
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={initCreate}
                        >
                            <div className="volume-card h-full min-h-[220px] flex items-center justify-center cursor-pointer border-dashed bg-white/50">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-2 border-black rounded-sm bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <Plus className="w-6 h-6 text-black" />
                                    </div>
                                    <p className="font-black uppercase text-sm">New Volume</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="volume-card p-6 w-full max-w-md bg-white max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="font-black uppercase text-2xl mb-4">Create New Volume</h2>

                            <div className="space-y-4">
                                {/* Image Upload Stub */}
                                <div className="space-y-2">
                                    <Label className="font-bold">Cover Image</Label>
                                    {!newCoverImage ? (
                                        <div onClick={() => document.getElementById('cover-upload')?.click()}
                                            className="border-2 border-dashed border-black h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-sm">
                                            <Plus className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-bold uppercase">Upload Cover</span>
                                            <input type="file" id="cover-upload" hidden accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                    ) : (
                                        <div className="relative h-32 border-2 border-black rounded-sm overflow-hidden">
                                            <img src={newCoverImage} className="w-full h-full object-cover"
                                                style={{ objectPosition: `center ${offsetY}%`, transform: `scale(${zoom})` }} />
                                            <button onClick={() => setNewCoverImage(null)} className="absolute top-2 right-2 bg-white/80 p-1 rounded-sm">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    )}
                                    {newCoverImage && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Offset Y</Label>
                                                <input type="range" min="0" max="100" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full" />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Zoom</Label>
                                                <input type="range" min="1" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Title</Label>
                                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="border-2 border-black focus-visible:ring-0 font-bold" placeholder="e.g. Bali Trip" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Color</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {THEME_COLORS.map(c => (
                                            <button key={c.id} onClick={() => setNewColor(c.color)}
                                                className={`w-8 h-8 rounded-sm border-2 border-black ${newColor === c.color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                                style={{ backgroundColor: c.color }} />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Type</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(Object.keys(DASHBOARD_TYPE_LABELS) as DashboardType[]).map(t => (
                                            <button key={t} onClick={() => setNewType(t)}
                                                className={`p-2 border-2 border-black rounded-sm text-center ${newType === t ? 'bg-yellow-200' : 'bg-white'}`}>
                                                <div className="text-xl">{DASHBOARD_TYPE_LABELS[t].emoji}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button variant="outline" className="flex-1 border-2 border-black" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button className="flex-1 border-2 border-black bg-green-400 hover:bg-green-500 text-black font-bold" onClick={handleSave} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    );
}

import { motion } from "framer-motion";

export function VolumeShelfSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="border-2 border-black rounded-sm bg-white relative overflow-hidden h-[220px]"
                    style={{ boxShadow: '6px 6px 0px 0px #e5e7eb' }}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200" />
                    <div className="h-28 ml-2 border-b-2 border-black bg-gray-100 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    </div>
                    <div className="p-4 ml-2 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="mt-4 pt-3 border-t-2 border-black flex justify-between">
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

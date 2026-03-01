"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, X, Loader2, ImageIcon, Plus } from "lucide-react";

type Props = {
    projectId: string;
    mediaIds: string[];
    onChange: (mediaIds: string[]) => void;
    disabled?: boolean;
};

export default function InspectionPhotoUpload({ projectId, mediaIds, onChange, disabled }: Props) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }
        setUploading(true);
        try {
            // 1. Get presigned URL
            const presignRes = await fetch("/api/uploads/presign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "inspection",
                    projectId,
                    mimeType: file.type,
                    fileSize: file.size,
                }),
            });
            if (!presignRes.ok) {
                const err = await presignRes.json().catch(() => ({ error: "Upload failed" }));
                throw new Error(err.error || "Failed to get upload URL");
            }
            const { url, key } = await presignRes.json();

            // 2. Upload to S3
            const uploadRes = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error("Upload to storage failed");

            // 3. Append media key to array
            onChange([...mediaIds, key]);
            toast.success("Photo uploaded");
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleRemove(keyToRemove: string) {
        onChange(mediaIds.filter(key => key !== keyToRemove));
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {/* Thumbnails */}
                {mediaIds.map((key) => (
                    <div key={key} className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center py-0.5 pointer-events-none">
                            Uploaded
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemove(key)}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:top-1 group-hover:right-1 transition-all shadow-md"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Upload button */}
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex flex-col items-center justify-center gap-1 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : mediaIds.length > 0 ? (
                            <>
                                <Plus className="h-5 w-5" />
                                <span className="text-[10px] font-semibold tracking-wider uppercase">Add</span>
                            </>
                        ) : (
                            <>
                                <Camera className="h-5 w-5" />
                                <span className="text-[10px] font-semibold tracking-wider uppercase">Photo</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
        </div>
    );
}

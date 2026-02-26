"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, X, Loader2, ImageIcon } from "lucide-react";

type Props = {
    projectId: string;
    mediaId: string | null;
    onChange: (mediaId: string | null) => void;
    disabled?: boolean;
};

export default function InspectionPhotoUpload({ projectId, mediaId, onChange, disabled }: Props) {
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

            // 3. Set media key (backend will create Media record from this)
            onChange(key);
            toast.success("Photo uploaded");
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleRemove() {
        onChange(null);
    }

    return (
        <div className="space-y-2">
            {/* Thumbnail */}
            {mediaId && (
                <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[9px] font-bold text-center py-0.5">
                        Uploaded
                    </div>
                    {!disabled && (
                        <button
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}

            {/* Upload button */}
            {!disabled && !mediaId && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            Add Photo
                        </>
                    )}
                </button>
            )}

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

"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Upload, FileText, Loader2, X, CloudUpload } from "lucide-react";

type Props = {
    projectId: string;
    onSuccess: () => void;
};

export default function DrawingUploadForm({ projectId, onSuccess }: Props) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [version, setVersion] = useState<number>(1);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) setFile(dropped);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    }, []);

    async function handleSubmit() {
        if (!file) { toast.error("Select a file first"); return; }
        if (version < 1) { toast.error("Version must be at least 1"); return; }
        if (file.size > 50 * 1024 * 1024) { toast.error("File too large (max 50MB)"); return; }

        setUploading(true);
        setProgress(10);

        try {
            // 1. Upload file through our server (server handles S3)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("projectId", projectId);
            formData.append("type", "drawing");

            setProgress(30);

            const uploadRes = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
                throw new Error(err.error || "Failed to upload file");
            }

            const { url: absoluteUrl } = await uploadRes.json();
            setProgress(70);

            // 2. Register drawing in backend
            const drawingRes = await fetch(`/api/projects/${projectId}/drawings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: absoluteUrl, version }),
            });

            if (!drawingRes.ok) {
                const err = await drawingRes.json().catch(() => ({ error: "Failed" }));
                throw new Error(err.error || "Failed to save drawing");
            }

            setProgress(100);
            toast.success("Drawing uploaded successfully");
            setFile(null);
            setVersion(v => v + 1);
            onSuccess();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-white" />
                    <h3 className="text-base font-bold text-white">Upload Drawing</h3>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {/* Drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${dragging
                        ? "border-orange-400 bg-orange-50/50 scale-[1.01]"
                        : file
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-slate-300 hover:border-orange-400 hover:bg-orange-50/30"
                        }`}
                >
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); setFile(null); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <CloudUpload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-600">
                                <span className="text-orange-600 font-semibold">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, DWG (max 50MB)</p>
                        </>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.dwg,.dxf"
                    className="hidden"
                    onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                    }}
                />

                {/* Version input */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Version</label>
                        <input
                            type="number"
                            value={version}
                            onChange={e => setVersion(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                        />
                    </div>
                    <div className="sm:self-end">
                        <button
                            onClick={handleSubmit}
                            disabled={uploading || !file}
                            className="w-full sm:w-auto rounded-xl gradient-orange text-white px-6 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {uploading && (
                    <div className="space-y-1">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full gradient-orange rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 text-right">{progress}%</p>
                    </div>
                )}
            </div>
        </div>
    );
}

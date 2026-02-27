"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, UploadCloud, X, File as FileIcon } from "lucide-react";
import { CreateQuerySchema, type CreateQueryInput } from "@/modules/queries/validation";

type Props = {
    projectId: string;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function QueryCreateForm({ projectId, onSuccess, onCancel }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const form = useForm<CreateQueryInput>({
        resolver: zodResolver(CreateQuerySchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            attachmentIds: [],
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // 50MB limit validation
            const validFiles = files.filter(f => f.size <= 50 * 1024 * 1024);
            setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: CreateQueryInput) => {
        setIsSubmitting(true);
        setErrorMsg("");

        try {
            // 1. Upload files first if any
            const attachmentIds: string[] = [];

            if (selectedFiles.length > 0) {
                const formData = new FormData();
                formData.append("type", "general");
                selectedFiles.forEach(file => formData.append("files", file));

                const uploadRes = await fetch("/api/uploads", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload attachments.");
                }

                const uploadData = await uploadRes.json();
                if (uploadData.urls && Array.isArray(uploadData.urls)) {
                    // Extracting the S3 keys from the absolute URLs to pass to the backend
                    uploadData.urls.forEach((url: string) => {
                        const urlObj = new URL(url);
                        let key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                        attachmentIds.push(key);
                    });
                }
            }

            // 2. Submit query
            const payload = {
                ...data,
                attachmentIds,
            };

            const res = await fetch(`/api/projects/${projectId}/queries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to submit query");
            }

            onSuccess();
        } catch (error: any) {
            setErrorMsg(error.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{errorMsg}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Issue Title</label>
                <input
                    {...form.register("title")}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Brief summary of the issue..."
                />
                {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Priority</label>
                <select
                    {...form.register("priority")}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                    <option value="LOW">Low - No immediate action required</option>
                    <option value="MEDIUM">Medium - Standard issue</option>
                    <option value="HIGH">High - Needs prompt attention</option>
                    <option value="URGENT">Urgent - Blocking project progress</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Description Details</label>
                <textarea
                    {...form.register("description")}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    placeholder="Describe the issue in detail..."
                />
                {form.formState.errors.description && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.description.message}</p>
                )}
            </div>

            {/* Attachments */}
            <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Attachments (Images/PDFs)</label>
                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={selectedFiles.length >= 5 || isSubmitting}
                    />
                    <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                        <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 font-medium">Click to upload or drag & drop</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (max 50MB, up to 5 files)</p>
                    </div>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                                        <FileIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 truncate">{file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors min-w-[100px] min-h-[44px]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center justify-center min-w-[120px] min-h-[44px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Query"
                    )}
                </button>
            </div>
        </form>
    );
}

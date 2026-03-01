"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChecklistResult, InspectionDraft } from "@/types/inspections";

function getDraftKey(projectId: string, milestoneId: string) {
    return `crossstone:draft:${projectId}:${milestoneId}`;
}

export function useInspectionDraft(projectId: string, milestoneId: string) {
    const key = getDraftKey(projectId, milestoneId);
    const [draft, setDraft] = useState<InspectionDraft>({ responses: {}, updatedAt: 0 });
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw) as InspectionDraft;
                setDraft(parsed);
            }
        } catch {
            // ignore corrupt data
        }
    }, [key]);

    // Debounced save to localStorage
    const persistDraft = useCallback((newDraft: InspectionDraft) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(newDraft));
            } catch {
                // storage full, ignore
            }
        }, 500);
    }, [key]);

    const updateResponse = useCallback((
        checklistItemId: string,
        field: "result" | "remark" | "mediaIds",
        value: ChecklistResult | null | string | string[]
    ) => {
        setDraft(prev => {
            const existing = prev.responses[checklistItemId] || { result: null, remark: "", mediaIds: [] };
            const updated: InspectionDraft = {
                responses: {
                    ...prev.responses,
                    [checklistItemId]: { ...existing, [field]: value },
                },
                updatedAt: Date.now(),
            };
            persistDraft(updated);
            return updated;
        });
    }, [persistDraft]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(key);
        setDraft({ responses: {}, updatedAt: 0 });
    }, [key]);

    const hasDraft = draft.updatedAt > 0;

    return { draft, updateResponse, clearDraft, hasDraft };
}

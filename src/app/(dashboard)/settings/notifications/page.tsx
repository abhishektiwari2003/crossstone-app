"use client";

import { useState, useEffect } from "react";
import { useNotificationPreferences, type NotificationPreferences } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Mail, Loader2, Save, FileText, Wallet, ClipboardList, MessageSquare, Briefcase } from "lucide-react";

export default function NotificationSettingsPage() {
    const { preferences, isLoading, isError, updatePreferences } = useNotificationPreferences();
    const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (preferences) {
            setLocalPrefs(preferences);
        }
    }, [preferences]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading preferences...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-center">
                <p className="text-rose-600 font-medium">Failed to load notification preferences.</p>
            </div>
        );
    }

    const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
        setLocalPrefs(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePreferences(localPrefs);
            toast.success("Preferences updated successfully");
        } catch (error) {
            toast.error("Failed to update preferences");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notification Settings</h1>
                <p className="text-slate-500 mt-1">Manage how and when you receive alerts from CrossStone.</p>
            </div>

            <div className="space-y-6">

                {/* Delivery Methods Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <Bell className="h-4 w-4 text-indigo-500" />
                            Delivery Methods
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Choose where you want to receive your alerts.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Bell className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">In-App Notifications</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">Receive alerts within the CrossStone dashboard.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.inAppAlerts ?? true}
                                onCheckedChange={(v: boolean) => handleChange('inAppAlerts', v)}
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">Receive a daily digest and critical alerts via email.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.emailAlerts ?? false}
                                onCheckedChange={(v: boolean) => handleChange('emailAlerts', v)}
                            />
                        </div>
                    </div>
                </div>

                {/* Event Preferences Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-500" />
                            Alert Events
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Select which project events trigger a notification.</p>
                    </div>

                    <div className="divide-y divide-slate-100">

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-blue-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Site Inspections</h3>
                                    <p className="text-xs text-slate-500">When an inspection is submitted or reviewed.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.notifyOnInspection ?? true}
                                onCheckedChange={(v: boolean) => handleChange('notifyOnInspection', v)}
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Payments & Financials</h3>
                                    <p className="text-xs text-slate-500">Alerts for pending or overdue project payments.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.notifyOnPayment ?? true}
                                onCheckedChange={(v: boolean) => handleChange('notifyOnPayment', v)}
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-indigo-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Project Assignments</h3>
                                    <p className="text-xs text-slate-500">When you are added or removed from a project team.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.notifyOnAssignment ?? true}
                                onCheckedChange={(v: boolean) => handleChange('notifyOnAssignment', v)}
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-amber-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Client Queries</h3>
                                    <p className="text-xs text-slate-500">When a new query is opened or resolved on your project.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.notifyOnQuery ?? true}
                                onCheckedChange={(v: boolean) => handleChange('notifyOnQuery', v)}
                            />
                        </div>

                        <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-purple-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Drawing Approvals</h3>
                                    <p className="text-xs text-slate-500">When architectural drawings are uploaded or approved.</p>
                                </div>
                            </div>
                            <Switch
                                checked={localPrefs.notifyOnDrawing ?? true}
                                onCheckedChange={(v: boolean) => handleChange('notifyOnDrawing', v)}
                            />
                        </div>

                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 shadow-md"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
}

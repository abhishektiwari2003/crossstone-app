"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import SiteLocationMapPicker from "@/components/projects/SiteLocationMapPicker";

type Props = {
    projectId: string;
    initialLatitude: number | null;
    initialLongitude: number | null;
    initialRadius: number;
    initialAddress: string | null;
    initialLabel: string | null;
};

export default function ProjectSiteLocationForm({
    projectId,
    initialLatitude,
    initialLongitude,
    initialRadius,
    initialAddress,
    initialLabel,
}: Props) {
    const router = useRouter();
    const [lat, setLat] = useState(initialLatitude?.toString() ?? "");
    const [lng, setLng] = useState(initialLongitude?.toString() ?? "");
    const [radius, setRadius] = useState(String(initialRadius || 200));
    const [address, setAddress] = useState(initialAddress ?? "");
    const [label, setLabel] = useState(initialLabel ?? "");
    const [saving, setSaving] = useState(false);

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const latN = lat.trim() === "" ? null : parseFloat(lat);
            const lngN = lng.trim() === "" ? null : parseFloat(lng);
            if ((latN != null && lngN == null) || (lngN != null && latN == null)) {
                toast.error("Set both latitude and longitude, or clear both.");
                return;
            }
            const radiusN = parseInt(radius, 10);
            if (Number.isNaN(radiusN) || radiusN < 10) {
                toast.error("Radius must be at least 10 meters.");
                return;
            }

            const payload: Record<string, unknown> = {
                siteLatitude: latN,
                siteLongitude: lngN,
                siteAddress: address.trim() || null,
                siteLabel: label.trim() || null,
            };
            if (latN != null && lngN != null) {
                payload.geofenceRadiusMeters = radiusN;
            }

            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to save");
            toast.success("Site location updated");
            router.refresh();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={onSave} className="glass-card p-5 space-y-4 border border-amber-200/60 bg-amber-50/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-amber-600" />
                Site location (geofence)
            </div>
            <p className="text-xs text-muted-foreground">
                Super admins only. Set the site on the map (or enter coordinates). When latitude and longitude are set, site engineers must be within the radius to submit inspections.
            </p>
            <SiteLocationMapPicker
                latitude={lat}
                longitude={lng}
                onLatitudeChange={setLat}
                onLongitudeChange={setLng}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                    <input
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="e.g. 12.9716"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                    <input
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="e.g. 77.5946"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Radius (meters)</label>
                    <input
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        type="number"
                        min={10}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Site label</label>
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. Main gate"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-medium text-muted-foreground">Address</label>
                <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                />
            </div>
            <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-600 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save site location
            </button>
        </form>
    );
}

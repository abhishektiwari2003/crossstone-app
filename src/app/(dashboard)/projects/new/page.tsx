"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SiteLocationMapPicker from "@/components/projects/SiteLocationMapPicker";

type User = { id: string; name: string; email: string; role: string };

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [sessionRole, setSessionRole] = useState<string | null>(null);
  const [siteLat, setSiteLat] = useState("");
  const [siteLng, setSiteLng] = useState("");
  const [siteRadius, setSiteRadius] = useState("200");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteLabel, setSiteLabel] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => { });
    fetch('/api/auth/session').then(r => r.json()).then(d => setSessionRole(d?.user?.role ?? null)).catch(() => { });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const valueRaw = totalValue.trim().replace(/,/g, "");
      const valueNum = parseFloat(valueRaw);
      if (valueRaw === "" || Number.isNaN(valueNum) || valueNum <= 0) {
        throw new Error("Enter a valid project value greater than zero.");
      }

      const payload: Record<string, unknown> = {
        name,
        description,
        managerId,
        clientId,
        totalValue: valueNum,
      };
      if (sessionRole === "SUPER_ADMIN") {
        const lat = siteLat.trim() === "" ? null : parseFloat(siteLat);
        const lng = siteLng.trim() === "" ? null : parseFloat(siteLng);
        if ((lat != null && lng == null) || (lng != null && lat == null)) {
          throw new Error("Set both latitude and longitude (map or fields), or clear both.");
        }
        if (lat != null && lng != null) {
          const r = parseInt(siteRadius, 10);
          if (Number.isNaN(r) || r < 10) throw new Error("Geofence radius must be at least 10 meters.");
          payload.siteLatitude = lat;
          payload.siteLongitude = lng;
          payload.geofenceRadiusMeters = r;
        }
        if (siteAddress.trim()) payload.siteAddress = siteAddress.trim();
        if (siteLabel.trim()) payload.siteLabel = siteLabel.trim();
      }

      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');
      toast.success('Project created');
      router.push('/projects');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const managers = users.filter(u => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
  const clients = users.filter(u => u.role === 'CLIENT');

  return (
    <div className="mx-auto w-full max-w-xl min-w-0 space-y-4 sm:space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors break-words">
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to Projects
      </Link>

      <div className="glass-card p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 sm:mb-6 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FolderKanban className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">New Project</h1>
            <p className="text-xs text-slate-500">Create a new construction project</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none" required placeholder="e.g. Highway Bridge Construction" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none resize-y max-h-48" placeholder="Brief description of the project..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project value (INR)</label>
            <input
              value={totalValue}
              onChange={e => setTotalValue(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none tabular-nums"
              required
              placeholder="e.g. 25000000"
            />
            <p className="text-xs text-slate-500 mt-1">Total contract or budget amount (numbers only; commas optional).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager</label>
            <Select value={managerId} onValueChange={setManagerId} required>
              <SelectTrigger className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white/60 hover:bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role.replace(/_/g, " ")})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white/60 hover:bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {sessionRole === "SUPER_ADMIN" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 sm:p-4 space-y-3 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Site location and geofence</p>
              <p className="text-xs text-slate-600">
                Super admins only. Use the map to drop or drag the pin, or use your current location. Engineers must be within the geofence radius to submit inspections.
              </p>
              <SiteLocationMapPicker
                latitude={siteLat}
                longitude={siteLng}
                onLatitudeChange={setSiteLat}
                onLongitudeChange={setSiteLng}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                  <input value={siteLat} onChange={e => setSiteLat(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. 12.9716" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                  <input value={siteLng} onChange={e => setSiteLng(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. 77.5946" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Radius (m)</label>
                  <input value={siteRadius} onChange={e => setSiteRadius(e.target.value)} type="number" min={10} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Site label</label>
                  <input value={siteLabel} onChange={e => setSiteLabel(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <input value={siteAddress} onChange={e => setSiteAddress(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl gradient-blue text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all disabled:opacity-50 min-h-11"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
            <Link
              href="/projects"
              className="w-full sm:w-auto text-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-11 inline-flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

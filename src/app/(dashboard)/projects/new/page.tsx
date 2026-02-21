"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = { id: string; name: string; email: string; role: string };

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => { });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description, managerId, clientId }) });
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
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FolderKanban className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New Project</h1>
            <p className="text-xs text-slate-500">Create a new construction project</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none" required placeholder="e.g. Highway Bridge Construction" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none resize-none" placeholder="Brief description of the project..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager</label>
            <Select value={managerId} onValueChange={setManagerId} required>
              <SelectTrigger className="w-full rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white/60 hover:bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
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
              <SelectTrigger className="w-full rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white/60 hover:bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="rounded-xl gradient-blue text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all disabled:opacity-50">
              {loading ? "Creating..." : "Create Project"}
            </button>
            <Link href="/projects" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

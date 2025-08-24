"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Project</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-md border px-3 py-2 bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Manager</label>
          <select value={managerId} onChange={e => setManagerId(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required>
            <option value="">Select a manager</option>
            {managers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required>
            <option value="">Select a client</option>
            {clients.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button disabled={loading} className="rounded-md bg-violet-600 text-white px-4 py-2 disabled:opacity-50">{loading ? "Saving..." : "Create Project"}</button>
          <Link href="/projects" className="rounded-md border px-4 py-2">Cancel</Link>
        </div>
      </form>
    </div>
  );
}



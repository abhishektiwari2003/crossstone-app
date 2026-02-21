"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, role, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      toast.success("User created");
      router.push("/users");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New User</h1>
            <p className="text-xs text-slate-500">Add a new team member</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none" required placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none" required placeholder="john@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="w-full rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white/60 hover:bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                <SelectItem value="SITE_ENGINEER">Site Engineer</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm outline-none" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button disabled={loading} className="rounded-xl gradient-blue text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all disabled:opacity-50">
              {loading ? "Creating..." : "Create User"}
            </button>
            <Link href="/users" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

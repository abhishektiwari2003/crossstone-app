"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New User</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent">
            <option>SUPER_ADMIN</option>
            <option>ADMIN</option>
            <option>PROJECT_MANAGER</option>
            <option>SITE_ENGINEER</option>
            <option>CLIENT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Temp Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" required />
        </div>
        <div className="flex gap-2">
          <button disabled={loading} className="rounded-md bg-violet-600 text-white px-4 py-2 disabled:opacity-50">{loading?"Saving...":"Create User"}</button>
          <a href="/users" className="rounded-md border px-4 py-2">Cancel</a>
        </div>
      </form>
    </div>
  );
}



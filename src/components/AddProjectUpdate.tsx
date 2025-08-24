"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { projectId: string };

export default function AddProjectUpdate({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return toast.error("Notes are required");
    setLoading(true);
    try {
      const res = await fetch("/api/project-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, notes, statusSnapshot: status || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create update");
      const updateId: string = data.update.id;

      if (file) {
        const presign = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "inspection", projectId, mimeType: file.type, fileSize: file.size }),
        }).then(r => r.json());
        if (!presign?.url) throw new Error("Presign failed");
        const put = await fetch(presign.url as string, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!put.ok) throw new Error("S3 upload failed");
        await fetch(`/api/project-updates/${updateId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: presign.key, url: (presign.url as string).split("?")[0], mimeType: file.type, fileSize: file.size }),
        });
      }

      toast.success("Update added");
      setOpen(false);
      setNotes("");
      setStatus("");
      setFile(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-md bg-violet-600 text-white px-3 py-2 text-sm">Add update</button>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-md border px-3 py-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <input value={status} onChange={e => setStatus(e.target.value)} className="w-40 rounded-md border px-3 py-2 bg-transparent" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm mb-1">Image</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="block" />
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="rounded-md bg-violet-600 text-white px-3 py-2 text-sm disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}



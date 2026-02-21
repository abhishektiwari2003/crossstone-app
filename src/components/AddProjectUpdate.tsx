"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl gradient-blue border-0 text-white font-semibold gap-1.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all">
          <Plus className="h-3.5 w-3.5" />
          Add Update
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Add project update</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status (optional)</label>
            <Input value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Inspection Image</label>
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="rounded-xl border-slate-200" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button disabled={loading} type="submit" className="rounded-xl gradient-blue border-0 text-white font-semibold shadow-lg shadow-blue-500/20">{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

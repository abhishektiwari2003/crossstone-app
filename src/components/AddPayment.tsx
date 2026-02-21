"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = { projectId: string };

export default function AddPayment({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState("PENDING");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, amount: Number(amount), currency, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment");
      const paymentId: string = data.payment.id;

      if (file) {
        const presign = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "receipt", projectId, paymentId, mimeType: file.type, fileSize: file.size }),
        }).then(r => r.json());
        if (!presign?.url) throw new Error("Presign failed");
        const put = await fetch(presign.url as string, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!put.ok) throw new Error("S3 upload failed");
        await fetch(`/api/payments/${paymentId}/receipts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: presign.key, url: (presign.url as string).split("?")[0], mimeType: file.type, fileSize: file.size }),
        });
      }

      toast.success("Payment saved");
      setOpen(false);
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
        <Button size="sm" className="rounded-xl gradient-emerald border-0 text-white font-semibold gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 transition-all">
          <Plus className="h-3.5 w-3.5" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Add payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
              <Input value={amount} onChange={e => setAmount(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
              <Input value={currency} onChange={e => setCurrency(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger className="w-full rounded-xl border border-slate-200 px-4 py-2.5 h-auto bg-white hover:bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm shadow-none">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Receipt (optional)</label>
            <Input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="rounded-xl border-slate-200" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button disabled={loading} type="submit" className="rounded-xl gradient-emerald border-0 text-white font-semibold shadow-lg shadow-emerald-500/20">{loading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

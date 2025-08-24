"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-md bg-violet-600 text-white px-3 py-2 text-sm">Add payment</button>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input value={amount} onChange={e=>setAmount(e.target.value)} className="w-28 rounded-md border px-3 py-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-sm mb-1">Currency</label>
            <input value={currency} onChange={e=>setCurrency(e.target.value)} className="w-24 rounded-md border px-3 py-2 bg-transparent" />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-40 rounded-md border px-3 py-2 bg-transparent">
              <option value="PENDING">PENDING</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Receipt</label>
            <input type="file" accept="image/*,application/pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)} className="block" />
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="rounded-md bg-violet-600 text-white px-3 py-2 text-sm disabled:opacity-50">{loading?"Saving...":"Save"}</button>
            <button type="button" onClick={()=>setOpen(false)} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}



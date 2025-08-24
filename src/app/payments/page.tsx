// no imports needed

type PaymentListItem = { id: string; amount: string; currency: string; status: string };

async function getPayments(cookie: string): Promise<{ payments: PaymentListItem[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

export default async function PaymentsPage() {
	const cookie = (await import("next/headers")).cookies().toString();
	const { payments } = await getPayments(cookie);
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Payments</h1>
			<div className="grid gap-4">
				{payments?.length ? payments.map((p) => (
					<div key={p.id} className="rounded-lg border p-4">
						<div className="font-medium">{p.amount} {p.currency}</div>
						<div className="text-sm text-zinc-600">{p.status}</div>
					</div>
				)) : <p className="text-sm text-zinc-600">No payments yet.</p>}
			</div>
		</div>
	);
}

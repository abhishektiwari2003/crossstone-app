"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from "recharts";
import { CreditCard } from "lucide-react";

type Props = {
    total: number;
    pending: number;
};

export default function PaymentStatusChart({ total, pending }: Props) {
    const paid = Math.max(0, total - pending);

    // We'll use a simple bar chart to show Paid vs Pending
    const data = [
        { name: "Paid", value: paid, color: "#10b981" }, // Emerald
        { name: "Pending", value: pending, color: "#f59e0b" } // Amber
    ];

    return (
        <div className="glass-card p-6 flex flex-col h-full bg-white">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-indigo-50">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Payment Status</h3>
            </div>

            <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Contract Value</div>
                <div className="text-2xl font-bold text-slate-900">₹{total.toLocaleString()}</div>
            </div>

            {total === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 pb-4">
                    <p className="text-sm font-medium">No payments mapped</p>
                </div>
            ) : (
                <div className="flex-1 w-full min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                            />
                            <Bar
                                dataKey="value"
                                radius={[0, 4, 4, 0]}
                                barSize={32}
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

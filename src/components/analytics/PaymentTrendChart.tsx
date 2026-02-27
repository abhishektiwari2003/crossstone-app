"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PaymentSummaryMonthly } from "@/types/analytics";

const formatCurrency = (value: number) => {
    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`; // Lakhs formatted
    }
    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(1)}K`; // Thousands formatted
    }
    return `₹${value}`;
};

export default function PaymentTrendChart({ data }: { data: PaymentSummaryMonthly[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No payment data available
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '8px' }}
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '16px' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="paid"
                        name="Paid"
                        stroke="#10b981"
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="pending"
                        name="Pending/Overdue"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 4, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

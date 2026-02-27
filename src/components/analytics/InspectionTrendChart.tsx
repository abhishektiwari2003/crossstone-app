"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MonthlyInspectionCount } from "@/types/analytics";

export default function InspectionTrendChart({ data }: { data: MonthlyInspectionCount[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No inspection data available
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Bar
                        dataKey="count"
                        name="Inspections"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

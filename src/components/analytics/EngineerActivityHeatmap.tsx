"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { EngineerPerformanceMetric } from "@/types/analytics";

interface HeatmapProps {
    data: EngineerPerformanceMetric[];
}

// Map pass rate to color intensity natively instead of dealing with Recharts conditional Cells if possible,
// but Recharts Cell is the cleanest way.
const getColorByPassRate = (rate: number) => {
    if (rate >= 90) return "#10b981"; // Emerald // Excellent
    if (rate >= 75) return "#3b82f6"; // Blue // Good
    if (rate >= 50) return "#f59e0b"; // Amber // Needs Improvement
    return "#ef4444"; // Red // Poor
};

export default function EngineerActivityHeatmap({ data }: HeatmapProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No engineer activity data available
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as EngineerPerformanceMetric;
                                return (
                                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                                        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                                        <div className="text-sm text-slate-600 flex justify-between gap-4">
                                            <span>Inspections:</span>
                                            <span className="font-medium text-slate-900">{data.inspectionCount}</span>
                                        </div>
                                        <div className="text-sm text-slate-600 flex justify-between gap-4">
                                            <span>Pass Rate:</span>
                                            <span className="font-medium" style={{ color: getColorByPassRate(data.avgPassRate) }}>
                                                {data.avgPassRate}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar
                        dataKey="inspectionCount"
                        name="Inspections Completed"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColorByPassRate(entry.avgPassRate)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

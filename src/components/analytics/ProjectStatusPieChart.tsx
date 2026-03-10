"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ProjectStatusDistribution } from "@/types/analytics";

// Standardize colors across the app mapping to the tailwind utilities used in Project Cards
const STATUS_COLORS: Record<string, string> = {
    PLANNED: "#8b5cf6", // Purple
    IN_PROGRESS: "#3b82f6", // Blue
    ON_HOLD: "#f59e0b", // Amber
    COMPLETED: "#10b981", // Emerald
};

const formatStatusName = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export default function ProjectStatusPieChart({ data }: { data: ProjectStatusDistribution[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No active projects to display
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [value, "Projects"]}
                        labelFormatter={formatStatusName}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                        formatter={formatStatusName}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#64748b', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

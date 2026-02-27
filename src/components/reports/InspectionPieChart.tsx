"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ClipboardCheck } from "lucide-react";

type Props = {
    pass: number;
    fail: number;
};

const COLORS = ["#10b981", "#ef4444"]; // Emerald for Pass, Red for Fail

export default function InspectionPieChart({ pass, fail }: Props) {
    const data = [
        { name: "Pass", value: pass },
        { name: "Fail", value: fail },
    ];

    const total = pass + fail;

    return (
        <div className="glass-card p-6 flex flex-col h-full bg-white">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-blue-50">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Inspection Summary</h3>
            </div>

            {total === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <ClipboardCheck className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No inspections recorded yet</p>
                </div>
            ) : (
                <div className="flex-1 w-full relative min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 600 }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-[36px]">
                        <span className="text-3xl font-bold text-slate-800">{total}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                    </div>
                </div>
            )}
        </div>
    );
}

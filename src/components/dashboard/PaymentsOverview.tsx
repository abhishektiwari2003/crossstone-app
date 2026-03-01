"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export type PaymentsOverviewData = {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
};

type Props = {
    data: PaymentsOverviewData;
    role: string;
};

const COLORS = {
    paid: "#10b981",    // emerald-500
    pending: "#f59e0b", // amber-500
    overdue: "#ef4444"  // red-500
};

export default function PaymentsOverview({ data, role }: Props) {
    const totalAmount = data.totalPaid + data.totalPending + data.totalOverdue;

    const chartData = [
        { name: "Paid", value: data.totalPaid, color: COLORS.paid },
        { name: "Pending", value: data.totalPending, color: COLORS.pending },
        { name: "Overdue", value: data.totalOverdue, color: COLORS.overdue },
    ].filter(d => d.value > 0);

    const hasData = totalAmount > 0;

    return (
        <div className="glass-card p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Payments Overview</h2>
                </div>
                {(role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER" || role === "CLIENT") && (
                    <Link href="/payments" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                        Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {hasData ? (
                <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                    {/* Ring Chart */}
                    <div className="h-[180px] w-[180px] shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(val: number) => [`₹${val.toLocaleString()}`, ""]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-muted-foreground font-medium">Total</span>
                            <span className="text-sm font-bold text-foreground">₹{(totalAmount / 1000).toFixed(0)}k</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Paid</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">₹{data.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">₹{data.totalPending.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Overdue</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">₹{data.totalOverdue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <CreditCard className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No Payment Data</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">There are no recorded payments for your projects.</p>
                </div>
            )}
        </div>
    );
}

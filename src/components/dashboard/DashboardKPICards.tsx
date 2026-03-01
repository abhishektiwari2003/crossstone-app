"use client";

import { createElement } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export type KPIData = {
    label: string;
    value: string | number;
    trend: number; // percentage, positive or negative
    icon: string; // The generic name of the lucide icon
    gradient: string;
    chartData: { value: number }[];
};

type Props = {
    metrics: KPIData[];
};

const iconMap: Record<string, any> = {
    FolderKanban: require("lucide-react").FolderKanban,
    Activity: require("lucide-react").Activity,
    MessageSquare: require("lucide-react").MessageSquare,
    CreditCard: require("lucide-react").CreditCard,
    Users: require("lucide-react").Users,
};

export default function DashboardKPICards({ metrics }: Props) {
    if (!metrics || metrics.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {metrics.map((metric, idx) => {
                const isPositive = metric.trend > 0;
                const isNeutral = metric.trend === 0;
                const isNegative = metric.trend < 0;

                const trendTheme = isPositive
                    ? "text-emerald-500 bg-emerald-500/10"
                    : isNegative
                        ? "text-red-500 bg-red-500/10"
                        : "text-slate-500 bg-slate-500/10";

                const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

                return (
                    <div
                        key={idx}
                        className={`glass-card hover-lift rounded-2xl p-5 relative overflow-hidden group ${metric.gradient}`}
                    >
                        {/* Background flare */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl bg-white/40" />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                                {iconMap[metric.icon] ? createElement(iconMap[metric.icon], { className: "h-5 w-5 text-white" }) : null}
                            </div>

                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md border border-white/10 ${metric.trend >= 0 ? 'bg-white/20 text-white' : 'bg-red-500/20 text-white'}`}>
                                <TrendIcon className="h-3 w-3" />
                                {Math.abs(metric.trend)}%
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-white relative z-10">{metric.value}</div>
                        <div className="text-sm text-white/80 mt-1 font-medium relative z-10">{metric.label}</div>

                        {/* Mini Chart */}
                        {metric.chartData && metric.chartData.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 mt-4 pointer-events-none">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metric.chartData}>
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

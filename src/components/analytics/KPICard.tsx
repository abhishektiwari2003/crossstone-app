import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trendValue?: number; // e.g. 12 or -5
    trendLabel?: string; // e.g. "vs last month"
    valuePrefix?: string; // e.g. "₹"
}

export default function KPICard({ title, value, icon, trendValue, trendLabel, valuePrefix }: KPICardProps) {
    const isPositive = trendValue && trendValue > 0;
    const isNegative = trendValue && trendValue < 0;
    const isNeutral = trendValue === 0;

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-indigo-100 transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                        {icon}
                    </div>
                </div>

                <div className="flex items-baseline gap-1">
                    {valuePrefix && <span className="text-2xl font-bold text-slate-400">{valuePrefix}</span>}
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
                </div>

                {trendValue !== undefined && (
                    <div className="mt-4 flex items-center gap-2">
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' :
                                isNegative ? 'bg-red-50 text-red-600' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            {isPositive && <TrendingUp className="h-3 w-3" />}
                            {isNegative && <TrendingDown className="h-3 w-3" />}
                            {isNeutral && <Minus className="h-3 w-3" />}
                            <span>{isPositive ? '+' : ''}{trendValue}%</span>
                        </div>
                        {trendLabel && <span className="text-xs text-slate-400 font-medium">{trendLabel}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ServiceCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    badge?: number | string;
    gradientClass: string;
    iconColorClass: string;
    disabled?: boolean;
    disabledReason?: string;
};

export default function ServiceCard({
    title,
    description,
    icon: Icon,
    href,
    badge,
    gradientClass,
    iconColorClass,
    disabled = false,
    disabledReason = "Coming Soon",
}: ServiceCardProps) {
    const cardContent = (
        <div className={`glass-card p-5 relative min-h-[140px] flex flex-col justify-between transition-all duration-300 ${disabled ? 'opacity-60 grayscale-[0.5]' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer active:scale-[0.98]'}`}>

            {/* Context Badge */}
            {badge && !disabled && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-white animate-in zoom-in duration-300">
                    {badge}
                </div>
            )}

            {/* Icon Header */}
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${gradientClass} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className={`h-6 w-6 ${iconColorClass}`} />
                </div>
            </div>

            {/* Text Content */}
            <div className="mt-4">
                <h3 className="font-bold text-foreground text-sm leading-tight tracking-tight mb-1">{title}</h3>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{description}</p>
            </div>
        </div>
    );

    if (disabled) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div className="cursor-not-allowed">
                            {cardContent}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs bg-slate-900 text-white border-none font-medium">
                        {disabledReason}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
            {cardContent}
        </Link>
    );
}

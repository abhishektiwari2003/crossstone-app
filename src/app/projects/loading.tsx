import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="p-6 space-y-6">
			<Skeleton className="h-7 w-40" />
			<div className="grid gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-16" />
				))}
			</div>
		</div>
	);
}

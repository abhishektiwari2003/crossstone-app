import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-7 w-64" />
				<Skeleton className="h-4 w-40" />
			</div>
			<div className="grid sm:grid-cols-3 gap-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-20" />
				))}
			</div>
			<Skeleton className="h-64" />
			<Skeleton className="h-64" />
		</div>
	);
}

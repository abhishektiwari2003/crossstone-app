export default function Loading() {
	return (
		<div className="space-y-6">
			<div className="h-8 w-48 rounded-xl shimmer" />
			<div className="grid gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-2xl p-5 shimmer h-20" />
				))}
			</div>
		</div>
	);
}

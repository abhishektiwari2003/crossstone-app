export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-[#020617] relative overflow-hidden">
			{/* Ambient background glows */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/8 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/6 rounded-full blur-[100px]" />
				<div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[80px]" />
			</div>
			<div className="relative z-10">
				{children}
			</div>
		</div>
	);
}

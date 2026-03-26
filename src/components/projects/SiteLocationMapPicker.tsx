"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

const mapContainerStyle: CSSProperties = {
	width: "100%",
	maxWidth: "100%",
	height: "min(320px, 55vh)",
	minHeight: 220,
	borderRadius: "0.5rem",
};

function parseLatLng(latStr: string, lngStr: string): google.maps.LatLngLiteral | null {
	const lat = parseFloat(latStr);
	const lng = parseFloat(lngStr);
	if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
	return { lat, lng };
}

type Props = {
	latitude: string;
	longitude: string;
	onLatitudeChange: (value: string) => void;
	onLongitudeChange: (value: string) => void;
	className?: string;
};

export default function SiteLocationMapPicker({
	latitude,
	longitude,
	onLatitudeChange,
	onLongitudeChange,
	className,
}: Props) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
	const [locationPromptOpen, setLocationPromptOpen] = useState(false);

	const { isLoaded, loadError } = useJsApiLoader({
		id: "crossstone-google-maps",
		googleMapsApiKey: apiKey,
	});

	const position = useMemo(() => parseLatLng(latitude, longitude), [latitude, longitude]);

	const mapCenter = position ?? DEFAULT_CENTER;
	const zoom = position ? 16 : 5;

	const applyLatLng = useCallback(
		(lat: number, lng: number) => {
			onLatitudeChange(lat.toFixed(6));
			onLongitudeChange(lng.toFixed(6));
		},
		[onLatitudeChange, onLongitudeChange],
	);

	const onMapClick = useCallback(
		(e: google.maps.MapMouseEvent) => {
			if (!e.latLng) return;
			applyLatLng(e.latLng.lat(), e.latLng.lng());
		},
		[applyLatLng],
	);

	const onMarkerDragEnd = useCallback(
		(e: google.maps.MapMouseEvent) => {
			if (!e.latLng) return;
			applyLatLng(e.latLng.lat(), e.latLng.lng());
		},
		[applyLatLng],
	);

	const requestBrowserLocation = useCallback(() => {
		if (typeof window !== "undefined" && !window.isSecureContext) {
			toast.error("Location needs a secure page (https).");
			return;
		}
		if (!navigator.geolocation) {
			toast.error("This browser does not support geolocation.");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				applyLatLng(pos.coords.latitude, pos.coords.longitude);
				toast.success("Location set from your device");
			},
			(err) => {
				if (err.code === 1) {
					// GeolocationPositionError.PERMISSION_DENIED
					toast.error("Location was blocked. Allow location for this site in your browser settings.");
				} else {
					toast.error("Could not read your location. Try again or set coordinates manually.");
				}
			},
			{ enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
		);
	}, [applyLatLng]);

	function confirmAndRequestLocation() {
		// Call geolocation in the same click handler (before closing the dialog) so the browser keeps user activation.
		requestBrowserLocation();
		setLocationPromptOpen(false);
	}

	if (!apiKey) {
		return (
			<div
				className={`rounded-lg border border-dashed border-amber-300/80 bg-amber-50/40 px-3 py-2 text-xs text-muted-foreground ${className ?? ""}`}
			>
				Add <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
				enable the map. You can still enter coordinates below.
			</div>
		);
	}

	if (loadError) {
		return (
			<div className={`rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive ${className ?? ""}`}>
				Google Maps failed to load. Check the API key and billing for the Maps JavaScript API.
			</div>
		);
	}

	if (!isLoaded) {
		return (
			<div
				className={`flex h-[220px] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground ${className ?? ""}`}
			>
				Loading map…
			</div>
		);
	}

	return (
		<div className={`space-y-2 ${className ?? ""}`}>
			<AlertDialog open={locationPromptOpen} onOpenChange={setLocationPromptOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Use your current location?</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<span className="block">
								Your browser will show its own permission prompt (for example “Know your location” or “Allow location?”). We only use
								one reading to place the site pin on the map.
							</span>
							<span className="block text-xs">
								If nothing appears, check that pop-ups are not blocked and that this site is allowed to ask for location.
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
						<Button type="button" onClick={confirmAndRequestLocation}>
							Continue — ask browser
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={() => setLocationPromptOpen(true)}
					className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/60"
				>
					<LocateFixed className="h-3.5 w-3.5" />
					Use my current location
				</button>
				<p className="text-xs text-muted-foreground">
					Drag the pin or click the map to set the site. Coordinates update automatically.
				</p>
			</div>
			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				center={mapCenter}
				zoom={zoom}
				onClick={onMapClick}
				options={{
					streetViewControl: false,
					mapTypeControl: true,
					fullscreenControl: true,
				}}
			>
				{position ? (
					<Marker position={position} draggable onDragEnd={onMarkerDragEnd} />
				) : null}
			</GoogleMap>
		</div>
	);
}

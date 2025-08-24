"use client";

import { useEffect, useState } from "react";

type Props = { fileKey: string; thumbnailUrl?: string; label?: string };

export default function ViewMediaLink({ fileKey, label }: Props) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchViewUrl() {
    const data = await fetch(`/api/media/view?key=${encodeURIComponent(fileKey)}`).then(r=>r.json());
    if (!data?.url) throw new Error('Failed to get view URL');
    setViewUrl(data.url);
    return data.url as string;
  }

  useEffect(() => {
    let mounted = true;
    fetchViewUrl().catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [fileKey]);

  async function open() {
    try {
      // Refresh URL on click to avoid expiry
      const url = await fetchViewUrl();
      window.open(url, '_blank');
    } catch (_) {}
  }

  // If we have a URL, show a visual thumbnail; else show a simple button/placeholder
  if (viewUrl) {
    return (
      <button onClick={open} className="block rounded border overflow-hidden w-full text-left">
        <div className="aspect-video bg-zinc-100" style={{backgroundImage:`url(${viewUrl})`, backgroundSize:'cover', backgroundPosition:'center'}} />
      </button>
    );
  }

  return (
    <button onClick={open} className="block rounded border p-2 text-sm w-full text-left min-h-10">
      {loading ? 'Loading…' : (label ?? 'View')}
    </button>
  );
}



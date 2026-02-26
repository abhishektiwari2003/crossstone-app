import ViewMediaLink from "@/components/ViewMediaLink";
import type { QueryMedia } from "@/types/queries";

type Props = {
    attachments: QueryMedia[];
};

export default function AttachmentPreview({ attachments }: Props) {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-3">
            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Attachments</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {attachments.map((media) => (
                    <ViewMediaLink key={media.id} fileKey={media.fileKey} />
                ))}
            </div>
        </div>
    );
}

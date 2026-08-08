import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

export default function TableRowActions({
  href,
  onEdit,
}: {
  href: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
      <Link
        href={href}
        aria-label="Lihat profil"
        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit"
        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

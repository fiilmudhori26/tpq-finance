"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { renameKelas } from "@/actions/santri";

export default function EditableClassBadge({
  jenjang,
  kelas,
}: {
  jenjang: string;
  kelas: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(kelas);

  async function simpan() {
    const baru = value.trim();
    if (!baru || baru === kelas) {
      setEditing(false);
      setValue(kelas);
      return;
    }
    const res = await renameKelas({
      jenjang: jenjang as "TKA" | "TPA" | "TQA",
      kelasLama: kelas,
      kelasBaru: baru,
    });
    if (res.success) {
      toast.success(res.message ?? "Nama kelas diubah");
      router.refresh();
    } else {
      toast.error(res.message ?? "Gagal mengubah nama kelas");
      setValue(kelas);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={simpan}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setEditing(false);
            setValue(kelas);
          }
        }}
        aria-label="Ubah nama kelas"
        className="w-28 rounded-full border border-primary bg-surface-bright px-3 py-1 text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Klik untuk mengubah nama kelas"
      className="group inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold text-on-tertiary-fixed transition-colors hover:bg-tertiary-fixed/80"
    >
      {jenjang} - {kelas}
      <Pencil className="h-3 w-3 opacity-50 group-hover:opacity-90" aria-hidden />
    </button>
  );
}

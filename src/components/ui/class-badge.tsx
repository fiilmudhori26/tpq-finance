export default function ClassBadge({ kelas }: { kelas: string }) {
  return (
    <span className="inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold text-on-tertiary-fixed">
      {kelas}
    </span>
  );
}

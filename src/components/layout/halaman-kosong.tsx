export default function HalamanKosong({
  judul,
}: {
  judul: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">{judul}</h1>
        <p className="mt-1 text-on-surface-variant">
          Halaman ini belum diimplementasikan.
        </p>
      </div>
    </div>
  );
}

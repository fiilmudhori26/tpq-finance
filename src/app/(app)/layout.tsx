import { requireRole } from "@/lib/session";
import AppShell from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  return <AppShell>{children}</AppShell>;
}

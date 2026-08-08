"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getHomePath } from "@/actions/wali";
import SubmitButton from "@/components/ui/submit-button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sesi masih valid? (mis. cookie basi/valid) — langsung ke beranda/portal, jangan tampilkan form.
  const { data: session, isPending } = authClient.useSession();
  if (!isPending && session?.user) {
    getHomePath().then((p) => router.push(p));
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await authClient.signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? "Email atau password salah");
      setLoading(false);
      return;
    }
    const home = await getHomePath();
    router.push(home);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-lift md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary text-on-primary shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tpq.jpg" alt="Logo TPQ Darul Qur'an" className="h-full w-full object-cover" />
          </div>
            <h1 className="mt-5 text-2xl font-bold text-on-surface">TPQ Darul Qur&apos;an</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Kelola keuangan TPQ Darul Qur&apos;an
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-error-container px-4 py-3 text-sm font-medium text-on-error-container"
              >
                {error}
              </p>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admintpq@gmail.com"
                  className="w-full rounded-xl border border-outline-variant bg-surface-bright py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-outline-variant bg-surface-bright py-3 pl-11 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <SubmitButton
              pending={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-xs text-on-surface-variant">
            Akun demo: <span className="font-mono font-semibold text-primary">admintpq@gmail.com / admin123</span>
            <br />
            Portal wali: <span className="font-mono font-semibold text-primary">walitpq@gmail.com / wali123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

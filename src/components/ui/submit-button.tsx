import { Loader2 } from "lucide-react";

export default function SubmitButton({
  pending,
  children,
  className,
  disabled = false,
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

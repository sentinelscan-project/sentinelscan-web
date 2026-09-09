import { Spinner } from "@/components/ui/spinner";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-200 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-[0_1px_2px_rgba(17,24,39,0.08),0_8px_20px_-12px_rgba(37,99,255,0.7)] " +
    "hover:-translate-y-px hover:bg-brand-strong " +
    "hover:shadow-[0_2px_4px_rgba(17,24,39,0.08),0_14px_28px_-14px_rgba(37,99,255,0.8)]",
  secondary:
    "border border-hairline bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,39,0.04)] " +
    "hover:-translate-y-px hover:border-brand/45 hover:bg-raised",
  ghost: "text-muted hover:bg-raised hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm sm:text-base",
};

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

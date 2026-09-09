type AlertTone = "error" | "success" | "info";

const tones: Record<AlertTone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-lime-ink/25 bg-lime-soft text-lime-ink",
  info: "border-hairline bg-raised text-muted",
};

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-3 text-sm ${tones[tone]}`}
    >
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}

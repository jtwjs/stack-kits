import { type ArticleStatus, statusLabel } from "@/lib/article-status";

export function StatusBadge({ status }: { status: ArticleStatus }) {
  const tone =
    status === "PUBLISHED"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-zinc-100 text-zinc-700";
  return (
    <span className={`rounded px-2 py-0.5 text-sm ${tone}`}>
      {statusLabel(status)}
    </span>
  );
}

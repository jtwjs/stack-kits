import type { ArticleStatus } from "./types";

const LABELS: Record<ArticleStatus, string> = {
  DRAFT: "초안",
  PUBLISHED: "발행됨",
};

export function statusLabel(status: ArticleStatus): string {
  return LABELS[status];
}

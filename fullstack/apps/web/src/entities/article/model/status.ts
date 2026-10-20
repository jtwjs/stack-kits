import type { ArticleStatus } from "./types";

const LABELS: Record<ArticleStatus, string> = {
  DRAFT: "초안",
  PUBLISHED: "발행됨",
};

export const statusLabel = (status: ArticleStatus): string => LABELS[status];

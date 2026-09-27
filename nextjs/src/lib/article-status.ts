// 서버 계약의 ArticleStatus 와 같은 값. 풀스택 kit 에서는 생성된 타입(src/api/generated)으로 바뀐다.
export type ArticleStatus = "DRAFT" | "PUBLISHED";

const LABELS: Record<ArticleStatus, string> = {
  DRAFT: "초안",
  PUBLISHED: "발행됨",
};

export function statusLabel(status: ArticleStatus): string {
  return LABELS[status];
}

// 서버의 허용 전이표와 같은 규칙. 버튼을 보일지 판단한다 (최종 판정은 서버의 409).
export function canPublish(status: ArticleStatus): boolean {
  return status === "DRAFT";
}

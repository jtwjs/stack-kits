// 단일 kit — 서버가 없어 손으로 쓴 타입이다. 서버 계약이 생기면 생성 타입으로 바꾼다(fullstack kit 참고).
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

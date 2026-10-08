import type { components } from "@/shared/api";

// 응답 타입은 계약에서 생성된 것만 쓴다. 손으로 쓰지 않는다.
export type Article = components["schemas"]["ArticleResponse"];
export type ArticleStatus = Article["status"];

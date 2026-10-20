import type { Article } from "./model/types";

// 테스트·스토리 전용. 본문 코드에서 import 하면 lint 에러(eslint.config.js 의 fixtureRule).
export const draftArticle: Article = {
  id: 2,
  title: "두 번째 기사",
  status: "DRAFT",
  publishedAt: null,
};
export const publishedArticle: Article = {
  id: 1,
  title: "첫 기사",
  status: "PUBLISHED",
  publishedAt: "2026-01-01T15:30:00Z",
};

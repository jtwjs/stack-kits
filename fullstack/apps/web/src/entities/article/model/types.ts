import type { components } from "@/shared/api";

export type Article = components["schemas"]["ArticleResponse"];
export type ArticleStatus = Article["status"];

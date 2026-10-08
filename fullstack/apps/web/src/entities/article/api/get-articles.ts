import { api, unwrap } from "@/shared/api";

export function getArticles() {
  return unwrap(api.GET("/api/articles"));
}

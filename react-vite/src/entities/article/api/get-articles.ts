import { api, unwrap } from "@/shared/api";

export const getArticles = () => unwrap(api.GET("/api/articles"));

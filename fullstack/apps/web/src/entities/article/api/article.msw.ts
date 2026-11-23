import { http, HttpResponse } from "msw";
import { draftArticle, publishedArticle } from "../fixtures";
import type { Article } from "../model/types";

export const articleHandlers = {
  list: (articles: Article[] = [publishedArticle, draftArticle]) =>
    http.get("*/api/articles", () => HttpResponse.json(articles)),
  listProblem: (status: number, detail: string) =>
    http.get("*/api/articles", () =>
      HttpResponse.json(
        { status, title: "Error", detail },
        { status, headers: { "Content-Type": "application/problem+json" } },
      ),
    ),
};

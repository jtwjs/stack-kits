import { http, HttpResponse } from "msw";
import { draftArticle, publishedArticle } from "../fixtures";
import type { Article } from "../model/types";

// 테스트·스토리 전용 MSW 핸들러. 응답 데이터는 fixtures 를 쓴다. 본문 코드에서 import 하면 lint 에러.
// 경로 앞 `*` — jsdom 의 origin(http://localhost:3000)이든 브라우저 origin 이든 맞는다.
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

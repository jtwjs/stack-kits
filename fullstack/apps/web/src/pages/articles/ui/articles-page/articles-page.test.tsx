import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { articleHandlers } from "@/entities/article/api/article.msw";
import { publishedArticle } from "@/entities/article/fixtures";
import { server } from "@/shared/test/server";
import { renderWithProviders } from "@/shared/test/render";
import { ArticlesPage } from "./articles-page";

describe("ArticlesPage", () => {
  it("GET /api/articles 결과를 목록으로 보여 준다", async () => {
    server.use(articleHandlers.list([publishedArticle]));

    renderWithProviders(<ArticlesPage />);

    expect(await screen.findByText("첫 기사")).toBeInTheDocument();
  });

  it("ProblemDetail 이면 detail 을 보여 준다", async () => {
    server.use(articleHandlers.listProblem(503, "점검 중"));

    renderWithProviders(<ArticlesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("점검 중");
  });
});

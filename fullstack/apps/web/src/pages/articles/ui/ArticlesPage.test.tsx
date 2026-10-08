import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publishedArticle } from "@/entities/article/fixtures";
import { ArticlesPage } from "./ArticlesPage";

const json = (status: number, body: unknown, type = "application/json") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": type },
  });

describe("ArticlesPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("GET /api/articles 결과를 목록으로 보여 준다", async () => {
    const fetchMock = vi.fn<(req: Request) => Promise<Response>>(async () =>
      json(200, [publishedArticle]),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ArticlesPage />);

    expect(await screen.findByText("첫 기사")).toBeInTheDocument();
    expect(new URL(fetchMock.mock.calls[0]![0].url).pathname).toBe(
      "/api/articles",
    );
  });

  it("ProblemDetail 이면 detail 을 보여 준다", async () => {
    vi.stubGlobal("fetch", async () =>
      json(
        503,
        { status: 503, title: "Service Unavailable", detail: "점검 중" },
        "application/problem+json",
      ),
    );

    render(<ArticlesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("점검 중");
  });
});

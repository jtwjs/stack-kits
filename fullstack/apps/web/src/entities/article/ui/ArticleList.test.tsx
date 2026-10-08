import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { draftArticle, publishedArticle } from "../fixtures";
import { ArticleList } from "./ArticleList";

describe("ArticleList", () => {
  it("제목·상태·발행 시각(서비스 시간대)을 보여 준다", () => {
    render(<ArticleList articles={[draftArticle, publishedArticle]} />);
    expect(screen.getByText("두 번째 기사")).toBeInTheDocument();
    expect(screen.getByText("초안")).toBeInTheDocument();
    expect(screen.getByText("발행됨")).toBeInTheDocument();
    expect(screen.getByText("2026-01-02 00:30")).toBeInTheDocument();
  });

  it("비어 있으면 안내 문구", () => {
    render(<ArticleList articles={[]} />);
    expect(screen.getByText("기사가 없습니다.")).toBeInTheDocument();
  });
});

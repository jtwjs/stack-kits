import { describe, expect, it } from "vitest";
import { formatDateTime } from "./format";

describe("formatDateTime", () => {
  it("기본은 서비스 시간대(Asia/Seoul) — 날짜가 넘어가는 경우", () => {
    expect(formatDateTime("2026-01-01T15:30:00Z")).toBe("2026-01-02 00:30");
  });

  it("시간대를 넘기면 그 시간대로 찍는다 — 런타임 TZ 와 무관", () => {
    expect(formatDateTime("2026-01-01T15:30:00Z", "UTC")).toBe(
      "2026-01-01 15:30",
    );
    expect(formatDateTime("2026-01-01T15:30:00Z", "America/New_York")).toBe(
      "2026-01-01 10:30",
    );
  });
});

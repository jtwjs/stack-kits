import { describe, expect, it } from "vitest";
import { canPublish, statusLabel } from "./article-status";

describe("article-status", () => {
  describe("statusLabel", () => {
    it("상태 코드를 화면 문구로 바꾼다", () => {
      expect(statusLabel("DRAFT")).toBe("초안");
      expect(statusLabel("PUBLISHED")).toBe("발행됨");
    });
  });

  describe("canPublish", () => {
    it("초안만 발행할 수 있다", () => {
      expect(canPublish("DRAFT")).toBe(true);
      expect(canPublish("PUBLISHED")).toBe(false);
    });
  });
});

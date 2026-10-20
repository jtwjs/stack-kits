import { describe, expect, it } from "vitest";
import { ApiError, unwrap } from "./client";

const res = (status: number) => new Response(null, { status });

describe("unwrap", () => {
  it("성공이면 data 를 돌려준다", async () => {
    await expect(
      unwrap(Promise.resolve({ data: [1, 2], response: res(200) })),
    ).resolves.toEqual([1, 2]);
  });

  it("ProblemDetail 을 ApiError(status, detail) 로 바꾼다", async () => {
    const error = {
      status: 404,
      title: "Not Found",
      detail: "article 9 not found",
    };
    await expect(
      unwrap(Promise.resolve({ error, response: res(404) })),
    ).rejects.toEqual(new ApiError(404, "article 9 not found"));
  });

  it("detail 이 없으면 title 을 쓴다", async () => {
    const error = { status: 400, title: "Bad Request" };
    await expect(
      unwrap(Promise.resolve({ error, response: res(400) })),
    ).rejects.toMatchObject({
      status: 400,
      detail: "Bad Request",
    });
  });
});

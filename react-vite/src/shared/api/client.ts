import createClient from "openapi-fetch";
import type { paths } from "./generated";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const fetchAtCallTime = (request: Request) => globalThis.fetch(request);

export const api = createClient<paths>({
  baseUrl: globalThis.location?.origin,
  fetch: fetchAtCallTime,
});

type FetchResult<T> = { data?: T; error?: unknown; response: Response };
type FetchSuccess<T> = FetchResult<T> & { data: T };

const succeeded = <T>(result: FetchResult<T>): result is FetchSuccess<T> =>
  result.response.ok && result.data !== undefined;

const problemMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null) return undefined;
  if ("detail" in error && typeof error.detail === "string")
    return error.detail;
  if ("title" in error && typeof error.title === "string") return error.title;
  return undefined;
};

export const unwrap = async <T>(
  request: Promise<FetchResult<T>>,
): Promise<T> => {
  const result = await request;
  if (succeeded(result)) return result.data;
  if (result.response.ok)
    throw new Error(
      `${result.response.status} 응답에 본문이 없다 — unwrap 은 본문이 있는 응답에만 쓴다`,
    );
  throw new ApiError(
    result.response.status,
    problemMessage(result.error) ?? result.response.statusText,
  );
};

import createClient from "openapi-fetch";
import type { paths } from "./generated";

// 서버의 ProblemDetail(RFC 9457) 을 화면 코드가 다루기 쉬운 예외 하나로 바꾼다
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

// 계약 경로가 이미 /api 로 시작한다. 같은 출처(dev 는 vite proxy)라 baseUrl 은 현재 origin 이다.
// fetch 는 호출 시점에 찾는다 — openapi-fetch 는 생성 때 fetch 를 붙잡아 테스트의 vi.stubGlobal 이 안 먹는다.
export const api = createClient<paths>({
  baseUrl: globalThis.location?.origin,
  fetch: (request) => globalThis.fetch(request),
});

type FetchResult<T> = { data?: T; error?: unknown; response: Response };

// 성공이면 data 를, 실패면 ApiError 를 던진다. 화면 코드는 { data, error } 분기를 하지 않는다.
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (response.ok) return data as T;
  // RFC 9457 고정 필드(detail·title)만 읽는다. 계약의 ProblemDetail 스키마는 에러를 문서화한 엔드포인트가
  // 있어야 생기므로 여기서 기대지 않는다 — 예시 도메인을 지워 스키마가 사라져도 이 파일은 그대로 컴파일된다.
  const { detail, title } = (
    typeof error === "object" && error !== null ? error : {}
  ) as Record<string, unknown>;
  const message =
    typeof detail === "string"
      ? detail
      : typeof title === "string"
        ? title
        : response.statusText;
  throw new ApiError(response.status, message);
}

import { StatusBadge } from "@/components/status-badge";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">stack-kits · nextjs</h1>
      <p className="text-zinc-600">
        App Router · Vitest · Playwright · ESLint · Prettier. 단일 kit — 서버
        계약이 생기면 생성 타입으로 바꾼다(fullstack kit 참고).
      </p>
      <div>
        <StatusBadge status="DRAFT" />
      </div>
    </main>
  );
}

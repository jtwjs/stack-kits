import { StatusBadge } from "@/components/status-badge";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">stack-kits · nextjs</h1>
      <p className="text-zinc-600">
        App Router · Vitest · Playwright · ESLint · Prettier. 서버 계약 타입은
        풀스택 kit 에서 생성해 쓴다.
      </p>
      <div>
        <StatusBadge status="DRAFT" />
      </div>
    </main>
  );
}

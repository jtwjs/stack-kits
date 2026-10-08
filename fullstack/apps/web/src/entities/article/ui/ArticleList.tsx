import { formatDateTime } from "@/shared/lib";
import { statusLabel } from "../model/status";
import type { Article } from "../model/types";

export function ArticleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return <p>기사가 없습니다.</p>;
  return (
    <ul>
      {articles.map((a) => (
        <li key={a.id}>
          <strong>{a.title}</strong> · <span>{statusLabel(a.status)}</span>
          {a.publishedAt && (
            <>
              {" "}
              ·{" "}
              <time dateTime={a.publishedAt}>
                {formatDateTime(a.publishedAt)}
              </time>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

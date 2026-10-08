import { useEffect, useState } from "react";
import { type Article, ArticleList, getArticles } from "@/entities/article";
import { ApiError } from "@/shared/api";

type State =
  | { kind: "loading" }
  | { kind: "ok"; articles: Article[] }
  | { kind: "error"; message: string };

export function ArticlesPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    getArticles()
      .then((articles) => alive && setState({ kind: "ok", articles }))
      .catch(
        (e: unknown) =>
          alive &&
          setState({
            kind: "error",
            message: e instanceof ApiError ? e.detail : "불러오지 못했습니다.",
          }),
      );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main>
      <h1>기사</h1>
      {state.kind === "loading" && <p>불러오는 중…</p>}
      {state.kind === "error" && <p role="alert">{state.message}</p>}
      {state.kind === "ok" && <ArticleList articles={state.articles} />}
    </main>
  );
}

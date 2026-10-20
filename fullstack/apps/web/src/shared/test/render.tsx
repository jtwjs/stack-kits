import { render, type RenderOptions } from "@testing-library/react";
import { Fragment, type ReactElement } from "react";

// 프로바이더(React Query·라우터 등)를 붙이면 Fragment 자리에 감싼다. 지금 kit 에는 없다.
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: Fragment, ...options });

import { render, type RenderOptions } from "@testing-library/react";
import { Fragment, type ReactElement } from "react";

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: Fragment, ...options });

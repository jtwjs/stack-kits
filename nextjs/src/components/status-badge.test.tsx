import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("상태 문구를 보여 준다", () => {
    render(<StatusBadge status="PUBLISHED" />);
    expect(screen.getByText("발행됨")).toBeInTheDocument();
  });
});

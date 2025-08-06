import { render, screen } from "@testing-library/react";
import VerifyFlag from "../VerifyFlag";

describe("VerifyFlag component", () => {
  it("mostra la spunta verde ✅ e la classe text-green-600 quando isValid è true", () => {
    render(<VerifyFlag isValid={true} />);
    const flag = screen.getByText("✅");
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveClass("text-green-600");
  });

  it("mostra la X rossa ❌ e la classe text-red-600 quando isValid è false", () => {
    render(<VerifyFlag isValid={false} />);
    const flag = screen.getByText("❌");
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveClass("text-red-600");
  });

  it("matcha lo snapshot", () => {
    const { asFragment } = render(<VerifyFlag isValid={true} />);
    expect(asFragment()).toMatchSnapshot();
  });
});

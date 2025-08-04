import { render, screen, fireEvent, act } from "@testing-library/react";
import CopyJsonBox from "../CopyJsonBox";

describe("CopyJsonBox", () => {
  const sampleJson = { foo: "bar", arr: [1, 2] };

  beforeEach(() => {
    // Mock della clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      }
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("mostra il JSON formattato", () => {
  render(<CopyJsonBox json={sampleJson} />);
  const pre = screen.getByText(
    (content, node) =>
      !!node &&
      node.tagName.toLowerCase() === 'pre' &&
      content.includes('"foo": "bar"') &&
      content.includes('"arr"')
  );
  expect(pre).toBeInTheDocument();
  });

  it("mostra il label di default sul bottone", () => {
    render(<CopyJsonBox json={sampleJson} />);
    expect(screen.getByRole("button", { name: /copia json/i })).toBeInTheDocument();
  });

  it("usa il label custom se fornito", () => {
    render(<CopyJsonBox label="Test" json={sampleJson} />);
    expect(screen.getByRole("button", { name: /copia test/i })).toBeInTheDocument();
  });

  it("copia il JSON negli appunti e mostra 'Copiato!'", () => {
    render(<CopyJsonBox json={sampleJson} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(sampleJson, null, 2));
    expect(button).toHaveTextContent(/copiato!/i);

    // Dopo 1.2s torna il testo originale
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(button).toHaveTextContent(/copia json/i);
  });
});

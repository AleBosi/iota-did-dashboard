import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImportExportBox from "../ImportExportBox";

describe("ImportExportBox", () => {
  const label = "Dati Test";
  const exportData = { foo: "bar" };
  const mockOnImport = jest.fn();

  beforeEach(() => {
    mockOnImport.mockReset();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("renderizza i pulsanti con il label corretto", () => {
    render(<ImportExportBox label={label} exportData={exportData} onImport={mockOnImport} />);
    expect(screen.getByText(`Esporta ${label}`)).toBeInTheDocument();
    expect(screen.getByText(`Importa ${label}`)).toBeInTheDocument();
  });

  it("esegue l'export e crea un file json", () => {
    render(<ImportExportBox label={label} exportData={exportData} onImport={mockOnImport} />);

    const anchor = document.createElement("a");
    const clickMock = jest.spyOn(anchor, "click").mockImplementation(() => {});
    const removeMock = jest.spyOn(anchor, "remove").mockImplementation(() => {});
    const appendChildMock = jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);

    jest.spyOn(document, "createElement").mockReturnValueOnce(anchor);

    fireEvent.click(screen.getByText(`Esporta ${label}`));
    expect(clickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();

    clickMock.mockRestore();
    removeMock.mockRestore();
    appendChildMock.mockRestore();
  });

  it("importa un file json valido e chiama onImport con i dati giusti", async () => {
    render(<ImportExportBox label={label} exportData={exportData} onImport={mockOnImport} />);

    const file = new File([JSON.stringify({ bar: "baz" })], "test.json", { type: "application/json" });
    const input = screen.getByTestId("import-file");

    // Simula l'import
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith({ bar: "baz" });
    });
  });

  it("mostra un alert se si importa un file non valido", async () => {
    render(<ImportExportBox label={label} exportData={exportData} onImport={mockOnImport} />);

    const file = new File(["not a json"], "bad.json", { type: "application/json" });
    const input = screen.getByTestId("import-file");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("File non valido!");
      expect(mockOnImport).not.toHaveBeenCalled();
    });
  });
});

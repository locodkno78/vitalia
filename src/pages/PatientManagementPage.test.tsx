import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PatientManagementPage from "./PatientManagementPage";

import { findPatientByDocument } from "../services/patientService";

import type { Patient, Coverage } from "../types";

vi.mock("../services/patientService", () => ({
  findPatientByDocument: vi.fn(),
}));

describe("PatientManagementPage", () => {
  const patients: Patient[] = [];

  const coverages = [
    {
      idCobertura: "cov-1",
      nombre: "Particular",
      tipo: "particular",
      habilitada: true,
    },
  ] as Coverage[];

  it("abre el modal, permite navegar con teclado y restaura el foco al cerrarlo", async () => {
    const user = userEvent.setup();

    render(
      <PatientManagementPage
        patients={patients}
        coverages={coverages}
        onPatientsChange={() => {}}
      />
    );

    // El modal comienza cerrado.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Abrimos el formulario.
    const openButton = screen.getByRole("button", {
      name: /nuevo paciente/i,
    });

    await user.click(openButton);

    const dialog = screen.getByRole("dialog", {
      name: /nuevo paciente/i,
    });

    expect(dialog).toBeInTheDocument();

    // El foco debe ubicarse en el primer campo.
    const nameInput = screen.getByRole("textbox", {
      name: /nombre/i,
    });

    expect(nameInput).toHaveFocus();

    // Navegación mediante teclado.
    await user.tab();

    expect(
      screen.getByRole("textbox", {
        name: /apellido/i,
      })
    ).toHaveFocus();

    // Simulamos Escape y el evento cancel del diálogo nativo.
    await user.keyboard("{Escape}");

    fireEvent(
      dialog,
      new Event("cancel", { cancelable: true })
    );

    // El modal debe cerrarse.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // El foco debe regresar al botón que lo abrió.
    expect(openButton).toHaveFocus();
  });

  it("muestra un error al verificar el documento y permite reintentar", async () => {
    const user = userEvent.setup();

    const mockedFindPatient = vi.mocked(findPatientByDocument);

    // Primera búsqueda: falla.
    // Segundo intento: el documento está disponible.
    mockedFindPatient
      .mockRejectedValueOnce(new Error("Error de conexión"))
      .mockResolvedValueOnce(null);

    render(
      <PatientManagementPage
        patients={patients}
        coverages={coverages}
        onPatientsChange={() => {}}
      />
    );

    // Abrimos el formulario.
    await user.click(
      screen.getByRole("button", {
        name: /nuevo paciente/i,
      })
    );

    // Completamos los datos del documento.
    await user.selectOptions(
      screen.getByLabelText(/tipo de documento/i),
      "DNI"
    );

    await user.type(
      screen.getByLabelText(/número de documento/i),
      "12345678"
    );

    // Primera verificación.
    await user.click(
      screen.getByRole("button", {
        name: /verificar documento/i,
      })
    );

    // Esperamos el mensaje de error.
    const errorMessage = await screen.findByRole("alert");

    expect(errorMessage).toHaveTextContent(
      /no pudimos verificar el documento/i
    );

    expect(mockedFindPatient).toHaveBeenCalledTimes(1);

    // El formulario debe permitir reintentar.
    const retryButton = screen.getByRole("button", {
      name: /reintentar verificación/i,
    });

    expect(retryButton).toBeEnabled();

    // Segundo intento.
    await user.click(retryButton);

    // Esperamos que finalice la segunda búsqueda.
    await vi.waitFor(() => {
      expect(mockedFindPatient).toHaveBeenCalledTimes(2);
    });

    // El error anterior debe desaparecer.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});


import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppointmentCreatePage from "./AppointmentCreatePage";

import type {
  Appointment,
  Patient,
  Specialty,
  Professional,
} from "../types";

describe("AppointmentCreatePage - envío, error y reintento", () => {
  it("muestra el error del registro y permite reintentar correctamente", async () => {
    const user = userEvent.setup();

    const patients = [
      {
        id: "pac-1",
        nombre: "Ana",
        apellido: "Pérez",
        tipoDocumento: "DNI",
        numeroDocumento: "12345678",
        activo: true,
      },
    ] as unknown as Patient[];

    const specialties = [
      {
        idEspecialidad: "esp-1",
        nombre: "Clínica médica",
        habilitada: true,
      },
    ] as unknown as Specialty[];

    const professionals = [
      {
        idProfesional: "prof-1",
        nombre: "Juan",
        apellido: "Gómez",
        especialidadId: "esp-1",
        activo: true,
      },
    ] as unknown as Professional[];

    const onCreate = vi.fn((_appointment: Appointment) => {
      // El primer intento falla.
      if (onCreate.mock.calls.length === 1) {
        throw new Error("Error simulado al registrar");
      }
    });

    const onCancel = vi.fn();

    render(
      <AppointmentCreatePage
        onCancel={onCancel}
        onCreate={onCreate}
        patients={patients}
        specialties={specialties}
        professionals={professionals}
      />
    );

    // Completar los campos obligatorios.
    await user.selectOptions(
      screen.getByLabelText(/paciente/i),
      "pac-1"
    );

    await user.selectOptions(
      screen.getByLabelText(/especialidad/i),
      "esp-1"
    );

    await user.selectOptions(
      screen.getByLabelText(/profesional/i),
      "prof-1"
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    const futureDate = `${year}-${month}-${day}`;

    fireEvent.change(
      screen.getByLabelText(/fecha del turno/i),
      {
        target: { value: futureDate },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/horario/i),
      {
        target: { value: "10:00" },
      }
    );

    // Primer envío.
    await user.click(
      screen.getByRole("button", {
        name: /registrar turno/i,
      })
    );

    expect(
      screen.getByText(
        /verificando los datos y registrando el turno/i
      )
    ).toBeInTheDocument();

    // Esperar el error del primer intento.
    const errorMessage = await screen.findByRole(
      "alert",
      {},
      { timeout: 3000 }
    );

    expect(errorMessage).toHaveTextContent(
      /no se pudo registrar el turno/i
    );

    expect(onCreate).toHaveBeenCalledTimes(1);

    // Comprobar que el botón permite reintentar.
    const retryButton = screen.getByRole("button", {
      name: /reintentar registro/i,
    });

    expect(retryButton).toBeEnabled();

    // Segundo envío.
    await user.click(retryButton);

    expect(
      await screen.findByText(
        /verificando los datos y registrando el turno/i
      )
    ).toBeInTheDocument();

    // Esperar el resultado exitoso.
    await waitFor(
      () => {
        expect(
          screen.getByText(
            /turno registrado correctamente/i
          )
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(onCreate).toHaveBeenCalledTimes(2);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

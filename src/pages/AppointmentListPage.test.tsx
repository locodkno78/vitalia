
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppointmentListPage from "./AppointmentListPage";

import type {
  Appointment,
  Patient,
  Specialty,
  Professional,
} from "../types";

describe("AppointmentListPage - navegación y foco", () => {
  it("abre el detalle, permite navegar con teclado y restaura el foco al cerrarlo", async () => {
    const user = userEvent.setup();

    const patient = {
      id: "pac-1",
      nombre: "Ana",
      apellido: "Pérez",
      numeroDocumento: "12345678",
      telefono: "3811234567",
      email: "ana@email.com",
    } as Patient;

    const appointment = {
      idTurno: "turno-1",
      pacienteId: "pac-1",
      especialidadId: "esp-1",
      profesionalId: "prof-1",
      fechaTurno: "2026-12-15",
      horaTurno: "10:00",
      comentarios: "",
      confirmado: false,
      fechaConfirmacion: null,
      viaConfirmacion: null,
      horaIngreso: null,
      horaEgreso: null,
      ausente: true,
    } as Appointment;

    const onConfirmAppointment = () => {};
    const onAttendance = () => {};
    const onCreateAppointment = () => {};

    render(
      <AppointmentListPage
        appointments={[appointment]}
        patients={[patient]}
        specialties={[] as Specialty[]}
        professionals={[] as Professional[]}
        onCreateAppointment={onCreateAppointment}
        onConfirmAppointment={onConfirmAppointment}
        onAttendance={onAttendance}
      />
    );

    // Abrimos el detalle del turno.
    const openButton = screen.getByRole("button", {
      name: /ver turno de ana pérez/i,
    });

    await user.click(openButton);

    const dialog = screen.getByRole("dialog", {
      name: /detalle del turno/i,
    });

    expect(dialog).toBeInTheDocument();

    // El foco inicial debe estar en el botón cerrar del encabezado.
    const closeButton = screen.getByRole("button", {
      name: /cerrar ventana/i,
    });

    expect(closeButton).toHaveFocus();

    // Navegamos con Tab hasta el botón del pie del modal.
    await user.tab();

    expect(
      screen.getByRole("button", { name: /^cerrar$/i })
    ).toHaveFocus();

    // Simulamos Escape y el evento cancel del diálogo.
    await user.keyboard("{Escape}");

    fireEvent(
      dialog,
      new Event("cancel", { cancelable: true })
    );

    // El modal debe cerrarse.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // El foco vuelve al botón que abrió el detalle.
    expect(openButton).toHaveFocus();
  });
});

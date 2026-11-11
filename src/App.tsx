import { useState } from "react";

import AppointmentListPage from "./pages/AppointmentListPage";
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import PatientManagementPage from "./pages/PatientManagementPage";
import MasterDataPage from "./pages/MasterDataPage";

import {
  appointments as initialAppointments,
  patients as initialPatients,
  specialties as initialSpecialties,
  professionals as initialProfessionals,
  medicalCoverages as initialCoverages,
} from "./data";

import type {
  Appointment,
  Patient,
  Specialty,
  Professional,
  Coverage,
  ConfirmationChannel,
  AttendanceStatus,
} from "./types";

import { canConfirmAppointment } from "./utils/confirmationValidation";
import { validateAppointmentDate } from "./utils/appointmentValidation";
import { useTheme } from "./hooks/useTheme";
import { Monitor, Moon, Sun } from "lucide-react";

import "./App.css";

type CurrentPage = "list" | "create" | "patients" | "masters";

function App() {
  const { mode, setMode } = useTheme();
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const [specialties, setSpecialties] =
    useState<Specialty[]>(initialSpecialties);

  const [professionals, setProfessionals] =
    useState<Professional[]>(initialProfessionals);

  const [coverages, setCoverages] = useState<Coverage[]>(initialCoverages);

  const [currentPage, setCurrentPage] = useState<CurrentPage>("list");

  const themeOptions = [
    { mode: "light", label: "Claro", icon: Sun },
    { mode: "dark", label: "Oscuro", icon: Moon },
    { mode: "system", label: "Sistema", icon: Monitor },
  ] as const;

  // Crear turno con validación centralizada.
  function handleCreateAppointment(appointment: Appointment) {
    const selectedPatient = patients.find(
      (patient) =>
        patient.id === appointment.pacienteId && patient.activo
    );

    const selectedSpecialty = specialties.find(
      (specialty) =>
        specialty.idEspecialidad === appointment.especialidadId &&
        specialty.habilitada
    );

    const selectedProfessional = professionals.find(
      (professional) =>
        professional.idProfesional === appointment.profesionalId &&
        professional.activo &&
        professional.especialidadId === appointment.especialidadId
    );

    const dateError = validateAppointmentDate(appointment.fechaTurno);

    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(
      appointment.horaTurno
    );

    if (
      !selectedPatient ||
      !selectedSpecialty ||
      !selectedProfessional ||
      dateError ||
      !validTime
    ) {
      return;
    }

    setAppointments((previous) => [...previous, appointment]);
    setCurrentPage("list");
  }

  // Confirmar únicamente turnos habilitados para confirmación.
  function handleConfirmAppointment(
    appointmentId: string,
    channel: ConfirmationChannel
  ) {
    setAppointments((previous) =>
      previous.map((appointment) => {
        if (appointment.idTurno !== appointmentId) {
          return appointment;
        }

        if (
          appointment.confirmado ||
          appointment.ausente ||
          appointment.horaIngreso ||
          appointment.horaEgreso ||
          !canConfirmAppointment(appointment)
        ) {
          return appointment;
        }

        const confirmationDate = new Date();

        const year = confirmationDate.getFullYear();
        const month = String(
          confirmationDate.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
          confirmationDate.getDate()
        ).padStart(2, "0");

        return {
          ...appointment,
          confirmado: true,
          fechaConfirmacion: `${year}-${month}-${day}`,
          viaConfirmacion: channel,
        };
      })
    );
  }

  // Registrar ingreso, egreso o ausencia.
  function handleAttendance(
    appointmentId: string,
    action: Exclude<AttendanceStatus, "pendiente">
  ) {
    const now = new Date();

    const currentTime = `${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    setAppointments((previous) =>
      previous.map((appointment) => {
        if (appointment.idTurno !== appointmentId) {
          return appointment;
        }

        // No modificar turnos ausentes o finalizados.
        if (appointment.ausente || appointment.horaEgreso) {
          return appointment;
        }

        // Registrar ingreso una sola vez.
        if (
          action === "ingreso" &&
          appointment.confirmado &&
          !appointment.horaIngreso
        ) {
          return {
            ...appointment,
            horaIngreso: currentTime,
          };
        }

        // Registrar egreso únicamente después del ingreso.
        if (
          action === "egreso" &&
          appointment.confirmado &&
          appointment.horaIngreso &&
          !appointment.horaEgreso
        ) {
          return {
            ...appointment,
            horaEgreso: currentTime,
          };
        }

        // Marcar ausente únicamente si todavía no ingresó.
        if (
          action === "ausente" &&
          appointment.confirmado &&
          !appointment.horaIngreso
        ) {
          return {
            ...appointment,
            ausente: true,
          };
        }

        return appointment;
      })
    );
  }

  return (
    <>
      <nav className="main-navigation" aria-label="Navegación principal">
        <div className="main-navigation__brand">
          <span>Vitalia</span>
          <small>Salud Comunitaria</small>
        </div>

        <div className="main-navigation__links">
          <button
            type="button"
            className={currentPage === "list" ? "active" : ""}
            onClick={() => setCurrentPage("list")}
          >
            Turnos
          </button>

          <button
            type="button"
            className={currentPage === "create" ? "active" : ""}
            onClick={() => setCurrentPage("create")}
          >
            Nuevo turno
          </button>

          <button
            type="button"
            className={currentPage === "patients" ? "active" : ""}
            onClick={() => setCurrentPage("patients")}
          >
            Pacientes
          </button>

          <button
            type="button"
            className={currentPage === "masters" ? "active" : ""}
            onClick={() => setCurrentPage("masters")}
          >
            Datos maestros
          </button>
        </div>

        <div
          className="main-navigation__theme"
          role="group"
          aria-label="Tema de pantalla"
        >
          {themeOptions.map((option) => (
            <button
              key={option.mode}
              type="button"
              aria-label={option.label}
              title={option.label}
              aria-pressed={mode === option.mode}
              className={mode === option.mode ? "active" : ""}
              onClick={() => setMode(option.mode)}
            >
              <option.icon aria-hidden="true" size={18} />
            </button>
          ))}
        </div>
      </nav>

      {currentPage === "create" && (
        <AppointmentCreatePage
          patients={patients}
          specialties={specialties}
          professionals={professionals}
          onCancel={() => setCurrentPage("list")}
          onCreate={handleCreateAppointment}
        />
      )}

      {currentPage === "patients" && (
        <PatientManagementPage
          patients={patients}
          coverages={coverages}
          onPatientsChange={setPatients}
        />
      )}

      {currentPage === "masters" && (
        <MasterDataPage
          specialties={specialties}
          professionals={professionals}
          coverages={coverages}
          onSpecialtiesChange={setSpecialties}
          onProfessionalsChange={setProfessionals}
          onCoveragesChange={setCoverages}
        />
      )}

      {currentPage === "list" && (
        <AppointmentListPage
          appointments={appointments}
          patients={patients}
          specialties={specialties}
          professionals={professionals}
          onCreateAppointment={() => setCurrentPage("create")}
          onConfirmAppointment={handleConfirmAppointment}
          onAttendance={handleAttendance}
        />
      )}
    </>
  );
}

export default App;


import { useEffect, useRef, useState } from "react";

import AppointmentListPage from "./pages/AppointmentListPage";
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import PatientManagementPage from "./pages/PatientManagementPage";
import MasterDataPage from "./pages/MasterDataPage";
import ComponentCatalogPage from "./pages/ComponentCatalogPage";
import ErrorBoundary from "./components/common/ErrorBoundary";

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
import { isAppointmentDataValid } from "./utils/appointmentDataValidation";
import { useTheme } from "./hooks/useTheme";
import { Monitor, Moon, Sun } from "lucide-react";

import "./App.css";

type CurrentPage =
  | "list"
  | "create"
  | "edit"
  | "patients"
  | "masters"
  | "catalog";

function getInitialPage(): CurrentPage {
  return window.location.pathname === "/catalogo" ? "catalog" : "list";
}

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

  const [currentPage, setCurrentPage] =
    useState<CurrentPage>(getInitialPage);

  const [appointmentToEdit, setAppointmentToEdit] =
    useState<Appointment | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);

  // Navegación entre pantallas y actualización de la URL.
  function navigateTo(page: CurrentPage) {
    const newPath = page === "catalog" ? "/catalogo" : "/";

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, "", newPath);
    }

    setCurrentPage(page);
  }

  // Permitir volver y avanzar con los botones del navegador.
  useEffect(() => {
    function handlePopState() {
      setCurrentPage(getInitialPage());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Llevar el foco al contenido principal cuando cambia la vista.
  useEffect(() => {
    mainContentRef.current?.focus();
  }, [currentPage]);

  const themeOptions = [
    { mode: "light", label: "Claro", icon: Sun },
    { mode: "dark", label: "Oscuro", icon: Moon },
    { mode: "system", label: "Sistema", icon: Monitor },
  ] as const;

  function handleCreateAppointment(appointment: Appointment) {
    const isValid = isAppointmentDataValid(
      appointment,
      patients,
      specialties,
      professionals,
    );

    if (!isValid) {
      return;
    }

    setAppointments((previous) => [...previous, appointment]);
    setAppointmentToEdit(null);
    navigateTo("list");
  }

  function handleUpdateAppointment(updatedAppointment: Appointment) {
    const originalAppointment = appointments.find(
      (appointment) =>
        appointment.idTurno === updatedAppointment.idTurno,
    );

    const isOriginalDate =
      originalAppointment?.fechaTurno === updatedAppointment.fechaTurno;

    const isValid = isAppointmentDataValid(
      updatedAppointment,
      patients,
      specialties,
      professionals,
      isOriginalDate,
    );

    if (!isValid) {
      return;
    }

    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.idTurno === updatedAppointment.idTurno
          ? updatedAppointment
          : appointment,
      ),
    );

    setAppointmentToEdit(null);
    navigateTo("list");
  }

  function handleEditAppointment(appointment: Appointment) {
    setAppointmentToEdit(appointment);
    navigateTo("edit");
  }

  function handleConfirmAppointment(
    appointmentId: string,
    channel: ConfirmationChannel,
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
        const month = String(confirmationDate.getMonth() + 1).padStart(2, "0");
        const day = String(confirmationDate.getDate()).padStart(2, "0");

        return {
          ...appointment,
          confirmado: true,
          fechaConfirmacion: `${year}-${month}-${day}`,
          viaConfirmacion: channel,
        };
      }),
    );
  }

  function handleAttendance(
    appointmentId: string,
    action: Exclude<AttendanceStatus, "pendiente">,
  ) {
    const now = new Date();

    const currentTime = `${String(now.getHours()).padStart(
      2,
      "0",
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    setAppointments((previous) =>
      previous.map((appointment) => {
        if (appointment.idTurno !== appointmentId) {
          return appointment;
        }

        if (appointment.ausente || appointment.horaEgreso) {
          return appointment;
        }

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
      }),
    );
  }

  return (
    <ErrorBoundary>
      <nav className="main-navigation" aria-label="Navegación principal">
        <div className="main-navigation__brand">
          <span>Vitalia</span>
          <small>Salud Comunitaria</small>
        </div>

        <div className="main-navigation__links">
          <button
            type="button"
            className={
              currentPage === "list" || currentPage === "edit" ? "active" : ""
            }
            aria-current={
              currentPage === "list" || currentPage === "edit"
                ? "page"
                : undefined
            }
            onClick={() => navigateTo("list")}
          >
            Turnos
          </button>

          <button
            type="button"
            className={currentPage === "create" ? "active" : ""}
            aria-current={currentPage === "create" ? "page" : undefined}
            onClick={() => {
              setAppointmentToEdit(null);
              navigateTo("create");
            }}
          >
            Nuevo turno
          </button>

          <button
            type="button"
            className={currentPage === "patients" ? "active" : ""}
            aria-current={currentPage === "patients" ? "page" : undefined}
            onClick={() => navigateTo("patients")}
          >
            Pacientes
          </button>

          <button
            type="button"
            className={currentPage === "masters" ? "active" : ""}
            aria-current={currentPage === "masters" ? "page" : undefined}
            onClick={() => navigateTo("masters")}
          >
            Datos maestros
          </button>

          <button
            type="button"
            className={currentPage === "catalog" ? "active" : ""}
            aria-current={currentPage === "catalog" ? "page" : undefined}
            onClick={() => navigateTo("catalog")}
          >
            Catálogo
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

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        aria-label="Contenido principal"
      >
        {currentPage === "create" && (
          <AppointmentCreatePage
            patients={patients}
            specialties={specialties}
            professionals={professionals}
            onCancel={() => navigateTo("list")}
            onCreate={handleCreateAppointment}
          />
        )}

        {currentPage === "edit" && appointmentToEdit && (
          <AppointmentCreatePage
            patients={patients}
            specialties={specialties}
            professionals={professionals}
            appointmentToEdit={appointmentToEdit}
            onCancel={() => {
              setAppointmentToEdit(null);
              navigateTo("list");
            }}
            onCreate={handleCreateAppointment}
            onUpdate={handleUpdateAppointment}
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
            coverages={coverages}
            onCreateAppointment={() => {
              setAppointmentToEdit(null);
              navigateTo("create");
            }}
            onEditAppointment={handleEditAppointment}
            onConfirmAppointment={handleConfirmAppointment}
            onAttendance={handleAttendance}
          />
        )}

        {currentPage === "catalog" && <ComponentCatalogPage />}
      </main>
    </ErrorBoundary>
  );
}

export default App;


import { useMemo, useState } from "react";
import { CalendarPlus, Eye, Search } from "lucide-react";

import { canConfirmAppointment } from "../utils/confirmationValidation";

import type {
  Appointment,
  ConfirmationChannel,
  AttendanceStatus,
  Patient,
  Specialty,
  Professional,
} from "../types";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";

import "./AppointmentListPage.css";

type ConfirmationFilter = "all" | "confirmed" | "pending";

interface AppointmentListPageProps {
  appointments: Appointment[];
  patients: Patient[];
  specialties: Specialty[];
  professionals: Professional[];
  onCreateAppointment: () => void;
  onConfirmAppointment: (
    appointmentId: string,
    channel: ConfirmationChannel
  ) => void;
  onAttendance: (
    appointmentId: string,
    action: Exclude<AttendanceStatus, "pendiente">
  ) => void;
}

function getAppointmentStatus(appointment: Appointment) {
  if (appointment.ausente) {
    return { label: "Ausente", status: "danger" as const };
  }

  if (appointment.horaEgreso) {
    return { label: "Finalizado", status: "success" as const };
  }

  if (appointment.horaIngreso) {
    return { label: "En atención", status: "info" as const };
  }

  if (appointment.confirmado) {
    return { label: "Confirmado", status: "success" as const };
  }

  return { label: "Pendiente", status: "warning" as const };
}

function formatDate(date: string): string {
  if (!date) return "Sin fecha";

  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getConfirmationChannelName(
  channel: ConfirmationChannel | null
): string {
  if (!channel) return "No informado";

  const channels: Record<ConfirmationChannel, string> = {
    whatsapp: "WhatsApp",
    sms: "SMS",
    email: "Email",
  };

  return channels[channel];
}

function AppointmentListPage({
  appointments,
  patients,
  specialties,
  professionals,
  onCreateAppointment,
  onConfirmAppointment,
  onAttendance,
}: AppointmentListPageProps) {
  const [searchDocument, setSearchDocument] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const [confirmationFilter, setConfirmationFilter] =
    useState<ConfirmationFilter>("all");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [confirmationChannel, setConfirmationChannel] =
    useState<ConfirmationChannel>("whatsapp");

  const getPatientName = (patientId: string): string => {
    const patient = patients.find((item) => item.id === patientId);

    return patient
      ? `${patient.nombre} ${patient.apellido}`
      : "Paciente no disponible";
  };

  const getSpecialtyName = (specialtyId: string): string => {
    const specialty = specialties.find(
      (item) => item.idEspecialidad === specialtyId
    );

    return specialty?.nombre ?? "Especialidad no disponible";
  };

  const getProfessionalName = (professionalId: string): string => {
    const professional = professionals.find(
      (item) => item.idProfesional === professionalId
    );

    return professional
      ? `${professional.nombre} ${professional.apellido}`
      : "Profesional no disponible";
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patient = patients.find(
        (item) => item.id === appointment.pacienteId
      );

      const documentMatches =
        patient?.numeroDocumento
          .toLowerCase()
          .includes(searchDocument.trim().toLowerCase()) ?? false;

      const specialtyMatches =
        selectedSpecialty === "all" ||
        appointment.especialidadId === selectedSpecialty;

      const confirmationMatches =
        confirmationFilter === "all" ||
        (confirmationFilter === "confirmed" && appointment.confirmado) ||
        (
          confirmationFilter === "pending" &&
          !appointment.confirmado &&
          !appointment.ausente
        );

      return documentMatches && specialtyMatches && confirmationMatches;
    });
  }, [
    appointments,
    patients,
    searchDocument,
    selectedSpecialty,
    confirmationFilter,
  ]);

  const specialtyOptions = [
    { value: "all", label: "Todas las especialidades" },
    ...specialties.map((specialty) => ({
      value: specialty.idEspecialidad,
      label: specialty.habilitada
        ? specialty.nombre
        : `${specialty.nombre} (Deshabilitada)`,
    })),
  ];

  const confirmationOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmados" },
  ];

  const selectedPatient = selectedAppointment
    ? patients.find(
        (patient) => patient.id === selectedAppointment.pacienteId
      )
    : undefined;

  const selectedProfessional = selectedAppointment
    ? professionals.find(
        (professional) =>
          professional.idProfesional === selectedAppointment.profesionalId
      )
    : undefined;

  const selectedStatus = selectedAppointment
    ? getAppointmentStatus(selectedAppointment)
    : null;

  return (
    <main className="appointment-page">
      <header className="appointment-page__header">
        <div>
          <span className="appointment-page__eyebrow">
            GESTIÓN DE TURNOS
          </span>

          <h1>Listado de turnos</h1>

          <p>Consultá y administrá los turnos de los pacientes.</p>
        </div>

        <Button onClick={onCreateAppointment}>
          <CalendarPlus size={18} />
          Nuevo turno
        </Button>
      </header>

      <Card padding="lg">
        <div className="appointment-filters">
          <div className="appointment-filters__search">
            <Input
              label="Buscar paciente por documento"
              placeholder="Ingresá el número de documento"
              value={searchDocument}
              onChange={(event) => setSearchDocument(event.target.value)}
            />

            <Search
              className="appointment-filters__search-icon"
              size={19}
              aria-hidden="true"
            />
          </div>

          <Select
            label="Especialidad"
            value={selectedSpecialty}
            onChange={(event) => setSelectedSpecialty(event.target.value)}
            options={specialtyOptions}
          />

          <Select
            label="Estado de confirmación"
            value={confirmationFilter}
            onChange={(event) =>
              setConfirmationFilter(
                event.target.value as ConfirmationFilter
              )
            }
            options={confirmationOptions}
          />
        </div>

        <div
          className="appointment-results"
          role="status"
          aria-live="polite"
        >
          <span>
            {filteredAppointments.length}{" "}
            {filteredAppointments.length === 1
              ? "turno encontrado"
              : "turnos encontrados"}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="appointment-empty" role="status">
            <Search size={34} aria-hidden="true" />

            <h2>No encontramos turnos</h2>

            <p>
              Probá modificando los filtros o el documento ingresado.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                setSearchDocument("");
                setSelectedSpecialty("all");
                setConfirmationFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="appointment-table-wrapper">
              <table className="appointment-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Especialidad</th>
                    <th>Profesional</th>
                    <th>Fecha y hora</th>
                    <th>Estado</th>
                    <th>Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const patient = patients.find(
                      (item) => item.id === appointment.pacienteId
                    );

                    const status = getAppointmentStatus(appointment);

                    return (
                      <tr key={appointment.idTurno}>
                        <td>
                          {getPatientName(appointment.pacienteId)}
                        </td>

                        <td>
                          {patient?.numeroDocumento ?? "No disponible"}
                        </td>

                        <td>
                          {getSpecialtyName(appointment.especialidadId)}
                        </td>

                        <td>
                          {getProfessionalName(appointment.profesionalId)}
                        </td>

                        <td>
                          <span>
                            {formatDate(appointment.fechaTurno)}
                          </span>

                          <small>{appointment.horaTurno} hs</small>
                        </td>

                        <td>
                          <StatusBadge status={status.status}>
                            {status.label}
                          </StatusBadge>
                        </td>

                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Ver turno de ${getPatientName(
                              appointment.pacienteId
                            )}`}
                            onClick={() =>
                              setSelectedAppointment(appointment)
                            }
                          >
                            <Eye size={16} />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="appointment-mobile-list">
              {filteredAppointments.map((appointment) => {
                const status = getAppointmentStatus(appointment);

                const patient = patients.find(
                  (item) => item.id === appointment.pacienteId
                );

                return (
                  <article
                    className="appointment-mobile-card"
                    key={appointment.idTurno}
                  >
                    <div className="appointment-mobile-card__header">
                      <div>
                        <h2>
                          {getPatientName(appointment.pacienteId)}
                        </h2>

                        <span>
                          Documento:{" "}
                          {patient?.numeroDocumento ?? "No disponible"}
                        </span>
                      </div>

                      <StatusBadge status={status.status}>
                        {status.label}
                      </StatusBadge>
                    </div>

                    <div className="appointment-mobile-card__details">
                      <p>
                        <strong>Especialidad:</strong>{" "}
                        {getSpecialtyName(appointment.especialidadId)}
                      </p>

                      <p>
                        <strong>Profesional:</strong>{" "}
                        {getProfessionalName(appointment.profesionalId)}
                      </p>

                      <p>
                        <strong>Fecha:</strong>{" "}
                        {formatDate(appointment.fechaTurno)}
                      </p>

                      <p>
                        <strong>Hora:</strong> {appointment.horaTurno} hs
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <Eye size={16} />
                      Ver detalle
                    </Button>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={Boolean(selectedAppointment)}
        title="Detalle del turno"
        onClose={() => setSelectedAppointment(null)}
        footer={
          <Button
            variant="outline"
            onClick={() => setSelectedAppointment(null)}
          >
            Cerrar
          </Button>
        }
      >
        {selectedAppointment && (
          <div className="appointment-detail">
            <div className="appointment-detail__status">
              <span>Estado del turno</span>

              {selectedStatus && (
                <StatusBadge status={selectedStatus.status}>
                  {selectedStatus.label}
                </StatusBadge>
              )}
            </div>

            <section>
              <h3>Información del paciente</h3>

              <p>
                <strong>Nombre:</strong>{" "}
                {getPatientName(selectedAppointment.pacienteId)}
              </p>

              <p>
                <strong>Documento:</strong>{" "}
                {selectedPatient?.numeroDocumento ?? "No disponible"}
              </p>

              <p>
                <strong>Teléfono:</strong>{" "}
                {selectedPatient?.telefono ?? "No disponible"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedPatient?.email ?? "No disponible"}
              </p>
            </section>

            <section>
              <h3>Información del turno</h3>

              <p>
                <strong>Especialidad:</strong>{" "}
                {getSpecialtyName(selectedAppointment.especialidadId)}
              </p>

              <p>
                <strong>Profesional:</strong>{" "}
                {selectedProfessional
                  ? `${selectedProfessional.nombre} ${selectedProfessional.apellido}`
                  : "No disponible"}
              </p>

              <p>
                <strong>Fecha:</strong>{" "}
                {formatDate(selectedAppointment.fechaTurno)}
              </p>

              <p>
                <strong>Hora:</strong> {selectedAppointment.horaTurno} hs
              </p>

              <p>
                <strong>Comentarios:</strong>{" "}
                {selectedAppointment.comentarios || "Sin comentarios"}
              </p>
            </section>

            <section>
              <h3>Confirmación</h3>

              <p>
                <strong>Confirmado:</strong>{" "}
                {selectedAppointment.confirmado ? "Sí" : "No"}
              </p>

              <p>
                <strong>Fecha de confirmación:</strong>{" "}
                {selectedAppointment.fechaConfirmacion
                  ? formatDate(selectedAppointment.fechaConfirmacion)
                  : "Sin confirmar"}
              </p>

              <p>
                <strong>Canal:</strong>{" "}
                {getConfirmationChannelName(
                  selectedAppointment.viaConfirmacion
                )}
              </p>
            </section>

            {!selectedAppointment.confirmado &&
              !selectedAppointment.ausente &&
              canConfirmAppointment(selectedAppointment) && (
                <section className="appointment-confirmation">
                  <h3>Confirmar turno</h3>

                  <p>
                    El turno se encuentra dentro del período habilitado
                    para su confirmación.
                  </p>

                  <Select
                    label="Canal de confirmación"
                    value={confirmationChannel}
                    onChange={(event) =>
                      setConfirmationChannel(
                        event.target.value as ConfirmationChannel
                      )
                    }
                    options={[
                      { value: "whatsapp", label: "WhatsApp" },
                      { value: "sms", label: "SMS" },
                      { value: "email", label: "Email" },
                    ]}
                  />

                  <Button
                    fullWidth
                    onClick={() => {
                      onConfirmAppointment(
                        selectedAppointment.idTurno,
                        confirmationChannel
                      );

                      setSelectedAppointment(null);
                    }}
                  >
                    Confirmar turno
                  </Button>
                </section>
              )}

            {selectedAppointment.confirmado &&
              !selectedAppointment.ausente &&
              !selectedAppointment.horaEgreso && (
                <section className="appointment-confirmation">
                  <h3>Gestión de asistencia</h3>

                  {!selectedAppointment.horaIngreso && (
                    <>
                      <Button
                        fullWidth
                        onClick={() => {
                          onAttendance(
                            selectedAppointment.idTurno,
                            "ingreso"
                          );

                          setSelectedAppointment(null);
                        }}
                      >
                        Registrar ingreso
                      </Button>

                      <Button
                        fullWidth
                        variant="danger"
                        onClick={() => {
                          onAttendance(
                            selectedAppointment.idTurno,
                            "ausente"
                          );

                          setSelectedAppointment(null);
                        }}
                      >
                        Marcar como ausente
                      </Button>
                    </>
                  )}

                  {selectedAppointment.horaIngreso && (
                    <>
                      <p>
                        Ingreso: {selectedAppointment.horaIngreso} hs
                      </p>

                      <Button
                        fullWidth
                        onClick={() => {
                          onAttendance(
                            selectedAppointment.idTurno,
                            "egreso"
                          );

                          setSelectedAppointment(null);
                        }}
                      >
                        Registrar egreso
                      </Button>
                    </>
                  )}
                </section>
              )}

            {selectedAppointment.horaEgreso && (
              <p>
                Turno finalizado a las{" "}
                {selectedAppointment.horaEgreso} hs.
              </p>
            )}

            {selectedAppointment.ausente && (
              <p>El paciente fue registrado como ausente.</p>
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}

export default AppointmentListPage;

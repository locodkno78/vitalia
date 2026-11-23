
import { useMemo, useState } from "react";
import { CalendarPlus, Eye, Search, Pencil } from "lucide-react";

import { canConfirmAppointment } from "../utils/confirmationValidation";

import {
  formatDate,
  getConfirmationChannelName,
  getPatientName,
  getProfessionalName,
  getSpecialtyName,
} from "../data/helpers";

import type {
  Appointment,
  ConfirmationChannel,
  AttendanceStatus,
  Patient,
  Specialty,
  Professional,
  Coverage,
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
  coverages: Coverage[];
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onConfirmAppointment: (
    appointmentId: string,
    channel: ConfirmationChannel,
  ) => void;
  onAttendance: (
    appointmentId: string,
    action: Exclude<AttendanceStatus, "pendiente">,
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

function AppointmentListPage({
  appointments,
  patients,
  specialties,
  coverages,
  onCreateAppointment,
  onEditAppointment,
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

  const [actionFeedback, setActionFeedback] = useState("");

  // Crear un índice de pacientes para evitar búsquedas repetidas.
  const patientsById = useMemo(() => {
    return new Map(patients.map((patient) => [patient.id, patient]));
  }, [patients]);

  // Memorizar los turnos filtrados.
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patient = patientsById.get(appointment.pacienteId);

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
        (confirmationFilter === "pending" &&
          !appointment.confirmado &&
          !appointment.ausente);

      return documentMatches && specialtyMatches && confirmationMatches;
    });
  }, [
    appointments,
    patientsById,
    searchDocument,
    selectedSpecialty,
    confirmationFilter,
  ]);

  const specialtyOptions = useMemo(
    () => [
      { value: "all", label: "Todas las especialidades" },
      ...specialties.map((specialty) => ({
        value: specialty.idEspecialidad,
        label: specialty.habilitada
          ? specialty.nombre
          : `${specialty.nombre} (Deshabilitada)`,
      })),
    ],
    [specialties],
  );

  const confirmationOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmados" },
  ];

  const selectedPatient = selectedAppointment
    ? patientsById.get(selectedAppointment.pacienteId)
    : undefined;

  const selectedCoverage = coverages.find(
    (coverage) => coverage.idCobertura === selectedPatient?.coberturaId,
  );

  const particularCoverage = coverages.find(
    (coverage) => coverage.tipo === "particular",
  );

  const selectedCoverageName =
    selectedCoverage?.nombre ?? particularCoverage?.nombre ?? "Particular";

  const selectedStatus = selectedAppointment
    ? getAppointmentStatus(selectedAppointment)
    : null;

  function openAppointmentDetail(appointment: Appointment) {
    setActionFeedback("");
    setSelectedAppointment(appointment);
  }

  function closeAppointmentDetail() {
    setSelectedAppointment(null);
  }

  function handleEditAppointment() {
    if (!selectedAppointment) return;

    onEditAppointment(selectedAppointment);
    closeAppointmentDetail();
  }

  function handleConfirmAppointment() {
    if (!selectedAppointment) return;

    onConfirmAppointment(selectedAppointment.idTurno, confirmationChannel);

    setActionFeedback(
      `Se confirmó el turno de ${getPatientName(
        selectedAppointment.pacienteId,
      )} mediante ${getConfirmationChannelName(confirmationChannel)}.`,
    );

    closeAppointmentDetail();
  }

  function handleAttendance(action: Exclude<AttendanceStatus, "pendiente">) {
    if (!selectedAppointment) return;

    const patientName = getPatientName(selectedAppointment.pacienteId);

    onAttendance(selectedAppointment.idTurno, action);

    const messages: Record<Exclude<AttendanceStatus, "pendiente">, string> = {
      ingreso: `Se registró el ingreso de ${patientName}.`,
      egreso: `Se registró el egreso de ${patientName}.`,
      ausente: `Se registró la ausencia de ${patientName}.`,
    };

    setActionFeedback(messages[action]);

    closeAppointmentDetail();
  }

  return (
    <main className="appointment-page">
      <header className="appointment-page__header">
        <div>
          <span className="appointment-page__eyebrow">GESTIÓN DE TURNOS</span>

          <h1>Listado de turnos</h1>

          <p>Consultá y administrá los turnos de los pacientes.</p>
        </div>

        <Button onClick={onCreateAppointment}>
          <CalendarPlus size={18} aria-hidden="true" />
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
              setConfirmationFilter(event.target.value as ConfirmationFilter)
            }
            options={confirmationOptions}
          />
        </div>

        <div
          className="appointment-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            {filteredAppointments.length}{" "}
            {filteredAppointments.length === 1
              ? "turno encontrado"
              : "turnos encontrados"}
          </span>
        </div>

        {actionFeedback && (
          <p
            className="appointment-action-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {actionFeedback}
          </p>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="appointment-empty" role="status">
            <Search size={34} aria-hidden="true" />

            <h2>No encontramos turnos</h2>

            <p>Probá modificando los filtros o el documento ingresado.</p>

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
                <caption>Turnos registrados y sus estados actuales</caption>

                <thead>
                  <tr>
                    <th scope="col">Paciente</th>
                    <th scope="col">Documento</th>
                    <th scope="col">Especialidad</th>
                    <th scope="col">Profesional</th>
                    <th scope="col">Fecha y hora</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const patient = patientsById.get(appointment.pacienteId);
                    const status = getAppointmentStatus(appointment);

                    return (
                      <tr key={appointment.idTurno}>
                        <td>{getPatientName(appointment.pacienteId)}</td>

                        <td>{patient?.numeroDocumento ?? "No disponible"}</td>

                        <td>{getSpecialtyName(appointment.especialidadId)}</td>

                        <td>
                          {getProfessionalName(appointment.profesionalId)}
                        </td>

                        <td>
                          <span>{formatDate(appointment.fechaTurno)}</span>

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
                              appointment.pacienteId,
                            )}`}
                            onClick={() => openAppointmentDetail(appointment)}
                          >
                            <Eye size={16} aria-hidden="true" />
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
                const patient = patientsById.get(appointment.pacienteId);

                return (
                  <article
                    className="appointment-mobile-card"
                    key={appointment.idTurno}
                  >
                    <div className="appointment-mobile-card__header">
                      <div>
                        <h2>{getPatientName(appointment.pacienteId)}</h2>

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
                      aria-label={`Ver detalle del turno de ${getPatientName(
                        appointment.pacienteId,
                      )}`}
                      onClick={() => openAppointmentDetail(appointment)}
                    >
                      <Eye size={16} aria-hidden="true" />
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
        onClose={closeAppointmentDetail}
        footer={
          <Button variant="outline" onClick={closeAppointmentDetail}>
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

            <section aria-labelledby="appointment-patient-heading">
              <h3 id="appointment-patient-heading">Información del paciente</h3>

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

              <p>
                <strong>Cobertura médica:</strong> {selectedCoverageName}
              </p>
            </section>

            <section aria-labelledby="appointment-information-heading">
              <h3 id="appointment-information-heading">
                Información del turno
              </h3>

              <p>
                <strong>Especialidad:</strong>{" "}
                {getSpecialtyName(selectedAppointment.especialidadId)}
              </p>

              <p>
                <strong>Profesional:</strong>{" "}
                {getProfessionalName(selectedAppointment.profesionalId)}
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

            <Button fullWidth variant="outline" onClick={handleEditAppointment}>
              <Pencil size={16} aria-hidden="true" />
              Modificar turno
            </Button>

            <section aria-labelledby="appointment-confirmation-heading">
              <h3 id="appointment-confirmation-heading">Confirmación</h3>

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
                  selectedAppointment.viaConfirmacion,
                )}
              </p>
            </section>

            {!selectedAppointment.confirmado &&
              !selectedAppointment.ausente &&
              canConfirmAppointment(selectedAppointment) && (
                <section
                  className="appointment-confirmation"
                  aria-labelledby="appointment-confirm-heading"
                >
                  <h3 id="appointment-confirm-heading">Confirmar turno</h3>

                  <p>
                    El turno se encuentra dentro del período habilitado para su
                    confirmación.
                  </p>

                  <Select
                    label="Canal de confirmación"
                    value={confirmationChannel}
                    onChange={(event) =>
                      setConfirmationChannel(
                        event.target.value as ConfirmationChannel,
                      )
                    }
                    options={[
                      { value: "whatsapp", label: "WhatsApp" },
                      { value: "sms", label: "SMS" },
                      { value: "email", label: "Email" },
                    ]}
                  />

                  <Button fullWidth onClick={handleConfirmAppointment}>
                    Confirmar turno
                  </Button>
                </section>
              )}

            {selectedAppointment.confirmado &&
              !selectedAppointment.ausente &&
              !selectedAppointment.horaEgreso && (
                <section
                  className="appointment-confirmation"
                  aria-labelledby="appointment-attendance-heading"
                >
                  <h3 id="appointment-attendance-heading">
                    Gestión de asistencia
                  </h3>

                  {!selectedAppointment.horaIngreso && (
                    <>
                      <Button
                        fullWidth
                        onClick={() => handleAttendance("ingreso")}
                      >
                        Registrar ingreso
                      </Button>

                      <Button
                        fullWidth
                        variant="danger"
                        onClick={() => handleAttendance("ausente")}
                      >
                        Marcar como ausente
                      </Button>
                    </>
                  )}

                  {selectedAppointment.horaIngreso && (
                    <>
                      <p>Ingreso: {selectedAppointment.horaIngreso} hs</p>

                      <Button
                        fullWidth
                        onClick={() => handleAttendance("egreso")}
                      >
                        Registrar egreso
                      </Button>
                    </>
                  )}
                </section>
              )}

            {selectedAppointment.horaEgreso && (
              <p>Turno finalizado a las {selectedAppointment.horaEgreso} hs.</p>
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

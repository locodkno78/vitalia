import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarPlus } from "lucide-react";

import type {
  Appointment,
  Patient,
  Specialty,
  Professional,
} from "../types";

import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

import { validateAppointmentDate } from "../utils/appointmentValidation";

import "./AppointmentCreatePage.css";

interface AppointmentCreatePageProps {
  onCancel: () => void;
  onCreate: (appointment: Appointment) => void;
  patients: Patient[];
  specialties: Specialty[];
  professionals: Professional[];
}

interface FormData {
  pacienteId: string;
  especialidadId: string;
  profesionalId: string;
  fechaTurno: string;
  horaTurno: string;
  comentarios: string;
}

interface FormErrors {
  pacienteId?: string;
  especialidadId?: string;
  profesionalId?: string;
  fechaTurno?: string;
  horaTurno?: string;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMaximumDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 90);
  return getLocalDateString(date);
}

function AppointmentCreatePage({
  onCancel,
  onCreate,
  patients,
  specialties,
  professionals,
}: AppointmentCreatePageProps) {
  const [formData, setFormData] = useState<FormData>({
    pacienteId: "",
    especialidadId: "",
    profesionalId: "",
    fechaTurno: "",
    horaTurno: "",
    comentarios: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const activePatients = patients.filter((patient) => patient.activo);

  const activeSpecialties = specialties.filter(
    (specialty) => specialty.habilitada
  );

  const availableProfessionals = useMemo(() => {
    if (!formData.especialidadId) return [];

    return professionals.filter(
      (professional) =>
        professional.activo &&
        professional.especialidadId === formData.especialidadId
    );
  }, [formData.especialidadId, professionals]);

  const patientOptions = activePatients.map((patient) => ({
    value: patient.id,
    label: `${patient.apellido}, ${patient.nombre} - ${patient.tipoDocumento}: ${patient.numeroDocumento}`,
  }));

  const specialtyOptions = activeSpecialties.map((specialty) => ({
    value: specialty.idEspecialidad,
    label: specialty.nombre,
  }));

  const professionalOptions = availableProfessionals.map((professional) => ({
    value: professional.idProfesional,
    label: `${professional.apellido}, ${professional.nombre}`,
  }));

  function updateField(field: keyof FormData, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.pacienteId) {
      newErrors.pacienteId = "Seleccioná un paciente.";
    }

    if (!formData.especialidadId) {
      newErrors.especialidadId = "Seleccioná una especialidad.";
    }

    if (!formData.profesionalId) {
      newErrors.profesionalId = "Seleccioná un profesional.";
    }

    const dateError = validateAppointmentDate(formData.fechaTurno);

    if (dateError) {
      newErrors.fechaTurno = dateError;
    }

    if (!formData.horaTurno) {
      newErrors.horaTurno = "Seleccioná un horario.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    const selectedPatient = activePatients.find(
      (patient) => patient.id === formData.pacienteId
    );

    const selectedSpecialty = activeSpecialties.find(
      (specialty) =>
        specialty.idEspecialidad === formData.especialidadId
    );

    const selectedProfessional = availableProfessionals.find(
      (professional) =>
        professional.idProfesional === formData.profesionalId
    );

    if (!selectedPatient || !selectedSpecialty || !selectedProfessional) {
      return;
    }

    const newAppointment: Appointment = {
      idTurno: `tur-${Date.now()}`,
      pacienteId: formData.pacienteId,
      especialidadId: formData.especialidadId,
      profesionalId: formData.profesionalId,
      fechaTurno: formData.fechaTurno,
      horaTurno: formData.horaTurno,
      confirmado: false,
      fechaConfirmacion: null,
      viaConfirmacion: null,
      comentarios: formData.comentarios.trim(),
      horaIngreso: null,
      horaEgreso: null,
      ausente: false,
    };

    onCreate(newAppointment);
  }

  return (
    <main className="appointment-create-page">
      <button
        type="button"
        className="appointment-create-back"
        onClick={onCancel}
      >
        <ArrowLeft size={18} />
        Volver al listado
      </button>

      <header className="appointment-create-header">
        <div>
          <span className="appointment-create-eyebrow">
            GESTIÓN DE TURNOS
          </span>
          <h1>Otorgar un turno</h1>
          <p>Completá los datos para registrar un nuevo turno.</p>
        </div>

        <div className="appointment-create-icon" aria-hidden="true">
          <CalendarPlus size={28} />
        </div>
      </header>

      <Card padding="lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="appointment-create-section">
            <h2>Datos del paciente</h2>

            <Select
              label="Paciente"
              required
              value={formData.pacienteId}
              options={patientOptions}
              error={errors.pacienteId}
              onChange={(event) =>
                updateField("pacienteId", event.target.value)
              }
              hint="Solo aparecen pacientes activos."
            />
          </div>

          <div className="appointment-create-section">
            <h2>Datos del turno</h2>

            <div className="appointment-create-grid">
              <Select
                label="Especialidad"
                required
                value={formData.especialidadId}
                options={specialtyOptions}
                error={errors.especialidadId}
                onChange={(event) => {
                  setFormData((previous) => ({
                    ...previous,
                    especialidadId: event.target.value,
                    profesionalId: "",
                  }));

                  setErrors((previous) => ({
                    ...previous,
                    especialidadId: undefined,
                    profesionalId: undefined,
                  }));
                }}
                hint="Solo se muestran especialidades habilitadas."
              />

              <Select
                label="Profesional"
                required
                value={formData.profesionalId}
                options={professionalOptions}
                error={errors.profesionalId}
                disabled={!formData.especialidadId}
                onChange={(event) =>
                  updateField("profesionalId", event.target.value)
                }
                hint={
                  formData.especialidadId
                    ? "Profesionales disponibles para la especialidad."
                    : "Primero seleccioná una especialidad."
                }
              />

              <Input
                label="Fecha del turno"
                type="date"
                required
                min={getLocalDateString(new Date())}
                max={getMaximumDate()}
                value={formData.fechaTurno}
                error={errors.fechaTurno}
                onChange={(event) =>
                  updateField("fechaTurno", event.target.value)
                }
              />

              <Input
                label="Horario"
                type="time"
                required
                value={formData.horaTurno}
                error={errors.horaTurno}
                onChange={(event) =>
                  updateField("horaTurno", event.target.value)
                }
              />
            </div>
          </div>

          <div className="appointment-create-section">
            <h2>Información adicional</h2>

            <div className="appointment-create-comments">
              <label htmlFor="appointment-comments">
                Comentarios
              </label>
              <textarea
                id="appointment-comments"
                rows={4}
                placeholder="Escribí alguna observación sobre el turno..."
                value={formData.comentarios}
                onChange={(event) =>
                  updateField("comentarios", event.target.value)
                }
              />
            </div>
          </div>

          <div className="appointment-create-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>

            <Button type="submit">
              <CalendarPlus size={18} />
              Registrar turno
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default AppointmentCreatePage;


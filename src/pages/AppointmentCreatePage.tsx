import {
  useMemo,
  useState,
  useReducer,
  useRef,
  useEffect,
  type FormEvent,
} from "react";

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

import {
  appointmentFormReducer,
  type AppointmentDraft,
  type AppointmentFormState,
} from "../states/appointmentState";

import { validateAppointmentDate } from "../utils/appointmentValidation";

import "./AppointmentCreatePage.css";

interface AppointmentCreatePageProps {
  onCancel: () => void;
  onCreate: (appointment: Appointment) => void;
  patients: Patient[];
  specialties: Specialty[];
  professionals: Professional[];
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

function createEmptyForm(): AppointmentDraft {
  return {
    pacienteId: "",
    especialidadId: "",
    profesionalId: "",
    fechaTurno: "",
    horaTurno: "",
    comentarios: "",
  };
}

function AppointmentCreatePage({
  onCancel,
  onCreate,
  patients,
  specialties,
  professionals,
}: AppointmentCreatePageProps) {
  const [formData, setFormData] = useState<AppointmentDraft>(
    createEmptyForm
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const [appointmentForm, dispatchAppointmentForm] = useReducer(
    appointmentFormReducer,
    {
      status: "draft",
      values: createEmptyForm(),
    } as AppointmentFormState
  );

  const requestCounter = useRef(0);
  const isSubmittingRef = useRef(false);

  // Referencias para gestionar el foco.
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const shouldFocusValidationErrorsRef = useRef(false);
  const previousStatusRef = useRef(appointmentForm.status);

  // Enfocar el primer campo inválido después de validar.
  useEffect(() => {
    if (!shouldFocusValidationErrorsRef.current) return;

    shouldFocusValidationErrorsRef.current = false;

    const firstInvalidField =
      formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );

    firstInvalidField?.focus();
  }, [errors]);

  // Enfocar los mensajes cuando cambia el estado del formulario.
  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const currentStatus = appointmentForm.status;

    if (
      previousStatus !== currentStatus &&
      (currentStatus === "error" || currentStatus === "success")
    ) {
      feedbackRef.current?.focus();
    }

    previousStatusRef.current = currentStatus;
  }, [appointmentForm.status]);

  const activePatients = useMemo(
    () => patients.filter((patient) => patient.activo),
    [patients]
  );

  const activeSpecialties = useMemo(
    () => specialties.filter((specialty) => specialty.habilitada),
    [specialties]
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

  const professionalOptions = availableProfessionals.map(
    (professional) => ({
      value: professional.idProfesional,
      label: `${professional.apellido}, ${professional.nombre}`,
    })
  );

  const isProcessing =
    appointmentForm.status === "processing";

  const isSuccess =
    appointmentForm.status === "success";

  const canRetry =
    appointmentForm.status === "error" &&
    appointmentForm.retryable;

  const isDraft =
    appointmentForm.status === "draft";

  function updateField(
    field: keyof AppointmentDraft,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    dispatchAppointmentForm({
      type: "CHANGE",
      values: {
        [field]: value,
      },
    });

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.pacienteId) {
      newErrors.pacienteId = "Seleccioná un paciente.";
    } else if (
      !activePatients.some(
        (patient) => patient.id === formData.pacienteId
      )
    ) {
      newErrors.pacienteId =
        "El paciente seleccionado no está activo.";
    }

    if (!formData.especialidadId) {
      newErrors.especialidadId = "Seleccioná una especialidad.";
    } else if (
      !activeSpecialties.some(
        (specialty) =>
          specialty.idEspecialidad === formData.especialidadId
      )
    ) {
      newErrors.especialidadId =
        "La especialidad seleccionada no está habilitada.";
    }

    if (!formData.profesionalId) {
      newErrors.profesionalId = "Seleccioná un profesional.";
    } else if (
      !availableProfessionals.some(
        (professional) =>
          professional.idProfesional === formData.profesionalId
      )
    ) {
      newErrors.profesionalId =
        "El profesional no está disponible para esta especialidad.";
    }

    const dateError = validateAppointmentDate(
      formData.fechaTurno
    );

    if (dateError) {
      newErrors.fechaTurno = dateError;
    }

    if (!formData.horaTurno) {
      newErrors.horaTurno = "Seleccioná un horario.";
    } else if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(formData.horaTurno)
    ) {
      newErrors.horaTurno = "Ingresá un horario válido.";
    }

    shouldFocusValidationErrorsRef.current =
      Object.keys(newErrors).length > 0;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function verifyPatient(patientId: string): Promise<boolean> {
    // Simula una consulta asincrónica al servidor.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    const patientExists = patients.some(
      (patient) =>
        patient.id === patientId && patient.activo
    );

    return patientExists;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // Evita envíos duplicados.
    if (isSubmittingRef.current || isProcessing || isSuccess) {
      return;
    }

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

    if (
      !selectedPatient ||
      !selectedSpecialty ||
      !selectedProfessional
    ) {
      setErrors({
        pacienteId: !selectedPatient
          ? "El paciente seleccionado no está disponible."
          : undefined,
        especialidadId: !selectedSpecialty
          ? "La especialidad seleccionada no está disponible."
          : undefined,
        profesionalId: !selectedProfessional
          ? "El profesional seleccionado no está disponible."
          : undefined,
      });

      return;
    }

    isSubmittingRef.current = true;

    const requestId = String(++requestCounter.current);

    if (canRetry) {
      dispatchAppointmentForm({
        type: "RETRY",
        requestId,
      });
    } else {
      dispatchAppointmentForm({
        type: "SUBMIT",
        requestId,
        isValid: true,
      });
    }

    try {
      // Verificación asincrónica del paciente.
      const patientIsAvailable = await verifyPatient(
        formData.pacienteId
      );

      if (!patientIsAvailable) {
        dispatchAppointmentForm({
          type: "REJECT",
          message:
            "El paciente ya no está activo. Seleccioná otro paciente.",
          retryable: false,
        });

        setErrors({
          pacienteId:
            "El paciente ya no está activo. Seleccioná otro paciente.",
        });

        return;
      }

      // Simula el procesamiento del otorgamiento del turno.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });

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

      dispatchAppointmentForm({
        type: "RESOLVE",
        appointmentId: newAppointment.idTurno,
      });
    } catch {
      dispatchAppointmentForm({
        type: "REJECT",
        message:
          "No se pudo registrar el turno. Intentá nuevamente.",
        retryable: true,
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <main className="appointment-create-page">
      <button
        type="button"
        className="appointment-create-back"
        onClick={onCancel}
        disabled={isProcessing}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver al listado
      </button>

      <header className="appointment-create-header">
        <div>
          <span className="appointment-create-eyebrow">
            GESTIÓN DE TURNOS
          </span>

          <h1>Otorgar un turno</h1>

          <p>
            Completá los datos para registrar un nuevo turno.
          </p>
        </div>

        <div
          className="appointment-create-icon"
          aria-hidden="true"
        >
          <CalendarPlus size={28} />
        </div>
      </header>

      <Card padding="lg">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="appointment-form-title"
        >
          <h2 id="appointment-form-title" className="sr-only">
            Formulario de otorgamiento de turno
          </h2>

          <div className="appointment-create-section">
            <h2>Datos del paciente</h2>

            <Select
              label="Paciente"
              required
              value={formData.pacienteId}
              options={patientOptions}
              error={errors.pacienteId}
              disabled={isProcessing || isSuccess}
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
                disabled={isProcessing || isSuccess}
                onChange={(event) => {
                  const value = event.target.value;

                  setFormData((previous) => ({
                    ...previous,
                    especialidadId: value,
                    profesionalId: "",
                  }));

                  dispatchAppointmentForm({
                    type: "CHANGE",
                    values: {
                      especialidadId: value,
                      profesionalId: "",
                    },
                  });

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
                disabled={
                  !formData.especialidadId ||
                  isProcessing ||
                  isSuccess
                }
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
                disabled={isProcessing || isSuccess}
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
                disabled={isProcessing || isSuccess}
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
                disabled={isProcessing || isSuccess}
                onChange={(event) =>
                  updateField("comentarios", event.target.value)
                }
              />
            </div>
          </div>

          {appointmentForm.status === "error" && (
            <div
              ref={feedbackRef}
              className="appointment-form-error"
              role="alert"
              tabIndex={-1}
              aria-label="Error al registrar el turno"
            >
              {appointmentForm.message}
            </div>
          )}

          {isProcessing && (
            <p role="status" aria-live="polite">
              Verificando los datos y registrando el turno...
            </p>
          )}

          {isSuccess && (
            <div
              ref={feedbackRef}
              className="appointment-form-success"
              role="status"
              tabIndex={-1}
            >
              ¡Turno registrado correctamente!
            </div>
          )}

          <div className="appointment-create-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              {isSuccess ? "Volver al listado" : "Cancelar"}
            </Button>

            {!isSuccess && (
              <Button
                type="submit"
                disabled={isProcessing || (!isDraft && !canRetry)}
                loading={isProcessing}
              >
                <CalendarPlus size={18} />
                {isProcessing
                  ? "Registrando..."
                  : canRetry
                    ? "Reintentar registro"
                    : "Registrar turno"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </main>
  );
}

export default AppointmentCreatePage;

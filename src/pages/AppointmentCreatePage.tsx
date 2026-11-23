
import {
  useMemo,
  useState,
  useReducer,
  useRef,
  useEffect,
  type FormEvent,
} from "react";

import { ArrowLeft, CalendarPlus, Pencil } from "lucide-react";

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
  onUpdate?: (appointment: Appointment) => void;
  appointmentToEdit?: Appointment | null;
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
  onUpdate,
  appointmentToEdit,
  patients,
  specialties,
  professionals,
}: AppointmentCreatePageProps) {
  const isEditing = Boolean(appointmentToEdit);

  const [formData, setFormData] = useState<AppointmentDraft>(() => {
    if (!appointmentToEdit) {
      return createEmptyForm();
    }

    return {
      pacienteId: appointmentToEdit.pacienteId,
      especialidadId: appointmentToEdit.especialidadId,
      profesionalId: appointmentToEdit.profesionalId,
      fechaTurno: appointmentToEdit.fechaTurno,
      horaTurno: appointmentToEdit.horaTurno,
      comentarios: appointmentToEdit.comentarios ?? "",
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [appointmentForm, dispatchAppointmentForm] = useReducer(
    appointmentFormReducer,
    {
      status: "draft",
      values: formData,
    } as AppointmentFormState
  );

  const requestCounter = useRef(0);
  const isSubmittingRef = useRef(false);

  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const shouldFocusValidationErrorsRef = useRef(false);
  const previousStatusRef = useRef(appointmentForm.status);

  // Enfocar el primer campo inválido.
  useEffect(() => {
    if (!shouldFocusValidationErrorsRef.current) return;

    shouldFocusValidationErrorsRef.current = false;

    const firstInvalidField =
      formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );

    firstInvalidField?.focus();
  }, [errors]);

  // Enfocar los mensajes de error o éxito.
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

  const isProcessing = appointmentForm.status === "processing";
  const isSuccess = appointmentForm.status === "success";

  const canRetry =
    appointmentForm.status === "error" &&
    appointmentForm.retryable;

  const isDraft = appointmentForm.status === "draft";

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

    // Al editar, permitimos conservar la fecha original.
    const isOriginalDate =
      isEditing &&
      appointmentToEdit?.fechaTurno === formData.fechaTurno;

    const dateError = isOriginalDate
      ? undefined
      : validateAppointmentDate(formData.fechaTurno);

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
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    return patients.some(
      (patient) =>
        patient.id === patientId && patient.activo
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });

      if (appointmentToEdit) {
        // EDITAR: conservar el ID y todos los datos
        // que no forman parte del formulario.
        if (!onUpdate) {
          throw new Error(
            "No se configuró la función para actualizar el turno."
          );
        }

        const updatedAppointment: Appointment = {
          ...appointmentToEdit,
          pacienteId: formData.pacienteId,
          especialidadId: formData.especialidadId,
          profesionalId: formData.profesionalId,
          fechaTurno: formData.fechaTurno,
          horaTurno: formData.horaTurno,
          comentarios: formData.comentarios.trim(),
        };

        onUpdate(updatedAppointment);

        dispatchAppointmentForm({
          type: "RESOLVE",
          appointmentId: updatedAppointment.idTurno,
        });
      } else {
        // CREAR: generar un turno completamente nuevo.
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
      }
    } catch {
      dispatchAppointmentForm({
        type: "REJECT",
        message: isEditing
          ? "No se pudo actualizar el turno. Intentá nuevamente."
          : "No se pudo registrar el turno. Intentá nuevamente.",
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

          <h1>
            {isEditing ? "Modificar turno" : "Otorgar un turno"}
          </h1>

          <p>
            {isEditing
              ? "Modificá los datos del turno seleccionado."
              : "Completá los datos para registrar un nuevo turno."}
          </p>
        </div>

        <div
          className="appointment-create-icon"
          aria-hidden="true"
        >
          {isEditing ? <Pencil size={28} /> : <CalendarPlus size={28} />}
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
            {isEditing
              ? "Formulario de modificación de turno"
              : "Formulario de otorgamiento de turno"}
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
                min={
                  isEditing
                    ? undefined
                    : getLocalDateString(new Date())
                }
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
              aria-label={
                isEditing
                  ? "Error al modificar el turno"
                  : "Error al registrar el turno"
              }
            >
              {appointmentForm.message}
            </div>
          )}

          {isProcessing && (
            <p role="status" aria-live="polite">
              {isEditing
                ? "Verificando los datos y actualizando el turno..."
                : "Verificando los datos y registrando el turno..."}
            </p>
          )}

          {isSuccess && (
            <div
              ref={feedbackRef}
              className="appointment-form-success"
              role="status"
              tabIndex={-1}
            >
              {isEditing
                ? "¡Turno actualizado correctamente!"
                : "¡Turno registrado correctamente!"}
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
                {isEditing ? (
                  <Pencil size={18} />
                ) : (
                  <CalendarPlus size={18} />
                )}

                {isProcessing
                  ? isEditing
                    ? "Actualizando..."
                    : "Registrando..."
                  : canRetry
                    ? isEditing
                      ? "Reintentar actualización"
                      : "Reintentar registro"
                    : isEditing
                      ? "Guardar cambios"
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

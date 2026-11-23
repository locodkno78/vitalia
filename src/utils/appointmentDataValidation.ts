
import type {
  Appointment,
  Patient,
  Specialty,
  Professional,
} from "../types";

import { validateAppointmentDate } from "./appointmentValidation";

export function isAppointmentDataValid(
  appointment: Appointment,
  patients: Patient[],
  specialties: Specialty[],
  professionals: Professional[],
  isOriginalDate = false,
): boolean {
  const selectedPatient = patients.find(
    (patient) => patient.id === appointment.pacienteId && patient.activo,
  );

  const selectedSpecialty = specialties.find(
    (specialty) =>
      specialty.idEspecialidad === appointment.especialidadId &&
      specialty.habilitada,
  );

  const selectedProfessional = professionals.find(
    (professional) =>
      professional.idProfesional === appointment.profesionalId &&
      professional.activo &&
      professional.especialidadId === appointment.especialidadId,
  );

  const dateError = isOriginalDate
    ? undefined
    : validateAppointmentDate(appointment.fechaTurno);

  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(
    appointment.horaTurno,
  );

  return Boolean(
    selectedPatient &&
      selectedSpecialty &&
      selectedProfessional &&
      !dateError &&
      validTime,
  );
}

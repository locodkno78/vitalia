import {
  patients,
  specialties,
  professionals,
  medicalCoverages,
} from "./index";

import type { ConfirmationChannel } from "../types";

// =====================================
// PACIENTES
// =====================================

export function getPatientName(patientId: string): string {
  const patient = patients.find((item) => item.id === patientId);

  return patient
    ? `${patient.nombre} ${patient.apellido}`
    : "Paciente no disponible";
}

// =====================================
// ESPECIALIDADES
// =====================================

export function getSpecialtyName(specialtyId: string): string {
  const specialty = specialties.find(
    (item) => item.idEspecialidad === specialtyId
  );

  return specialty?.nombre ?? "Especialidad no disponible";
}

// =====================================
// PROFESIONALES
// =====================================

export function getProfessionalName(professionalId: string): string {
  const professional = professionals.find(
    (item) => item.idProfesional === professionalId
  );

  return professional
    ? `${professional.nombre} ${professional.apellido}`
    : "Profesional no disponible";
}

// =====================================
// COBERTURAS MÉDICAS
// =====================================

export function getCoverageName(coverageId: string): string {
  const coverage = medicalCoverages.find(
    (item) => item.idCobertura === coverageId
  );

  if (coverage) {
    return coverage.nombre;
  }

  const particularCoverage = medicalCoverages.find(
    (item) => item.tipo === "particular"
  );

  return particularCoverage?.nombre ?? "Particular";
}

// =====================================
// FORMATO DE FECHAS
// =====================================

export function formatDate(
  date: string | null | undefined
): string {
  if (!date) {
    return "Sin fecha";
  }

  const [year, month, day] = date.split("-").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return "Fecha no disponible";
  }

  const localDate = new Date(year, month - 1, day);

  // Evita aceptar fechas inexistentes, como 31/02.
  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return "Fecha no disponible";
  }

  return localDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// =====================================
// CANALES DE CONFIRMACIÓN
// =====================================

export function getConfirmationChannelName(
  channel: ConfirmationChannel | null
): string {
  if (!channel) {
    return "No informado";
  }

  const channels: Record<ConfirmationChannel, string> = {
    whatsapp: "WhatsApp",
    sms: "SMS",
    email: "Email",
  };

  return channels[channel];
}

import {
  patients,
  specialties,
  professionals,
  medicalCoverages,
} from "./index";

export function getPatientName(patientId: string): string {
  const patient = patients.find((item) => item.id === patientId);

  return patient
    ? `${patient.nombre} ${patient.apellido}`
    : "Paciente no encontrado";
}

export function getSpecialtyName(specialtyId: string): string {
  const specialty = specialties.find(
    (item) => item.idEspecialidad === specialtyId
  );

  return specialty?.nombre ?? "Especialidad no encontrada";
}

export function getProfessionalName(professionalId: string): string {
  const professional = professionals.find(
    (item) => item.idProfesional === professionalId
  );

  return professional
    ? `${professional.nombre} ${professional.apellido}`
    : "Profesional no encontrado";
}

export function getCoverageName(coverageId: string): string {
  const coverage = medicalCoverages.find(
    (item) => item.idCobertura === coverageId
  );

  return coverage?.nombre ?? "Cobertura no encontrada";
}
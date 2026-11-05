import type { Patient } from "../types";
import { medicalCoverages } from "../data";

export function getDefaultCoverageId(): string {
  const particularCoverage = medicalCoverages.find(
    (coverage) => coverage.tipo === "particular"
  );

  if (!particularCoverage) {
    throw new Error("No se encontró la cobertura Particular.");
  }

  return particularCoverage.idCobertura;
}

export function applyPatientDefaults(
  patient: Partial<Patient>
): Partial<Patient> {
  return {
    ...patient,
    coberturaId: patient.coberturaId || getDefaultCoverageId(),
  };
}
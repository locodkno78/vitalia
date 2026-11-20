import type { Patient, DocumentType } from "../types";

export interface PatientDocumentSearch {
  tipoDocumento: DocumentType;
  numeroDocumento: string;
}

export async function findPatientByDocument(
  patients: Patient[],
  document: PatientDocumentSearch
): Promise<Patient | null> {
  // Simula una consulta asincrónica a un servidor.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 500);
  });

  const normalizedDocument = document.numeroDocumento
    .trim()
    .toUpperCase();

  const foundPatient = patients.find(
    (patient) =>
      patient.tipoDocumento === document.tipoDocumento &&
      patient.numeroDocumento.trim().toUpperCase() === normalizedDocument
  );

  return foundPatient ?? null;
}

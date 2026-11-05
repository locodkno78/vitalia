export type DocumentType = "DNI" | "RUT" | "CURP" | "OTRO";

export type CoverageType = "publica" | "privada" | "particular";

export interface Patient {
  id: string;
  apellido: string;
  nombre: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  coberturaId: string;
  activo: boolean;
}
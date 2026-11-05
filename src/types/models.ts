// =====================================
// TIPOS GENERALES
// =====================================

export type CoverageType =
  | "publica"
  | "privada"
  | "particular";

export type DocumentType =
  | "DNI"
  | "RUT"
  | "CURP"
  | "OTRO";

export type ConfirmationChannel =
  | "sms"
  | "whatsapp"
  | "email";

export type AppointmentConfirmationStatus =
  | "confirmado"
  | "pendiente";

export type AppointmentAttendanceStatus =
  | "pendiente"
  | "presente"
  | "ausente";

// =====================================
// PACIENTES
// =====================================

export interface Patient {
  id: string;
  apellido: string;
  nombre: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  fechaNacimiento: string;
  coberturaMedica: CoverageType;
  coberturaId: string;
  telefono: string;
  email: string;
  activo: boolean;
}

// =====================================
// COBERTURAS MÉDICAS
// =====================================

export interface MedicalCoverage {
  idCobertura: string;
  nombre: string;
  tipo: CoverageType;
  habilitada: boolean;
}

// =====================================
// ESPECIALIDADES
// =====================================

export interface Specialty {
  idEspecialidad: string;
  nombre: string;
  habilitada: boolean;
}

// =====================================
// PROFESIONALES
// =====================================

export interface Professional {
  idProfesional: string;
  apellido: string;
  nombre: string;
  especialidadId: string;
  activo: boolean;
}

// =====================================
// TURNOS
// =====================================

export interface Appointment {
  idTurno: string;
  pacienteId: string;
  especialidadId: string;
  profesionalId: string;
  fechaTurno: string;
  horaTurno: string;
  confirmado: boolean;
  fechaConfirmacion: string | null;
  viaConfirmacion: ConfirmationChannel | null;
  comentarios: string;
  horaIngreso: string | null;
  horaEgreso: string | null;
  ausente: boolean;
}
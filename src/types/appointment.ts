export type ConfirmationChannel =
  | "sms"
  | "whatsapp"
  | "email";

export type AttendanceStatus =
  | "pendiente"
  | "ingreso"
  | "egreso"
  | "ausente";

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
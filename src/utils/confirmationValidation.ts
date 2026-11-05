import type { Appointment } from "../types";

const MIN_HOURS_BEFORE_APPOINTMENT = 48;
const MAX_HOURS_BEFORE_APPOINTMENT = 72;

export function canConfirmAppointment(
  appointment: Appointment
): boolean {
  if (appointment.confirmado || appointment.ausente) {
    return false;
  }

  const appointmentDate = new Date(
    `${appointment.fechaTurno}T${appointment.horaTurno}:00`
  );

  if (Number.isNaN(appointmentDate.getTime())) {
    return false;
  }

  const now = new Date();

  const hoursRemaining =
    (appointmentDate.getTime() - now.getTime()) /
    (1000 * 60 * 60);

  return (
    hoursRemaining >= MIN_HOURS_BEFORE_APPOINTMENT &&
    hoursRemaining <= MAX_HOURS_BEFORE_APPOINTMENT
  );
}

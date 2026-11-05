const MAX_APPOINTMENT_DAYS = 90;

function getLocalDateParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function getDateInUTC(date: Date): number {
  const parts = getLocalDateParts(date);

  return Date.UTC(parts.year, parts.month, parts.day);
}

export function validateAppointmentDate(
  selectedDate: string
): string | null {
  if (!selectedDate) {
    return "La fecha del turno es obligatoria.";
  }

  const parts = selectedDate.split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part))
  ) {
    return "La fecha ingresada no es válida.";
  }

  const [year, month, day] = parts;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "La fecha ingresada no es válida.";
  }

  const today = new Date();
  const selectedTimestamp = getDateInUTC(date);
  const todayTimestamp = getDateInUTC(today);

  const differenceInDays =
    (selectedTimestamp - todayTimestamp) / (1000 * 60 * 60 * 24);

  if (differenceInDays < 0) {
    return "No se pueden solicitar turnos para fechas anteriores a hoy.";
  }

  if (differenceInDays > MAX_APPOINTMENT_DAYS) {
    return "La fecha no puede superar los próximos 90 días.";
  }

  return null;
}
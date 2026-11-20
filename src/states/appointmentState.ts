import type { Appointment } from "../types";

// Datos del formulario antes de crear el turno.
export type AppointmentDraft = Omit<
  Appointment,
  | "idTurno"
  | "confirmado"
  | "fechaConfirmacion"
  | "viaConfirmacion"
  | "horaIngreso"
  | "horaEgreso"
  | "ausente"
>;

// Estados posibles del formulario.
export type AppointmentFormState =
  | {
      status: "draft";
      values: AppointmentDraft;
    }
  | {
      status: "processing";
      values: AppointmentDraft;
      requestId: string;
    }
  | {
      status: "success";
      appointmentId: string;
    }
  | {
      status: "error";
      values: AppointmentDraft;
      message: string;
      retryable: boolean;
    }
  | {
      status: "cancelled";
    };

// Eventos que pueden modificar el estado.
export type AppointmentFormEvent =
  | {
      type: "CHANGE";
      values: Partial<AppointmentDraft>;
    }
  | {
      type: "SUBMIT";
      requestId: string;
      isValid: boolean;
    }
  | {
      type: "RESOLVE";
      appointmentId: string;
    }
  | {
      type: "REJECT";
      message: string;
      retryable: boolean;
    }
  | {
      type: "RETRY";
      requestId: string;
    }
  | {
      type: "CANCEL";
    };

// Controla las transiciones válidas.
export function appointmentFormReducer(
  state: AppointmentFormState,
  event: AppointmentFormEvent
): AppointmentFormState {
  switch (event.type) {
    case "CHANGE":
      if (state.status !== "draft" && state.status !== "error") {
        return state;
      }

      return {
        status: "draft",
        values: {
          ...state.values,
          ...event.values,
        },
      };

    case "SUBMIT":
      if (state.status !== "draft" || !event.isValid) {
        return state;
      }

      return {
        status: "processing",
        values: state.values,
        requestId: event.requestId,
      };

    case "RESOLVE":
      if (state.status !== "processing") {
        return state;
      }

      return {
        status: "success",
        appointmentId: event.appointmentId,
      };

    case "REJECT":
      if (state.status !== "processing") {
        return state;
      }

      return {
        status: "error",
        values: state.values,
        message: event.message,
        retryable: event.retryable,
      };

    case "RETRY":
      if (state.status !== "error" || !state.retryable) {
        return state;
      }

      return {
        status: "processing",
        values: state.values,
        requestId: event.requestId,
      };

    case "CANCEL":
      if (state.status !== "draft" && state.status !== "error") {
        return state;
      }

      return {
        status: "cancelled",
      };

    default:
      return state;
  }
}

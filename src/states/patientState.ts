import type { Patient } from "../types";

export type PatientDraft = Omit<Patient, "id" | "activo">;

export type PatientFormState =
  | {
      status: "draft";
      values: PatientDraft;
      documentVerified: boolean;
    }
  | {
      status: "checking-document";
      values: PatientDraft;
      requestId: string;
    }
  | {
      status: "processing";
      values: PatientDraft;
      requestId: string;
    }
  | { status: "success"; patientId: string }
  | {
      status: "error";
      values: PatientDraft;
      stage: "lookup" | "duplicate" | "submit";
      message: string;
      retryable: boolean;
      documentVerified: boolean;
    }
  | { status: "cancelled" };

export type PatientFormEvent =
  | { type: "CHANGE"; values: Partial<PatientDraft> }
  | { type: "CHECK_DOCUMENT"; requestId: string; isValid: boolean }
  | { type: "DOCUMENT_AVAILABLE"; requestId: string }
  | { type: "DOCUMENT_TAKEN"; requestId: string }
  | { type: "LOOKUP_FAILED"; requestId: string; message: string }
  | { type: "SUBMIT"; requestId: string; isValid: boolean }
  | { type: "RESOLVE"; requestId: string; patientId: string }
  | {
      type: "REJECT";
      requestId: string;
      message: string;
      retryable: boolean;
    }
  | { type: "RETRY"; requestId: string }
  | { type: "CANCEL" }
  | { type: "RESET"; values: PatientDraft };

export function patientFormReducer(
  state: PatientFormState,
  event: PatientFormEvent,
): PatientFormState {
  switch (event.type) {
    case "CHANGE":
      if (state.status !== "draft" && state.status !== "error") return state;

      return {
        status: "draft",
        values: { ...state.values, ...event.values },
        documentVerified: false,
      };

    case "CHECK_DOCUMENT":
      if (state.status !== "draft" || !event.isValid) return state;

      return {
        status: "checking-document",
        values: state.values,
        requestId: event.requestId,
      };

    case "DOCUMENT_AVAILABLE":
      if (
        state.status !== "checking-document" ||
        state.requestId !== event.requestId
      )
        return state;

      return {
        status: "draft",
        values: state.values,
        documentVerified: true,
      };

    case "DOCUMENT_TAKEN":
      if (
        state.status !== "checking-document" ||
        state.requestId !== event.requestId
      )
        return state;

      return {
        status: "error",
        values: state.values,
        stage: "duplicate",
        message: "Ya existe un paciente registrado con ese documento.",
        retryable: false,
        documentVerified: false,
      };

    case "LOOKUP_FAILED":
      if (
        state.status !== "checking-document" ||
        state.requestId !== event.requestId
      )
        return state;

      return {
        status: "error",
        values: state.values,
        stage: "lookup",
        message: event.message,
        retryable: true,
        documentVerified: false,
      };

    case "SUBMIT":
      if (state.status !== "draft" || !state.documentVerified || !event.isValid)
        return state;

      return {
        status: "processing",
        values: state.values,
        requestId: event.requestId,
      };

    case "RESOLVE":
      if (state.status !== "processing" || state.requestId !== event.requestId)
        return state;

      return { status: "success", patientId: event.patientId };

    case "REJECT":
      if (state.status !== "processing" || state.requestId !== event.requestId)
        return state;

      return {
        status: "error",
        values: state.values,
        stage: "submit",
        message: event.message,
        retryable: event.retryable,
        documentVerified: true,
      };

    case "RETRY":
      if (state.status !== "error" || !state.retryable) return state;

      if (state.stage === "lookup") {
        return {
          status: "checking-document",
          values: state.values,
          requestId: event.requestId,
        };
      }

      if (state.stage === "submit") {
        return {
          status: "processing",
          values: state.values,
          requestId: event.requestId,
        };
      }

      return state;

    case "CANCEL":
      if (state.status !== "draft" && state.status !== "error") return state;
      return { status: "cancelled" };

    case "RESET":
      return {
        status: "draft",
        values: event.values,
        documentVerified: false,
      };

    default:
      return state;
  }
}

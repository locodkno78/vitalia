
import pacientesJson from "./pacientes.json";
import especialidadesJson from "./especialidades.json";
import profesionalesJson from "./profesionales.json";
import coberturasJson from "./coberturas.json";
import turnosJson from "./turnos.json";

import type {
  Patient,
  Specialty,
  Professional,
  Coverage,
  Appointment,
} from "../types";

export const patients = pacientesJson as Patient[];

export const specialties = especialidadesJson as Specialty[];

export const professionals = profesionalesJson as Professional[];

export const medicalCoverages = coberturasJson as Coverage[];

export const appointments = turnosJson as Appointment[];

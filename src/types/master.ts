import type { CoverageType } from "./patient";

export interface Specialty {
  idEspecialidad: string;
  nombre: string;
  habilitada: boolean;
}

export interface Professional {
  idProfesional: string;
  apellido: string;
  nombre: string;
  especialidadId: string;
  activo: boolean;
}

export interface Coverage {
  idCobertura: string;
  nombre: string;
  tipo: CoverageType;
  habilitada: boolean;
}
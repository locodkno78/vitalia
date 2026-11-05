
import { useState } from "react";
import { Plus, Pencil, Power } from "lucide-react";

import type {
  Specialty,
  Professional,
  Coverage,
} from "../types";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";

import "./MasterDataPage.css";

type MasterSection = "specialties" | "professionals" | "coverages";

interface MasterDataPageProps {
  specialties: Specialty[];
  professionals: Professional[];
  coverages: Coverage[];
  onSpecialtiesChange: (specialties: Specialty[]) => void;
  onProfessionalsChange: (professionals: Professional[]) => void;
  onCoveragesChange: (coverages: Coverage[]) => void;
}

function MasterDataPage({
  specialties,
  professionals,
  coverages,
  onSpecialtiesChange,
  onProfessionalsChange,
  onCoveragesChange,
}: MasterDataPageProps) {
  const [activeSection, setActiveSection] =
    useState<MasterSection>("specialties");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [specialtyName, setSpecialtyName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [professionalSurname, setProfessionalSurname] = useState("");
  const [professionalSpecialty, setProfessionalSpecialty] = useState("");
  const [coverageName, setCoverageName] = useState("");
  const [coverageType, setCoverageType] =
    useState<Coverage["tipo"]>("privada");

  const [message, setMessage] = useState("");

  function resetForm() {
    setEditingId(null);
    setSpecialtyName("");
    setProfessionalName("");
    setProfessionalSurname("");
    setProfessionalSpecialty("");
    setCoverageName("");
    setCoverageType("privada");
    setMessage("");
  }

  function handleSpecialtySubmit() {
    const name = specialtyName.trim();

    if (!name) {
      setMessage("Ingresá el nombre de la especialidad.");
      return;
    }

    const duplicated = specialties.some(
      (specialty) =>
        specialty.nombre.toLowerCase() === name.toLowerCase() &&
        specialty.idEspecialidad !== editingId
    );

    if (duplicated) {
      setMessage("Ya existe una especialidad con ese nombre.");
      return;
    }

    if (editingId) {
      onSpecialtiesChange(
        specialties.map((specialty) =>
          specialty.idEspecialidad === editingId
            ? { ...specialty, nombre: name }
            : specialty
        )
      );
    } else {
      onSpecialtiesChange([
        ...specialties,
        {
          idEspecialidad: `esp-${Date.now()}`,
          nombre: name,
          habilitada: true,
        },
      ]);
    }

    resetForm();
  }

  function handleProfessionalSubmit() {
    const name = professionalName.trim();
    const surname = professionalSurname.trim();

    if (!name || !surname || !professionalSpecialty) {
      setMessage("Completá todos los campos del profesional.");
      return;
    }

    if (editingId) {
      onProfessionalsChange(
        professionals.map((professional) =>
          professional.idProfesional === editingId
            ? {
                ...professional,
                nombre: name,
                apellido: surname,
                especialidadId: professionalSpecialty,
              }
            : professional
        )
      );
    } else {
      onProfessionalsChange([
        ...professionals,
        {
          idProfesional: `prof-${Date.now()}`,
          nombre: name,
          apellido: surname,
          especialidadId: professionalSpecialty,
          activo: true,
        },
      ]);
    }

    resetForm();
  }

  function handleCoverageSubmit() {
    const name = coverageName.trim();

    if (!name) {
      setMessage("Ingresá el nombre de la cobertura.");
      return;
    }

    const duplicated = coverages.some(
      (coverage) =>
        coverage.nombre.toLowerCase() === name.toLowerCase() &&
        coverage.idCobertura !== editingId
    );

    if (duplicated) {
      setMessage("Ya existe una cobertura con ese nombre.");
      return;
    }

    if (editingId) {
      onCoveragesChange(
        coverages.map((coverage) =>
          coverage.idCobertura === editingId
            ? { ...coverage, nombre: name, tipo: coverageType }
            : coverage
        )
      );
    } else {
      onCoveragesChange([
        ...coverages,
        {
          idCobertura: `cov-${Date.now()}`,
          nombre: name,
          tipo: coverageType,
          habilitada: true,
        },
      ]);
    }

    resetForm();
  }

  function editSpecialty(specialty: Specialty) {
    setEditingId(specialty.idEspecialidad);
    setSpecialtyName(specialty.nombre);
    setMessage("");
  }

  function editProfessional(professional: Professional) {
    setEditingId(professional.idProfesional);
    setProfessionalName(professional.nombre);
    setProfessionalSurname(professional.apellido);
    setProfessionalSpecialty(professional.especialidadId);
    setMessage("");
  }

  function editCoverage(coverage: Coverage) {
    setEditingId(coverage.idCobertura);
    setCoverageName(coverage.nombre);
    setCoverageType(coverage.tipo);
    setMessage("");
  }

  function toggleSpecialty(id: string) {
    onSpecialtiesChange(
      specialties.map((specialty) =>
        specialty.idEspecialidad === id
          ? { ...specialty, habilitada: !specialty.habilitada }
          : specialty
      )
    );
  }

  function toggleProfessional(id: string) {
    onProfessionalsChange(
      professionals.map((professional) =>
        professional.idProfesional === id
          ? { ...professional, activo: !professional.activo }
          : professional
      )
    );
  }

  function toggleCoverage(id: string) {
    onCoveragesChange(
      coverages.map((coverage) =>
        coverage.idCobertura === id
          ? { ...coverage, habilitada: !coverage.habilitada }
          : coverage
      )
    );
  }

  const specialtyOptions = specialties
    .filter((specialty) => specialty.habilitada)
    .map((specialty) => ({
      value: specialty.idEspecialidad,
      label: specialty.nombre,
    }));

  return (
    <main className="master-page">
      <header className="master-page__header">
        <div>
          <span className="master-page__eyebrow">CONFIGURACIÓN</span>
          <h1>Datos maestros</h1>
          <p>Administrá especialidades, profesionales y coberturas.</p>
        </div>
      </header>

      <div className="master-tabs" role="tablist" aria-label="Datos maestros">
        <button
          type="button"
          className={activeSection === "specialties" ? "active" : ""}
          onClick={() => {
            setActiveSection("specialties");
            resetForm();
          }}
        >
          Especialidades
        </button>

        <button
          type="button"
          className={activeSection === "professionals" ? "active" : ""}
          onClick={() => {
            setActiveSection("professionals");
            resetForm();
          }}
        >
          Profesionales
        </button>

        <button
          type="button"
          className={activeSection === "coverages" ? "active" : ""}
          onClick={() => {
            setActiveSection("coverages");
            resetForm();
          }}
        >
          Coberturas
        </button>
      </div>

      <Card padding="lg">
        {activeSection === "specialties" && (
          <section>
            <div className="master-section__header">
              <h2>Especialidades</h2>
              <p>Gestioná las especialidades médicas disponibles.</p>
            </div>

            <form
              className="master-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleSpecialtySubmit();
              }}
            >
              <Input
                label="Nombre de la especialidad"
                value={specialtyName}
                onChange={(event) => setSpecialtyName(event.target.value)}
                placeholder="Ej. Neurología"
              />

              <div className="master-form__actions">
                <Button type="submit">
                  {editingId ? "Guardar cambios" : <><Plus size={17} /> Agregar especialidad</>}
                </Button>

                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            {message && <p className="master-message" role="alert">{message}</p>}

            <div className="master-list">
              {specialties.map((specialty) => (
                <article className="master-item" key={specialty.idEspecialidad}>
                  <div>
                    <strong>{specialty.nombre}</strong>
                    <StatusBadge status={specialty.habilitada ? "success" : "danger"}>
                      {specialty.habilitada ? "Habilitada" : "Deshabilitada"}
                    </StatusBadge>
                  </div>

                  <div className="master-item__actions">
                    <Button type="button" variant="outline" size="sm" onClick={() => editSpecialty(specialty)}>
                      <Pencil size={15} /> Editar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleSpecialty(specialty.idEspecialidad)}>
                      <Power size={15} />
                      {specialty.habilitada ? "Deshabilitar" : "Habilitar"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "professionals" && (
          <section>
            <div className="master-section__header">
              <h2>Profesionales</h2>
              <p>Administrá los profesionales y sus especialidades.</p>
            </div>

            <form
              className="master-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleProfessionalSubmit();
              }}
            >
              <Input
                label="Nombre"
                value={professionalName}
                onChange={(event) => setProfessionalName(event.target.value)}
                placeholder="Nombre"
              />

              <Input
                label="Apellido"
                value={professionalSurname}
                onChange={(event) => setProfessionalSurname(event.target.value)}
                placeholder="Apellido"
              />

              <Select
                label="Especialidad"
                value={professionalSpecialty}
                onChange={(event) => setProfessionalSpecialty(event.target.value)}
                options={[
                  { value: "", label: "Seleccioná una especialidad" },
                  ...specialtyOptions,
                ]}
              />

              <div className="master-form__actions">
                <Button type="submit">
                  {editingId ? "Guardar cambios" : <><Plus size={17} /> Agregar profesional</>}
                </Button>

                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            {message && <p className="master-message" role="alert">{message}</p>}

            <div className="master-list">
              {professionals.map((professional) => {
                const specialty = specialties.find(
                  (item) => item.idEspecialidad === professional.especialidadId
                );

                return (
                  <article className="master-item" key={professional.idProfesional}>
                    <div>
                      <strong>{professional.nombre} {professional.apellido}</strong>
                      <span>{specialty?.nombre ?? "Especialidad no disponible"}</span>
                      <StatusBadge status={professional.activo ? "success" : "danger"}>
                        {professional.activo ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </div>

                    <div className="master-item__actions">
                      <Button type="button" variant="outline" size="sm" onClick={() => editProfessional(professional)}>
                        <Pencil size={15} /> Editar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => toggleProfessional(professional.idProfesional)}>
                        <Power size={15} />
                        {professional.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeSection === "coverages" && (
          <section>
            <div className="master-section__header">
              <h2>Coberturas</h2>
              <p>Administrá las coberturas médicas disponibles.</p>
            </div>

            <form
              className="master-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleCoverageSubmit();
              }}
            >
              <Input
                label="Nombre de la cobertura"
                value={coverageName}
                onChange={(event) => setCoverageName(event.target.value)}
                placeholder="Ej. Plan de salud"
              />

              <Select
                label="Tipo de cobertura"
                value={coverageType}
                onChange={(event) => setCoverageType(event.target.value as Coverage["tipo"])}
                options={[
                  { value: "publica", label: "Pública" },
                  { value: "privada", label: "Privada" },
                  { value: "particular", label: "Particular" },
                ]}
              />

              <div className="master-form__actions">
                <Button type="submit">
                  {editingId ? "Guardar cambios" : <><Plus size={17} /> Agregar cobertura</>}
                </Button>

                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            {message && <p className="master-message" role="alert">{message}</p>}

            <div className="master-list">
              {coverages.map((coverage) => (
                <article className="master-item" key={coverage.idCobertura}>
                  <div>
                    <strong>{coverage.nombre}</strong>
                    <span>
                      {coverage.tipo === "publica"
                        ? "Pública"
                        : coverage.tipo === "privada"
                          ? "Privada"
                          : "Particular"}
                    </span>
                    <StatusBadge status={coverage.habilitada ? "success" : "danger"}>
                      {coverage.habilitada ? "Habilitada" : "Deshabilitada"}
                    </StatusBadge>
                  </div>

                  <div className="master-item__actions">
                    <Button type="button" variant="outline" size="sm" onClick={() => editCoverage(coverage)}>
                      <Pencil size={15} /> Editar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleCoverage(coverage.idCobertura)}>
                      <Power size={15} />
                      {coverage.habilitada ? "Deshabilitar" : "Habilitar"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </Card>
    </main>
  );
}

export default MasterDataPage;

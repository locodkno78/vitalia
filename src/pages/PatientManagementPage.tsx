import { useMemo, useState, type ChangeEvent } from "react";
import { Pencil, Power, Search, UserPlus } from "lucide-react";

import type { Patient, DocumentType, Coverage } from "../types";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";

import "./PatientManagementPage.css";

interface PatientManagementPageProps {
  patients: Patient[];
  coverages: Coverage[];
  onPatientsChange: (patients: Patient[]) => void;
}

function getDefaultCoverageId(coverages: Coverage[]): string {
  const particularCoverage = coverages.find(
    (coverage) =>
      coverage.tipo === "particular" && coverage.habilitada
  );

  const firstEnabledCoverage = coverages.find(
    (coverage) => coverage.habilitada
  );

  return (
    particularCoverage?.idCobertura ??
    firstEnabledCoverage?.idCobertura ??
    ""
  );
}

function getCoverageName(
  coverageId: string,
  coverages: Coverage[]
): string {
  const coverage = coverages.find(
    (item) => item.idCobertura === coverageId
  );

  if (!coverage) return "Cobertura no disponible";

  return coverage.habilitada
    ? coverage.nombre
    : `${coverage.nombre} (Deshabilitada)`;
}

function PatientManagementPage({
  patients,
  coverages,
  onPatientsChange,
}: PatientManagementPageProps) {
  const [searchDocument, setSearchDocument] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Patient, "id">>(() => ({
    apellido: "",
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    coberturaId: getDefaultCoverageId(coverages),
    activo: true,
  }));
  const [error, setError] = useState("");

  const filteredPatients = useMemo(() => {
    const search = searchDocument.trim().toLowerCase();

    return patients.filter((patient) =>
      patient.numeroDocumento.toLowerCase().includes(search)
    );
  }, [patients, searchDocument]);

  // Las coberturas deshabilitadas no se ofrecen para pacientes nuevos.
  // Al editar, se conserva la cobertura actual aunque esté deshabilitada.
  const coverageOptions = useMemo(() => {
    return coverages
      .filter(
        (coverage) =>
          coverage.habilitada ||
          coverage.idCobertura === formData.coberturaId
      )
      .map((coverage) => ({
        value: coverage.idCobertura,
        label: coverage.habilitada
          ? coverage.nombre
          : `${coverage.nombre} (Deshabilitada)`,
      }));
  }, [coverages, formData.coberturaId]);

  const documentOptions = [
    { value: "DNI", label: "DNI" },
    { value: "RUT", label: "RUT" },
    { value: "CURP", label: "CURP" },
    { value: "OTRO", label: "Otro" },
  ];

  function openNewPatient() {
    setEditingId(null);
    setFormData({
      apellido: "",
      nombre: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      fechaNacimiento: "",
      telefono: "",
      email: "",
      coberturaId: getDefaultCoverageId(coverages),
      activo: true,
    });
    setError("");
    setShowModal(true);
  }

  function openEditPatient(patient: Patient) {
    const { id, ...data } = patient;

    setEditingId(id);
    setFormData(data);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setError("");
  }

  function updateField(
    field: keyof Omit<Patient, "id">,
    value: string | boolean
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSave() {
    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.numeroDocumento.trim() ||
      !formData.fechaNacimiento ||
      !formData.telefono.trim()
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (!formData.coberturaId) {
      setError("Seleccioná una cobertura médica.");
      return;
    }

    const selectedCoverage = coverages.find(
      (coverage) => coverage.idCobertura === formData.coberturaId
    );

    if (!selectedCoverage) {
      setError("La cobertura seleccionada ya no está disponible.");
      return;
    }

    if (!editingId && !selectedCoverage.habilitada) {
      setError("No podés asignar una cobertura deshabilitada.");
      return;
    }

    const duplicatedDocument = patients.some(
      (patient) =>
        patient.numeroDocumento.toLowerCase() ===
          formData.numeroDocumento.trim().toLowerCase() &&
        patient.id !== editingId
    );

    if (duplicatedDocument) {
      setError("Ya existe un paciente con ese documento.");
      return;
    }

    if (editingId) {
      const updatedPatients = patients.map((patient) =>
        patient.id === editingId
          ? { ...formData, id: editingId }
          : patient
      );

      onPatientsChange(updatedPatients);
    } else {
      const newPatient: Patient = {
        ...formData,
        id: `pac-${Date.now()}`,
      };

      onPatientsChange([...patients, newPatient]);
    }

    closeModal();
  }

  function togglePatientStatus(patientId: string) {
    const updatedPatients = patients.map((patient) =>
      patient.id === patientId
        ? { ...patient, activo: !patient.activo }
        : patient
    );

    onPatientsChange(updatedPatients);
  }

  return (
    <main className="patient-page">
      <header className="patient-page__header">
        <div>
          <span className="patient-page__eyebrow">
            GESTIÓN DE PACIENTES
          </span>
          <h1>Pacientes</h1>
          <p>Administrá los datos de los pacientes registrados.</p>
        </div>

        <Button onClick={openNewPatient}>
          <UserPlus size={18} />
          Nuevo paciente
        </Button>
      </header>

      <Card padding="lg">
        <div className="patient-search">
          <Input
            label="Buscar por documento"
            placeholder="Ingresá el número de documento"
            value={searchDocument}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearchDocument(event.target.value)
            }
          />
          <Search size={20} aria-hidden="true" />
        </div>

        <div className="patient-results">
          {filteredPatients.length} pacientes encontrados
        </div>

        {filteredPatients.length === 0 ? (
          <div className="patient-empty">
            <h2>No encontramos pacientes</h2>
            <p>Probá con otro documento o registrá un paciente nuevo.</p>
          </div>
        ) : (
          <>
            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Cobertura</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        {patient.nombre} {patient.apellido}
                      </td>
                      <td>
                        {patient.tipoDocumento} {patient.numeroDocumento}
                      </td>
                      <td>{patient.telefono}</td>
                      <td>
                        {getCoverageName(patient.coberturaId, coverages)}
                      </td>
                      <td>
                        <StatusBadge
                          status={patient.activo ? "success" : "neutral"}
                        >
                          {patient.activo ? "Activo" : "Inactivo"}
                        </StatusBadge>
                      </td>
                      <td>
                        <div className="patient-actions">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditPatient(patient)}
                          >
                            <Pencil size={15} />
                            Editar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePatientStatus(patient.id)}
                          >
                            <Power size={15} />
                            {patient.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="patient-mobile-list">
              {filteredPatients.map((patient) => (
                <article className="patient-mobile-card" key={patient.id}>
                  <div className="patient-mobile-card__header">
                    <h2>
                      {patient.nombre} {patient.apellido}
                    </h2>
                    <StatusBadge
                      status={patient.activo ? "success" : "neutral"}
                    >
                      {patient.activo ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </div>

                  <p>
                    <strong>Documento:</strong> {patient.tipoDocumento}{" "}
                    {patient.numeroDocumento}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {patient.telefono}
                  </p>
                  <p>
                    <strong>Cobertura:</strong>{" "}
                    {getCoverageName(patient.coberturaId, coverages)}
                  </p>

                  <div className="patient-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditPatient(patient)}
                    >
                      <Pencil size={15} />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePatientStatus(patient.id)}
                    >
                      <Power size={15} />
                      {patient.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={showModal}
        title={editingId ? "Editar paciente" : "Nuevo paciente"}
        onClose={closeModal}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Guardar cambios" : "Registrar paciente"}
            </Button>
          </>
        }
      >
        <div className="patient-form">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(event) => updateField("nombre", event.target.value)}
            required
          />

          <Input
            label="Apellido"
            value={formData.apellido}
            onChange={(event) => updateField("apellido", event.target.value)}
            required
          />

          <Select
            label="Tipo de documento"
            value={formData.tipoDocumento}
            onChange={(event) =>
              updateField("tipoDocumento", event.target.value as DocumentType)
            }
            options={documentOptions}
          />

          <Input
            label="Número de documento"
            value={formData.numeroDocumento}
            onChange={(event) =>
              updateField("numeroDocumento", event.target.value)
            }
            required
          />

          <Input
            label="Fecha de nacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={(event) =>
              updateField("fechaNacimiento", event.target.value)
            }
            required
          />

          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(event) => updateField("telefono", event.target.value)}
            required
          />

          <Input
            label="Email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <Select
            label="Cobertura médica"
            value={formData.coberturaId}
            onChange={(event) =>
              updateField("coberturaId", event.target.value)
            }
            options={coverageOptions}
          />

          {error && (
            <p className="patient-form__error" role="alert">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </main>
  );
}

export default PatientManagementPage;

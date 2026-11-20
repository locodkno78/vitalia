import {
  useMemo,
  useState,
  useReducer,
  useRef,
  useEffect,
  type ChangeEvent,
} from "react";

import { Pencil, Power, Search, UserPlus } from "lucide-react";

import type { Patient, DocumentType, Coverage } from "../types";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";

import {
  patientFormReducer,
  type PatientDraft,
} from "../states/patientState";

import { findPatientByDocument } from "../services/patientService";

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

function createEmptyPatient(
  coverages: Coverage[]
): PatientDraft {
  return {
    apellido: "",
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    coberturaId: getDefaultCoverageId(coverages),
  };
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
    ...createEmptyPatient(coverages),
    activo: true,
  }));

  const [error, setError] = useState("");

  const [patientForm, dispatchPatientForm] = useReducer(
    patientFormReducer,
    coverages,
    (initialCoverages) => ({
      status: "draft" as const,
      values: createEmptyPatient(initialCoverages),
      documentVerified: false,
    })
  );

  const requestCounter = useRef(0);
  const isSubmittingRef = useRef(false);
  const feedbackRef = useRef<HTMLParagraphElement | HTMLDivElement>(null);

  const filteredPatients = useMemo(() => {
    const search = searchDocument.trim().toLowerCase();

    return patients.filter((patient) =>
      patient.numeroDocumento.toLowerCase().includes(search)
    );
  }, [patients, searchDocument]);

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

  const isCheckingDocument =
    patientForm.status === "checking-document";

  const isProcessing =
    patientForm.status === "processing";

  const isSuccess =
    patientForm.status === "success";

  const canRetryLookup =
    patientForm.status === "error" &&
    patientForm.stage === "lookup" &&
    patientForm.retryable;

  const canRetrySubmit =
    patientForm.status === "error" &&
    patientForm.stage === "submit" &&
    patientForm.retryable;

  const feedbackMessage =
    error ||
    (patientForm.status === "error"
      ? patientForm.message
      : "");

  // Lleva el foco al mensaje cuando aparece un error o un éxito.
  useEffect(() => {
    if (
      showModal &&
      (feedbackMessage ||
        patientForm.status === "error" ||
        isSuccess)
    ) {
      feedbackRef.current?.focus();
    }
  }, [
    showModal,
    feedbackMessage,
    patientForm.status,
    isSuccess,
  ]);

  function openNewPatient() {
    const emptyPatient = createEmptyPatient(coverages);

    setEditingId(null);

    setFormData({
      ...emptyPatient,
      activo: true,
    });

    setError("");
    isSubmittingRef.current = false;

    dispatchPatientForm({
      type: "RESET",
      values: emptyPatient,
    });

    setShowModal(true);
  }

  function openEditPatient(patient: Patient) {
    const { id, ...data } = patient;

    setEditingId(id);
    setFormData(data);
    setError("");
    isSubmittingRef.current = false;

    dispatchPatientForm({
      type: "RESET",
      values: createEmptyPatient(coverages),
    });

    setShowModal(true);
  }

  function closeModal() {
    if (isProcessing) return;

    setShowModal(false);
    setEditingId(null);
    setError("");
    isSubmittingRef.current = false;

    dispatchPatientForm({
      type: "RESET",
      values: createEmptyPatient(coverages),
    });
  }

  function updateField(
    field: keyof Omit<Patient, "id">,
    value: string | boolean
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (field !== "activo" && !editingId) {
      dispatchPatientForm({
        type: "CHANGE",
        values: {
          [field]: value,
        } as Partial<PatientDraft>,
      });
    }

    setError("");
  }

  function validateForm(): string {
    if (!formData.nombre.trim()) {
      return "Ingresá el nombre del paciente.";
    }

    if (!/^[\p{L}\s'-]{2,60}$/u.test(formData.nombre.trim())) {
      return "El nombre debe tener entre 2 y 60 caracteres válidos.";
    }

    if (!formData.apellido.trim()) {
      return "Ingresá el apellido del paciente.";
    }

    if (!/^[\p{L}\s'-]{2,60}$/u.test(formData.apellido.trim())) {
      return "El apellido debe tener entre 2 y 60 caracteres válidos.";
    }

    if (!formData.numeroDocumento.trim()) {
      return "Ingresá el número de documento.";
    }

    if (!/^[a-zA-Z0-9.-]{4,20}$/.test(formData.numeroDocumento.trim())) {
      return "El documento debe tener entre 4 y 20 caracteres válidos.";
    }

    if (!formData.fechaNacimiento) {
      return "Ingresá la fecha de nacimiento.";
    }

    const birthDate = new Date(
      `${formData.fechaNacimiento}T00:00:00`
    );

    if (Number.isNaN(birthDate.getTime())) {
      return "Ingresá una fecha de nacimiento válida.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      return "La fecha de nacimiento no puede ser futura.";
    }

    if (!formData.telefono.trim()) {
      return "Ingresá un teléfono de contacto.";
    }

    if (!/^[0-9+\s()-]{7,20}$/.test(formData.telefono.trim())) {
      return "Ingresá un teléfono válido.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())
    ) {
      return "Ingresá un correo electrónico válido.";
    }

    if (!formData.coberturaId) {
      return "Seleccioná una cobertura médica.";
    }

    const selectedCoverage = coverages.find(
      (coverage) =>
        coverage.idCobertura === formData.coberturaId
    );

    if (!selectedCoverage) {
      return "La cobertura seleccionada ya no está disponible.";
    }

    if (!editingId && !selectedCoverage.habilitada) {
      return "No podés asignar una cobertura deshabilitada.";
    }

    return "";
  }

  async function handleCheckDocument() {
    if (isCheckingDocument || isProcessing) return;

    const tipoDocumento = formData.tipoDocumento;
    const numeroDocumento = formData.numeroDocumento.trim();

    if (!numeroDocumento) {
      setError("Ingresá un número de documento.");
      return;
    }

    if (!/^[a-zA-Z0-9.-]{4,20}$/.test(numeroDocumento)) {
      setError("El documento debe tener entre 4 y 20 caracteres válidos.");
      return;
    }

    setError("");

    const requestId = String(++requestCounter.current);

    if (canRetryLookup) {
      dispatchPatientForm({
        type: "RETRY",
        requestId,
      });
    } else {
      dispatchPatientForm({
        type: "CHECK_DOCUMENT",
        requestId,
        isValid: true,
      });
    }

    try {
      const existingPatient = await findPatientByDocument(
        patients,
        {
          tipoDocumento,
          numeroDocumento,
        }
      );

      if (existingPatient) {
        dispatchPatientForm({
          type: "DOCUMENT_TAKEN",
          requestId,
        });
      } else {
        dispatchPatientForm({
          type: "DOCUMENT_AVAILABLE",
          requestId,
        });
      }
    } catch {
      dispatchPatientForm({
        type: "LOOKUP_FAILED",
        requestId,
        message:
          "No pudimos verificar el documento. Intentá nuevamente.",
      });
    }
  }

  async function handleSave() {
    if (isSubmittingRef.current) return;

    if (isProcessing || isSuccess) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const normalizedDocument =
      formData.numeroDocumento.trim().toUpperCase();

    const duplicatedDocument = patients.some(
      (patient) =>
        patient.tipoDocumento === formData.tipoDocumento &&
        patient.numeroDocumento.trim().toUpperCase() ===
          normalizedDocument &&
        patient.id !== editingId
    );

    if (duplicatedDocument) {
      setError("Ya existe un paciente con ese documento.");
      return;
    }

    // La edición conserva su funcionamiento anterior.
    if (editingId) {
      const updatedPatients = patients.map((patient) =>
        patient.id === editingId
          ? { ...formData, id: editingId }
          : patient
      );

      onPatientsChange(updatedPatients);
      closeModal();
      return;
    }

    const isDraft = patientForm.status === "draft";

    const sameDocument =
      isDraft &&
      patientForm.values.tipoDocumento === formData.tipoDocumento &&
      patientForm.values.numeroDocumento.trim().toUpperCase() ===
        normalizedDocument;

    const isRetryingSubmit = canRetrySubmit;

    if (
      !isRetryingSubmit &&
      (!isDraft || !patientForm.documentVerified || !sameDocument)
    ) {
      setError(
        "Verificá el documento antes de registrar al paciente."
      );
      return;
    }

    isSubmittingRef.current = true;

    const requestId = String(++requestCounter.current);

    if (isRetryingSubmit) {
      dispatchPatientForm({
        type: "RETRY",
        requestId,
      });
    } else {
      dispatchPatientForm({
        type: "SUBMIT",
        requestId,
        isValid: true,
      });
    }

    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });

      const newPatient: Patient = {
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        numeroDocumento: normalizedDocument,
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        id: `pac-${Date.now()}`,
        activo: true,
      };

      onPatientsChange([...patients, newPatient]);

      dispatchPatientForm({
        type: "RESOLVE",
        requestId,
        patientId: newPatient.id,
      });
    } catch {
      dispatchPatientForm({
        type: "REJECT",
        requestId,
        message:
          "No se pudo registrar el paciente. Podés intentar nuevamente.",
        retryable: true,
      });

      setError(
        "No se pudo registrar el paciente. Podés intentar nuevamente."
      );
    } finally {
      isSubmittingRef.current = false;
    }
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

          <p>
            Administrá los datos de los pacientes registrados.
          </p>
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

        <div className="patient-results" aria-live="polite">
          {filteredPatients.length} pacientes encontrados
        </div>

        {filteredPatients.length === 0 ? (
          <div className="patient-empty">
            <h2>No encontramos pacientes</h2>
            <p>
              Probá con otro documento o registrá un paciente nuevo.
            </p>
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
                        {patient.tipoDocumento}{" "}
                        {patient.numeroDocumento}
                      </td>

                      <td>{patient.telefono}</td>

                      <td>
                        {getCoverageName(
                          patient.coberturaId,
                          coverages
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            patient.activo ? "success" : "neutral"
                          }
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
                            onClick={() =>
                              togglePatientStatus(patient.id)
                            }
                          >
                            <Power size={15} />
                            {patient.activo
                              ? "Desactivar"
                              : "Activar"}
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
                <article
                  className="patient-mobile-card"
                  key={patient.id}
                >
                  <div className="patient-mobile-card__header">
                    <h2>
                      {patient.nombre} {patient.apellido}
                    </h2>

                    <StatusBadge
                      status={
                        patient.activo ? "success" : "neutral"
                      }
                    >
                      {patient.activo ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </div>

                  <p>
                    <strong>Documento:</strong>{" "}
                    {patient.tipoDocumento}{" "}
                    {patient.numeroDocumento}
                  </p>

                  <p>
                    <strong>Teléfono:</strong> {patient.telefono}
                  </p>

                  <p>
                    <strong>Cobertura:</strong>{" "}
                    {getCoverageName(
                      patient.coberturaId,
                      coverages
                    )}
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
                      onClick={() =>
                        togglePatientStatus(patient.id)
                      }
                    >
                      <Power size={15} />
                      {patient.activo
                        ? "Desactivar"
                        : "Activar"}
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
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isProcessing}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              disabled={
                isProcessing ||
                isSuccess ||
                (!editingId &&
                  !canRetrySubmit &&
                  (patientForm.status !== "draft" ||
                    !patientForm.documentVerified))
              }
            >
              {isProcessing
                ? "Registrando..."
                : isSuccess
                  ? "Registrado"
                  : editingId
                    ? "Guardar cambios"
                    : canRetrySubmit
                      ? "Reintentar registro"
                      : "Registrar paciente"}
            </Button>
          </>
        }
      >
        <div
          className="patient-form"
          aria-busy={isProcessing || isCheckingDocument}
        >
          {isSuccess ? (
            <div
              ref={feedbackRef}
              role="status"
              aria-live="polite"
              tabIndex={-1}
            >
              <h3>Paciente registrado correctamente.</h3>
              <p>
                El paciente ya se encuentra disponible en el listado.
              </p>
            </div>
          ) : (
            <>
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(event) =>
                  updateField("nombre", event.target.value)
                }
                required
                disabled={isProcessing}
              />

              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(event) =>
                  updateField("apellido", event.target.value)
                }
                required
                disabled={isProcessing}
              />

              <Select
                label="Tipo de documento"
                value={formData.tipoDocumento}
                onChange={(event) =>
                  updateField(
                    "tipoDocumento",
                    event.target.value as DocumentType
                  )
                }
                options={documentOptions}
                disabled={
                  isProcessing ||
                  (!editingId && isCheckingDocument)
                }
              />

              <Input
                label="Número de documento"
                value={formData.numeroDocumento}
                onChange={(event) =>
                  updateField(
                    "numeroDocumento",
                    event.target.value
                  )
                }
                required
                disabled={
                  isProcessing ||
                  (!editingId && isCheckingDocument)
                }
              />

              {!editingId && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCheckDocument}
                    disabled={
                      isCheckingDocument ||
                      isProcessing ||
                      (patientForm.status === "error" &&
                        patientForm.stage === "duplicate")
                    }
                  >
                    {isCheckingDocument
                      ? "Verificando..."
                      : canRetryLookup
                        ? "Reintentar verificación"
                        : "Verificar documento"}
                  </Button>

                  <p role="status" aria-live="polite">
                    {isCheckingDocument &&
                      "Consultando si el documento ya está registrado..."}

                    {patientForm.status === "draft" &&
                      patientForm.documentVerified &&
                      "Documento disponible. Podés continuar con el registro."}
                  </p>
                </>
              )}

              <Input
                label="Fecha de nacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(event) =>
                  updateField(
                    "fechaNacimiento",
                    event.target.value
                  )
                }
                required
                disabled={isProcessing}
              />

              <Input
                label="Teléfono"
                value={formData.telefono}
                onChange={(event) =>
                  updateField("telefono", event.target.value)
                }
                required
                disabled={isProcessing}
              />

              <Input
                label="Email"
                value={formData.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                disabled={isProcessing}
              />

              <Select
                label="Cobertura médica"
                value={formData.coberturaId}
                onChange={(event) =>
                  updateField("coberturaId", event.target.value)
                }
                options={coverageOptions}
                disabled={isProcessing}
              />

              {feedbackMessage && (
                <p
                  ref={feedbackRef}
                  className="patient-form__error"
                  role="alert"
                  tabIndex={-1}
                >
                  {feedbackMessage}
                </p>
              )}

              {isProcessing && (
                <p role="status" aria-live="polite">
                  Registrando paciente. Esperá un momento...
                </p>
              )}
            </>
          )}
        </div>
      </Modal>
    </main>
  );
}

export default PatientManagementPage;

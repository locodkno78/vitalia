
import { useState } from "react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import StatusBadge from "../components/common/StatusBadge";

import "./ComponentCatalogPage.css";

function ComponentCatalogPage() {
  const [inputValue, setInputValue] = useState("");
  const [showInputError, setShowInputError] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectOptions = [
    { value: "personal", label: "Personal" },
    { value: "trabajo", label: "Trabajo" },
    { value: "salud", label: "Salud" },
    { value: "estudios", label: "Estudios" },
    { value: "disabled", label: "Opción deshabilitada", disabled: true },
  ];

  return (
    <div className="catalog-page">
      <header className="catalog-page__header">
        <div>
          <span className="catalog-page__eyebrow">
            VITALIA · SISTEMA DE DISEÑO
          </span>

          <h1>Catálogo de componentes</h1>

          <p>
            Biblioteca de componentes reutilizables de Vitalia Salud
            Comunitaria. Explorá sus variantes, propiedades y estados.
          </p>
        </div>

        <span className="catalog-page__counter">
          6 componentes
        </span>
      </header>

      <div className="catalog-grid">
        {/* BUTTON */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">01</span>
              <h2>Button</h2>
            </div>

            <span className="catalog-card__type">Acciones</span>
          </div>

          <p className="catalog-card__description">
            Permite ejecutar acciones dentro de la aplicación. Incluye
            variantes visuales, tamaños y estado de carga.
          </p>

          <div className="catalog-demo">
            <h3>Variantes</h3>

            <div className="catalog-demo__row">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div className="catalog-demo">
            <h3>Tamaños</h3>

            <div className="catalog-demo__row">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="catalog-demo">
            <h3>Estados</h3>

            <div className="catalog-demo__row">
              <Button disabled>Deshabilitado</Button>
              <Button loading>Procesando</Button>
            </div>
          </div>
        </Card>

        {/* CARD */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">02</span>
              <h2>Card</h2>
            </div>

            <span className="catalog-card__type">Contenedores</span>
          </div>

          <p className="catalog-card__description">
            Agrupa información relacionada y permite organizar visualmente
            el contenido de las pantallas.
          </p>

          <div className="catalog-demo">
            <h3>Variantes</h3>

            <div className="catalog-card-examples">
              <Card variant="default" padding="md">
                <strong>Default</strong>
                <p>Tarjeta con estilo predeterminado.</p>
              </Card>

              <Card variant="outlined" padding="md">
                <strong>Outlined</strong>
                <p>Tarjeta con borde visible.</p>
              </Card>

              <Card variant="elevated" padding="md">
                <strong>Elevated</strong>
                <p>Tarjeta con efecto de elevación.</p>
              </Card>
            </div>
          </div>

          <div className="catalog-demo">
            <h3>Espaciado interno</h3>

            <div className="catalog-demo__row">
              <Card variant="outlined" padding="sm">
                <strong>Small</strong>
              </Card>

              <Card variant="outlined" padding="md">
                <strong>Medium</strong>
              </Card>

              <Card variant="outlined" padding="lg">
                <strong>Large</strong>
              </Card>
            </div>
          </div>
        </Card>

        {/* INPUT */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">03</span>
              <h2>Input</h2>
            </div>

            <span className="catalog-card__type">Formularios</span>
          </div>

          <p className="catalog-card__description">
            Campo de entrada reutilizable con etiqueta, texto de ayuda y
            mensajes de validación.
          </p>

          <div className="catalog-demo catalog-demo--vertical">
            <h3>Campo interactivo</h3>

            <Input
              label="Nombre del paciente"
              placeholder="Ingresá un nombre"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setShowInputError(false);
              }}
              hint="Este campo permite ingresar texto."
              error={
                showInputError
                  ? "El nombre del paciente es obligatorio."
                  : undefined
              }
              required
            />

            <div className="catalog-demo__row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInputError(true)}
              >
                Probar error
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInputValue("");
                  setShowInputError(false);
                }}
              >
                Limpiar
              </Button>
            </div>

            <p className="catalog-feedback" aria-live="polite">
              {inputValue
                ? `Texto ingresado: ${inputValue}`
                : "Todavía no ingresaste ningún texto."}
            </p>
          </div>
        </Card>

        {/* SELECT */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">04</span>
              <h2>Select</h2>
            </div>

            <span className="catalog-card__type">Formularios</span>
          </div>

          <p className="catalog-card__description">
            Permite seleccionar una opción de una lista desplegable,
            incluyendo opciones deshabilitadas y mensajes de ayuda.
          </p>

          <div className="catalog-demo catalog-demo--vertical">
            <h3>Selector interactivo</h3>

            <Select
              label="Categoría"
              options={selectOptions}
              placeholder="Seleccioná una categoría"
              value={selectedOption}
              onChange={(event) => setSelectedOption(event.target.value)}
              hint="Seleccioná una de las categorías disponibles."
            />

            <p className="catalog-feedback" aria-live="polite">
              {selectedOption
                ? `Categoría seleccionada: ${
                    selectOptions.find(
                      (option) => option.value === selectedOption,
                    )?.label
                  }`
                : "No hay ninguna categoría seleccionada."}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOption("")}
            >
              Limpiar selección
            </Button>
          </div>
        </Card>

        {/* MODAL */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">05</span>
              <h2>Modal</h2>
            </div>

            <span className="catalog-card__type">Ventanas</span>
          </div>

          <p className="catalog-card__description">
            Presenta información o formularios en una ventana de diálogo.
            Administra la apertura, el cierre y el foco del teclado.
          </p>

          <div className="catalog-demo catalog-demo--vertical">
            <h3>Ejemplo interactivo</h3>

            <Button onClick={() => setIsModalOpen(true)}>
              Abrir ventana modal
            </Button>

            <p className="catalog-feedback">
              Probá cerrar la ventana con el botón de cierre o con la tecla
              Escape.
            </p>
          </div>

          <Modal
            open={isModalOpen}
            title="Ejemplo de ventana modal"
            onClose={() => setIsModalOpen(false)}
            size="md"
            footer={
              <Button onClick={() => setIsModalOpen(false)}>
                Entendido
              </Button>
            }
          >
            <p>
              Este es un ejemplo del componente Modal de Vitalia.
            </p>

            <p>
              Se pueden incorporar formularios, mensajes de confirmación o
              información adicional dentro de esta ventana.
            </p>
          </Modal>
        </Card>

        {/* STATUS BADGE */}
        <Card variant="outlined" padding="lg" className="catalog-card">
          <div className="catalog-card__header">
            <div>
              <span className="catalog-card__number">06</span>
              <h2>StatusBadge</h2>
            </div>

            <span className="catalog-card__type">Estados</span>
          </div>

          <p className="catalog-card__description">
            Identifica visualmente el estado de un registro mediante una
            etiqueta acompañada de texto descriptivo.
          </p>

          <div className="catalog-demo">
            <h3>Variantes disponibles</h3>

            <div className="catalog-badges">
              <div>
                <StatusBadge status="success">
                  Confirmado
                </StatusBadge>
                <span>Success</span>
              </div>

              <div>
                <StatusBadge status="warning">
                  Pendiente
                </StatusBadge>
                <span>Warning</span>
              </div>

              <div>
                <StatusBadge status="danger">
                  Ausente
                </StatusBadge>
                <span>Danger</span>
              </div>

              <div>
                <StatusBadge status="info">
                  En proceso
                </StatusBadge>
                <span>Info</span>
              </div>

              <div>
                <StatusBadge status="neutral">
                  Sin estado
                </StatusBadge>
                <span>Neutral</span>
              </div>
            </div>
          </div>

          <p className="catalog-feedback">
            El texto permite identificar cada estado sin depender únicamente
            del color.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default ComponentCatalogPage;

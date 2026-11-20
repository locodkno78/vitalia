import { useEffect, useRef, useId, type ReactNode } from "react";

import { X } from "lucide-react";

import "./Modal.css";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      // Guardamos el elemento que tenía el foco antes de abrir.
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      dialog.showModal();

      // Priorizamos un elemento con autofocus.
      // Si no existe, buscamos el primer control interactivo.

      const initialFocus =
        dialog.querySelector<HTMLElement>("[autofocus]") ??
        dialog.querySelector<HTMLElement>(
          "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ) ??
        dialog.querySelector<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );

      if (initialFocus) {
        initialFocus.focus();
      }
    }

    if (!open && dialog.open) {
      dialog.close();

      // Devolvemos el foco al elemento que abrió el modal.
      const previousElement = previousFocusRef.current;

      if (previousElement?.isConnected) {
        previousElement.focus();
      }

      previousFocusRef.current = null;
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}

export default Modal;


import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error detectado en la aplicación:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          <h2>Algo salió mal</h2>
          <p>No pudimos mostrar esta sección.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

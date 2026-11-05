import type { ReactNode } from "react";
import "./StatusBadge.css";

export type BadgeStatus =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  children: ReactNode;
  status?: BadgeStatus;
}

function StatusBadge({
  children,
  status = "neutral",
}: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {children}
    </span>
  );
}

export default StatusBadge;
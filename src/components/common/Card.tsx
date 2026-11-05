import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export type CardVariant = "default" | "outlined" | "elevated";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
}

function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const classes = [
    "card",
    `card--${variant}`,
    `card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

export default Card;
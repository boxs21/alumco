import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind CSS de forma segura.
 * Usa clsx para unir condicionales y twMerge para resolver conflictos de clases.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

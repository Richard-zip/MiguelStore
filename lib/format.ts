export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}

/** Formatea dígitos para mostrar separadores de miles mientras el usuario escribe (ej: 40000 -> "40.000") */
export function formatThousands(value: string | number): string {
  const digits = String(value).replace(/\D/g, "")
  if (!digits) return ""
  return new Intl.NumberFormat("es-CO").format(parseInt(digits, 10))
}

/** Extrae el número entero a partir de un texto formateado */
export function parseRawNumber(value: string): number {
  const digits = String(value).replace(/\D/g, "")
  return digits ? parseInt(digits, 10) : 0
}

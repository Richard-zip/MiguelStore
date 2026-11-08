import type { Product } from "./db/schema"
import { getCategoryLabel } from "./db/schema"
import { formatCOP } from "./format"

export const WHATSAPP_PHONE = "573172719261"
export const WHATSAPP_DISPLAY = "317 271 9261"

type WhatsAppOrderParams = {
  product: Product
  quantity?: number
}

/**
 * Genera el enlace directo al chat de WhatsApp con el número 573172719261
 * incluyendo nombre, precio, cantidad, descripción y la URL de la imagen
 * para que WhatsApp genere la previsualización visual del producto en el chat.
 */
export function buildWhatsAppLink({ product, quantity = 1 }: WhatsAppOrderParams): string {
  const categoryLabel = getCategoryLabel(product.category)
  const total = product.price * quantity

  const lines = [
    `¡Hola *La Tienda del Migue*! 👋`,
    ``,
    `Estoy interesado en comprar el siguiente producto:`,
    `🛍️ *Producto:* ${product.name}`,
    `📂 *Categoría:* ${categoryLabel}`,
    `💰 *Precio unitario:* ${formatCOP(product.price)}`,
    quantity > 1 ? `🔢 *Cantidad:* ${quantity}` : null,
    quantity > 1 ? `💵 *Total:* ${formatCOP(total)}` : null,
    ``,
    product.description ? `📝 *Descripción:*\n${product.description.trim()}` : null,
    ``,
    product.imageUrl ? `📸 *Foto del producto:*\n${product.imageUrl}` : null,
    ``,
    `¿Tienen disponibilidad inmediata para coordinar el pago y envío? Quedo atento, ¡gracias!`,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const encoded = encodeURIComponent(lines)
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`
}

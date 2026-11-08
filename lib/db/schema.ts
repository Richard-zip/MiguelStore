import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core"

export const CATEGORIES = [
  { id: "gorras", label: "Gorras" },
  { id: "billeteras", label: "Billeteras" },
  { id: "camisetas", label: "Camisetas" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

export function getCategoryLabel(category?: string | null): string {
  const match = CATEGORIES.find((c) => c.id === category?.toLowerCase())
  return match?.label ?? "Accesorio"
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("gorras"),
  price: integer("price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  imagePathname: text("image_pathname"),
  imageSideUrl: text("image_side_url"),
  imageSidePathname: text("image_side_pathname"),
  imageBackUrl: text("image_back_url"),
  imageBackPathname: text("image_back_pathname"),
  imageDetailUrl: text("image_detail_url"),
  imageDetailPathname: text("image_detail_pathname"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export type ProductAngle = {
  id: "front" | "side" | "back" | "detail"
  label: string
  url: string
}

export function getProductImages(product: Product): ProductAngle[] {
  const images: ProductAngle[] = []
  if (product.imageUrl) {
    images.push({ id: "front", label: "Frente", url: product.imageUrl })
  }
  if (product.imageSideUrl) {
    images.push({ id: "side", label: "Lado", url: product.imageSideUrl })
  }
  if (product.imageBackUrl) {
    images.push({ id: "back", label: "Detrás", url: product.imageBackUrl })
  }
  if (product.imageDetailUrl) {
    images.push({ id: "detail", label: "Detalle", url: product.imageDetailUrl })
  }
  return images
}

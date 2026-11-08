"use server"

import { db } from "@/lib/db"
import { products, CATEGORIES, type CategoryId } from "@/lib/db/schema"
import { isAdmin, signInAdmin, signOutAdmin } from "@/lib/admin-auth"
import { and, desc, eq, ilike } from "drizzle-orm"
import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado")
}

function normalizeCategory(raw: unknown): CategoryId {
  const val = String(raw ?? "").trim().toLowerCase()
  const exists = CATEGORIES.some((c) => c.id === val)
  return exists ? (val as CategoryId) : "gorras"
}

// ---- Auth ----

export async function loginAction(_prevState: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const ok = await signInAdmin(password)
  if (!ok) return { error: "Contraseña incorrecta" }
  revalidatePath("/admin")
  return { error: null }
}

export async function logoutAction() {
  await signOutAdmin()
  revalidatePath("/admin")
}

// ---- Reads ----

export async function getProducts(search?: string, category?: string) {
  const query = search?.trim()
  const cat = category?.trim().toLowerCase()

  const conditions = []
  if (query) {
    conditions.push(ilike(products.name, `%${query}%`))
  }
  if (cat && cat !== "all") {
    conditions.push(eq(products.category, cat))
  }

  if (conditions.length > 0) {
    return db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
  }

  return db.select().from(products).orderBy(desc(products.createdAt))
}

// ---- Writes (admin only) ----

export async function createProduct(_prevState: unknown, formData: FormData) {
  await requireAdmin()

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const rawCategory = formData.get("category")
  const rawPriceStr = String(formData.get("price") ?? "").replace(/\D/g, "")
  const rawStockStr = String(formData.get("stock") ?? "").trim()
  const file = formData.get("image") as File | null
  const fileSide = formData.get("image_side") as File | null
  const fileBack = formData.get("image_back") as File | null
  const fileDetail = formData.get("image_detail") as File | null

  // Validaciones obligatorias: no se pueden ir campos vacíos
  if (!name) {
    return { error: "El nombre es obligatorio y no puede estar vacío" }
  }

  if (!description) {
    return { error: "La descripción del producto es obligatoria" }
  }

  if (!rawCategory || !CATEGORIES.some((c) => c.id === String(rawCategory).toLowerCase())) {
    return { error: "Debes seleccionar una categoría válida" }
  }
  const category = normalizeCategory(rawCategory)

  if (!rawPriceStr) {
    return { error: "El precio es obligatorio" }
  }
  const price = Number.parseInt(rawPriceStr, 10)
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "El precio debe ser mayor a 0 COP" }
  }

  if (rawStockStr === "") {
    return { error: "El stock es obligatorio" }
  }
  const stock = Number.parseInt(rawStockStr, 10)
  if (!Number.isFinite(stock) || stock < 0) {
    return { error: "El stock no puede ser un valor negativo" }
  }

  if (!file || file.size === 0) {
    return { error: "La imagen frontal del producto es obligatoria" }
  }

  // Subir imagen frontal obligatoria
  const blob = await put(`products/${Date.now()}-front-${file.name}`, file, {
    access: "public",
  })
  const imageUrl = blob.url
  const imagePathname = blob.pathname

  // Subir ángulos adicionales si fueron proporcionados
  let imageSideUrl: string | null = null
  let imageSidePathname: string | null = null
  if (fileSide && fileSide.size > 0) {
    const blobSide = await put(`products/${Date.now()}-side-${fileSide.name}`, fileSide, {
      access: "public",
    })
    imageSideUrl = blobSide.url
    imageSidePathname = blobSide.pathname
  }

  let imageBackUrl: string | null = null
  let imageBackPathname: string | null = null
  if (fileBack && fileBack.size > 0) {
    const blobBack = await put(`products/${Date.now()}-back-${fileBack.name}`, fileBack, {
      access: "public",
    })
    imageBackUrl = blobBack.url
    imageBackPathname = blobBack.pathname
  }

  let imageDetailUrl: string | null = null
  let imageDetailPathname: string | null = null
  if (fileDetail && fileDetail.size > 0) {
    const blobDetail = await put(`products/${Date.now()}-detail-${fileDetail.name}`, fileDetail, {
      access: "public",
    })
    imageDetailUrl = blobDetail.url
    imageDetailPathname = blobDetail.pathname
  }

  await db.insert(products).values({
    name,
    description,
    category,
    price,
    stock,
    imageUrl,
    imagePathname,
    imageSideUrl,
    imageSidePathname,
    imageBackUrl,
    imageBackPathname,
    imageDetailUrl,
    imageDetailPathname,
  })
  revalidatePath("/admin")
  revalidatePath("/")
  return { error: null }
}

export async function updateProduct(_prevState: unknown, formData: FormData) {
  await requireAdmin()

  const id = Number.parseInt(String(formData.get("id") ?? "0"), 10)
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const rawCategory = formData.get("category")
  const rawPriceStr = String(formData.get("price") ?? "").replace(/\D/g, "")
  const rawStockStr = String(formData.get("stock") ?? "").trim()
  const file = formData.get("image") as File | null
  const fileSide = formData.get("image_side") as File | null
  const fileBack = formData.get("image_back") as File | null
  const fileDetail = formData.get("image_detail") as File | null

  if (!id) return { error: "Producto inválido" }

  if (!name) {
    return { error: "El nombre es obligatorio y no puede estar vacío" }
  }

  if (!description) {
    return { error: "La descripción del producto es obligatoria" }
  }

  if (!rawCategory || !CATEGORIES.some((c) => c.id === String(rawCategory).toLowerCase())) {
    return { error: "Debes seleccionar una categoría válida" }
  }
  const category = normalizeCategory(rawCategory)

  if (!rawPriceStr) {
    return { error: "El precio es obligatorio" }
  }
  const price = Number.parseInt(rawPriceStr, 10)
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "El precio debe ser mayor a 0 COP" }
  }

  if (rawStockStr === "") {
    return { error: "El stock es obligatorio" }
  }
  const stock = Number.parseInt(rawStockStr, 10)
  if (!Number.isFinite(stock) || stock < 0) {
    return { error: "El stock no puede ser negativo" }
  }

  const values: Record<string, unknown> = { name, description, category, price, stock }
  const [existing] = await db.select().from(products).where(eq(products.id, id))

  if (file && file.size > 0) {
    if (existing?.imagePathname) {
      try {
        await del(existing.imagePathname)
      } catch {
        // ignore
      }
    }
    const blob = await put(`products/${Date.now()}-front-${file.name}`, file, {
      access: "public",
    })
    values.imageUrl = blob.url
    values.imagePathname = blob.pathname
  }

  if (fileSide && fileSide.size > 0) {
    if (existing?.imageSidePathname) {
      try {
        await del(existing.imageSidePathname)
      } catch {
        // ignore
      }
    }
    const blobSide = await put(`products/${Date.now()}-side-${fileSide.name}`, fileSide, {
      access: "public",
    })
    values.imageSideUrl = blobSide.url
    values.imageSidePathname = blobSide.pathname
  }

  if (fileBack && fileBack.size > 0) {
    if (existing?.imageBackPathname) {
      try {
        await del(existing.imageBackPathname)
      } catch {
        // ignore
      }
    }
    const blobBack = await put(`products/${Date.now()}-back-${fileBack.name}`, fileBack, {
      access: "public",
    })
    values.imageBackUrl = blobBack.url
    values.imageBackPathname = blobBack.pathname
  }

  if (fileDetail && fileDetail.size > 0) {
    if (existing?.imageDetailPathname) {
      try {
        await del(existing.imageDetailPathname)
      } catch {
        // ignore
      }
    }
    const blobDetail = await put(`products/${Date.now()}-detail-${fileDetail.name}`, fileDetail, {
      access: "public",
    })
    values.imageDetailUrl = blobDetail.url
    values.imageDetailPathname = blobDetail.pathname
  }

  await db.update(products).set(values).where(eq(products.id, id))
  revalidatePath("/admin")
  revalidatePath("/")
  return { error: null }
}

export async function adjustStock(id: number, delta: number) {
  await requireAdmin()
  const [existing] = await db.select().from(products).where(eq(products.id, id))
  if (!existing) return
  const next = Math.max(0, existing.stock + delta)
  await db.update(products).set({ stock: next }).where(eq(products.id, id))
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function deleteProduct(id: number) {
  await requireAdmin()
  const [existing] = await db.select().from(products).where(eq(products.id, id))
  const pathnames = [
    existing?.imagePathname,
    existing?.imageSidePathname,
    existing?.imageBackPathname,
    existing?.imageDetailPathname,
  ].filter(Boolean) as string[]

  for (const path of pathnames) {
    try {
      await del(path)
    } catch {
      // ignore
    }
  }

  await db.delete(products).where(and(eq(products.id, id)))
  revalidatePath("/admin")
  revalidatePath("/")
}

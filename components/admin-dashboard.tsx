"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { Plus, Search, Pencil, Trash2, Minus, LogOut, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CATEGORIES, getCategoryLabel, type Product } from "@/lib/db/schema"
import { formatCOP } from "@/lib/format"
import { adjustStock, deleteProduct, logoutAction } from "@/app/actions/products"
import { ProductForm } from "./product-form"

export function AdminDashboard({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || (p.category?.toLowerCase() || "gorras") === selectedCategory
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [products, query, selectedCategory])

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    startTransition(() => deleteProduct(id))
  }

  function handleStock(id: number, delta: number) {
    startTransition(() => adjustStock(id, delta))
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-3.5 py-4 sm:px-8 sm:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div>
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
            La Tienda del Migue
          </span>
          <h1 className="font-sans text-2xl font-bold uppercase tracking-wide text-foreground sm:text-4xl">
            Gestión de <span className="text-primary">Stock</span>
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Administra tus gorras, billeteras y camisetas con control de inventario en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ExternalLink className="size-3.5" />
            <span>Ver tienda</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span>Salir</span>
            </button>
          </form>
        </div>
      </header>

      {/* Controls: Search, Category Filter, and Add Button */}
      <div className="mb-6 flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <button
            onClick={openNew}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-sans font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98] shadow-md shadow-primary/10 touch-manipulation"
          >
            <Plus className="size-4" />
            <span>Nuevo producto</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          {[{ id: "all", label: "Todas" }, ...CATEGORIES].map((tab) => {
            const isActive = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`shrink-0 rounded-full border px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center px-4">
          <p className="font-sans text-base sm:text-lg uppercase tracking-wide text-muted-foreground">
            {products.length === 0 ? "Aún no hay productos. Agrega el primero con el botón de arriba." : "Sin resultados con este filtro"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-lg bg-secondary border border-border/60">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-secondary px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {getCategoryLabel(product.category)}
                    </span>
                    {product.stock <= 0 ? (
                      <span className="rounded bg-destructive/20 text-destructive px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase">
                        Agotado
                      </span>
                    ) : product.stock <= 3 ? (
                      <span className="rounded bg-amber-500/20 text-amber-500 px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase">
                        Quedan {product.stock}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1 font-sans text-base sm:text-lg font-semibold uppercase tracking-wide text-foreground leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                  )}
                  <p className="font-sans font-bold text-primary mt-0.5">{formatCOP(product.price)}</p>
                </div>
              </div>

              {/* Fila de controles en móvil / lado derecho en desktop */}
              <div className="flex items-center justify-between gap-3 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
                {/* Control de Stock táctil */}
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline hidden">
                    Stock
                  </span>
                  <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
                    <button
                      onClick={() => handleStock(product.id, -1)}
                      disabled={pending || product.stock <= 0}
                      className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30 touch-manipulation active:scale-95"
                      aria-label="Bajar stock"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-9 text-center font-sans font-bold text-foreground text-sm">
                      {product.stock}
                    </span>
                    <button
                      onClick={() => handleStock(product.id, 1)}
                      disabled={pending}
                      className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30 touch-manipulation active:scale-95"
                      aria-label="Subir stock"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Acciones Editar y Eliminar */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(product)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary touch-manipulation"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={pending}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-40 touch-manipulation"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only sm:not-sr-only">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen ? <ProductForm product={editing} onClose={() => setFormOpen(false)} /> : null}
    </main>
  )
}

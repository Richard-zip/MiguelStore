"use client"

import { useMemo, useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { CATEGORIES, type Product } from "@/lib/db/schema"
import { ProductCard } from "./product-card"
import { ProductViewerModal } from "./product-viewer-modal"

export function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length }
    for (const cat of CATEGORIES) {
      counts[cat.id] = 0
    }
    for (const p of products) {
      const cat = p.category?.toLowerCase() || "gorras"
      counts[cat] = (counts[cat] || 0) + 1
    }
    return counts
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || (p.category?.toLowerCase() || "gorras") === selectedCategory
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [products, query, selectedCategory])

  const filterTabs = [
    { id: "all", label: "Todo" },
    ...CATEGORIES,
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-primary">
            Colección Exclusiva
          </span>
          <h2 className="mt-1 font-sans text-3xl font-bold uppercase tracking-wide text-foreground sm:text-4xl">
            Catálogo Oficial
          </h2>
          <p className="mt-1 text-muted-foreground">
            Gorras, billeteras y camisetas premium. Diseños exclusivos y calidad garantizada.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = selectedCategory === tab.id
          const count = categoryCounts[tab.id] ?? 0
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-black/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Results summary when filtering */}
      {(query || selectedCategory !== "all") && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Mostrando {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          </span>
          <button
            onClick={() => {
              setQuery("")
              setSelectedCategory("all")
            }}
            className="font-sans font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Products Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center px-4">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <p className="font-sans text-lg font-bold uppercase tracking-wide text-foreground">
            {products.length === 0 ? "Próximamente nueva colección" : "No se encontraron productos"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {products.length === 0
              ? "Estamos preparando los mejores productos de gorras, billeteras y camisetas para ti."
              : "Intenta con otro término de búsqueda o selecciona otra categoría."}
          </p>
          {(query || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setQuery("")
                setSelectedCategory("all")
              }}
              className="mt-4 rounded-lg border border-border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Ver todos los productos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Visor interactivo modal */}
      {selectedProduct && (
        <ProductViewerModal
          product={selectedProduct}
          products={filtered}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
        />
      )}
    </div>
  )
}

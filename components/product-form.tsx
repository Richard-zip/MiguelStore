"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { X, Upload, AlertCircle } from "lucide-react"
import { CATEGORIES, type Product } from "@/lib/db/schema"
import { formatThousands, parseRawNumber } from "@/lib/format"
import { createProduct, updateProduct } from "@/app/actions/products"

type Props = {
  product?: Product | null
  onClose: () => void
}

export function ProductForm({ product, onClose }: Props) {
  const isEdit = !!product
  const action = isEdit ? updateProduct : createProduct
  const [state, formAction, pending] = useActionState(action, { error: null } as { error: string | null })
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null)
  const [previewSide, setPreviewSide] = useState<string | null>(product?.imageSideUrl ?? null)
  const [previewBack, setPreviewBack] = useState<string | null>(product?.imageBackUrl ?? null)
  const [previewDetail, setPreviewDetail] = useState<string | null>(product?.imageDetailUrl ?? null)
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category ?? "gorras")
  
  // Manejo de precio con formateo automático (separadores de miles)
  const initialPrice = product?.price && product.price > 0 ? formatThousands(product.price) : ""
  const [formattedPrice, setFormattedPrice] = useState<string>(initialPrice)
  const [rawPrice, setRawPrice] = useState<number>(product?.price ?? 0)
  const [clientError, setClientError] = useState<string | null>(null)

  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onClose()
    }
    wasPending.current = pending
  }, [pending, state, onClose])

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, "")
    const num = parseRawNumber(digitsOnly)
    setRawPrice(num)
    setFormattedPrice(formatThousands(digitsOnly))
    if (clientError) setClientError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setClientError(null)

    // Validar precio > 0
    if (rawPrice <= 0) {
      e.preventDefault()
      setClientError("El precio debe ser mayor a 0 COP")
      return
    }

    // Validar imagen obligatoria si es nuevo producto
    if (!isEdit && !preview) {
      e.preventDefault()
      setClientError("La imagen del producto es obligatoria")
      return
    }
  }

  const activeError = clientError || state?.error

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs" onClick={onClose}>
      <div
        className="max-h-[94vh] sm:max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl sm:rounded-xl border border-border bg-card p-4 sm:p-6 shadow-2xl overscroll-contain pb-8 sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3 sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-wide text-foreground">
              {isEdit ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Campos marcados con <span className="text-primary font-bold">*</span> son obligatorios.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground touch-manipulation"
            aria-label="Cerrar formulario"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
              Categoría <span className="text-primary">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const checked = selectedCategory === cat.id
                return (
                  <label
                    key={cat.id}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border py-2.5 px-2 text-center font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                      checked
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={checked}
                      required
                      onChange={() => setSelectedCategory(cat.id)}
                      className="sr-only"
                    />
                    {cat.label}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Nombre */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
              Nombre del producto <span className="text-primary">*</span>
            </span>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              placeholder={
                selectedCategory === "gorras"
                  ? "Ej: Gorra LA Azul Original"
                  : selectedCategory === "billeteras"
                  ? "Ej: Billetera Cuero Café Slim"
                  : "Ej: Camiseta Oversize Negra Heavy Cotton"
              }
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          {/* Descripción */}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
              Descripción del producto <span className="text-primary">*</span>
            </span>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={product?.description ?? ""}
              placeholder="Detalla el material, ajuste, estilo, acabados o características de este producto..."
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary resize-none"
            />
          </label>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
                Precio COP <span className="text-primary">*</span>
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans font-bold text-primary">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formattedPrice}
                  onChange={handlePriceChange}
                  placeholder="45.000"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-7 pr-3 text-foreground font-sans font-semibold outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                {/* Input oculto con el valor numérico para el FormData */}
                <input type="hidden" name="price" value={rawPrice > 0 ? rawPrice : ""} />
              </div>
              <span className="text-[10px] text-muted-foreground">Mayor a $ 0 COP</span>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground">
                Stock <span className="text-primary">*</span>
              </span>
              <input
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={product?.stock ?? ""}
                placeholder="10"
                className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground font-sans font-semibold outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <span className="text-[10px] text-muted-foreground">Unidades disponibles</span>
            </label>
          </div>

          {/* Fotos por Ángulo del Producto */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-background/50 p-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wide text-foreground">
                  Fotos del producto <span className="text-primary">*</span>
                </span>
                <span className="text-[10px] rounded bg-primary/10 text-primary px-2 py-0.5 font-sans font-bold uppercase">
                  Mínimo 1 foto
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Al menos debes subir la foto principal (Frente). No importa si no tienes más ángulos, los demás son opcionales.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* 1. Frente (Obligatoria: Mínimo 1 foto) */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-foreground">
                  1. Frente / Principal {!isEdit && <span className="text-primary">*</span>}
                </span>
                <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Frente" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <Upload className="size-4" />
                      <span className="text-[10px] uppercase font-sans">Principal *</span>
                    </div>
                  )}
                </div>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  required={!isEdit && !preview}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setPreview(URL.createObjectURL(f))
                      if (clientError) setClientError(null)
                    }
                  }}
                  className="w-full text-[10px] text-muted-foreground file:mr-1.5 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:font-sans file:text-[10px] file:uppercase file:text-foreground cursor-pointer"
                />
              </div>

              {/* 2. Lado / Perfil (Opcional) */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-foreground">
                    2. Lado
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans uppercase">Opcional</span>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                  {previewSide ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewSide} alt="Lado" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <Upload className="size-4" />
                      <span className="text-[10px] uppercase font-sans">Lateral</span>
                    </div>
                  )}
                </div>
                <input
                  name="image_side"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPreviewSide(URL.createObjectURL(f))
                  }}
                  className="w-full text-[10px] text-muted-foreground file:mr-1.5 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:font-sans file:text-[10px] file:uppercase file:text-foreground cursor-pointer"
                />
              </div>

              {/* 3. Detrás / Posterior (Opcional) */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-foreground">
                    3. Detrás
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans uppercase">Opcional</span>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                  {previewBack ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewBack} alt="Detrás" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <Upload className="size-4" />
                      <span className="text-[10px] uppercase font-sans">Posterior</span>
                    </div>
                  )}
                </div>
                <input
                  name="image_back"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPreviewBack(URL.createObjectURL(f))
                  }}
                  className="w-full text-[10px] text-muted-foreground file:mr-1.5 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:font-sans file:text-[10px] file:uppercase file:text-foreground cursor-pointer"
                />
              </div>

              {/* 4. Detalle / Acabado (Opcional) */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-foreground">
                    4. Detalle
                  </span>
                  <span className="text-[9px] text-muted-foreground font-sans uppercase">Opcional</span>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                  {previewDetail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewDetail} alt="Detalle" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <Upload className="size-4" />
                      <span className="text-[10px] uppercase font-sans">Interior</span>
                    </div>
                  )}
                </div>
                <input
                  name="image_detail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPreviewDetail(URL.createObjectURL(f))
                  }}
                  className="w-full text-[10px] text-muted-foreground file:mr-1.5 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:font-sans file:text-[10px] file:uppercase file:text-foreground cursor-pointer"
                />
              </div>
            </div>
          </div>

          {activeError ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{activeError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-3 w-full rounded-xl bg-primary px-4 py-3 font-sans font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/10 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {pending ? "Guardando producto..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </form>
      </div>
    </div>
  )
}

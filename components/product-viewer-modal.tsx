"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  MessageCircle,
  Share2,
  Check,
  ShieldCheck,
  Sparkles,
  Truck,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCw,
} from "lucide-react"
import { getCategoryLabel, getProductImages, type Product } from "@/lib/db/schema"
import { formatCOP } from "@/lib/format"
import { buildWhatsAppLink, WHATSAPP_DISPLAY } from "@/lib/whatsapp"

type Props = {
  product: Product | null
  products: Product[]
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export function ProductViewerModal({ product, products, onClose, onSelectProduct }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [copied, setCopied] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0)

  // Lista de ángulos / vistas disponibles para este producto
  const angles = product ? getProductImages(product) : []
  const activeImage = angles[selectedAngleIndex]?.url ?? product?.imageUrl ?? null
  const activeAngle = angles[selectedAngleIndex] ?? { label: "Frente" }

  // Índice actual para navegación
  const currentIndex = product ? products.findIndex((p) => p.id === product.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < products.length - 1

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      onSelectProduct(products[currentIndex - 1])
      setQuantity(1)
      setIsZoomed(false)
      setSelectedAngleIndex(0)
    }
  }, [hasPrev, currentIndex, products, onSelectProduct])

  const goToNext = useCallback(() => {
    if (hasNext) {
      onSelectProduct(products[currentIndex + 1])
      setQuantity(1)
      setIsZoomed(false)
      setSelectedAngleIndex(0)
    }
  }, [hasNext, currentIndex, products, onSelectProduct])

  // Atajos de teclado: Escape, ArrowLeft, ArrowRight, y números 1-4 para ángulos
  useEffect(() => {
    if (!product) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        goToPrev()
      } else if (e.key === "ArrowRight") {
        goToNext()
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        if (angles[idx]) {
          setSelectedAngleIndex(idx)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [product, onClose, goToPrev, goToNext, angles])

  // Restablecer cantidad, zoom y ángulo al cambiar de producto
  useEffect(() => {
    setQuantity(1)
    setIsZoomed(false)
    setCopied(false)
    setSelectedAngleIndex(0)
  }, [product?.id])

  if (!product) return null

  const soldOut = product.stock <= 0
  const maxAvailable = Math.max(1, product.stock)
  const totalPrice = product.price * quantity

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  function handleRotateAngle() {
    if (angles.length > 1) {
      setSelectedAngleIndex((prev) => (prev + 1) % angles.length)
      setIsZoomed(false)
    }
  }

  function handleWhatsAppOrder() {
    if (!product) return
    const url = buildWhatsAppLink({ product, quantity })
    window.open(url, "_blank")
  }

  function handleCopyShare() {
    const text = `Mira este producto en La Tienda del Migue: ${product?.name} - ${formatCOP(product?.price ?? 0)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${product.name}`}
    >
      <div
        className={`relative flex flex-col w-full overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ${
          isFullscreen ? "max-w-[96vw] h-[94vh]" : "max-w-4xl h-[94vh] sm:h-auto sm:max-h-[92vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar modal */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 sm:px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
              La Tienda del Migue
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {currentIndex + 1} de {products.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:inline-flex rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              title={isFullscreen ? "Restaurar tamaño" : "Pantalla completa"}
              aria-label="Alternar pantalla completa"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
              title="Compartir producto"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
              <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Compartir"}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive cursor-pointer touch-manipulation"
              aria-label="Cerrar visor"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-y-auto overscroll-contain">
          {/* Lado izquierdo: Visor interactivo multi-ángulo con lupa */}
          <div className="relative flex flex-col items-center justify-between bg-black/40 p-3 sm:p-6 select-none border-b md:border-b-0 md:border-r border-border gap-3 sm:gap-4">
            {/* Navegación anterior / siguiente entre productos */}
            {hasPrev && (
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex size-9 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur-xs transition-all hover:scale-110 hover:border-primary hover:text-primary active:scale-95 cursor-pointer touch-manipulation"
                aria-label="Producto anterior"
                title="Producto anterior (Flecha izquierda)"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}

            {hasNext && (
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex size-9 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur-xs transition-all hover:scale-110 hover:border-primary hover:text-primary active:scale-95 cursor-pointer touch-manipulation"
                aria-label="Producto siguiente"
                title="Producto siguiente (Flecha derecha)"
              >
                <ChevronRight className="size-5" />
              </button>
            )}

            {/* Selector de Ángulos (Tabs superiores) solo si tiene más de 1 ángulo */}
            {angles.length > 1 && (
              <div className="flex w-full items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                  {angles.map((angle, index) => {
                    const isActive = selectedAngleIndex === index
                    return (
                      <button
                        key={angle.id}
                        onClick={() => {
                          setSelectedAngleIndex(index)
                          setIsZoomed(false)
                        }}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1 font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                            : "border-border/80 bg-card/90 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <span>{angle.label}</span>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleRotateAngle}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                  title="Girar al siguiente ángulo"
                >
                  <RotateCw className="size-3" />
                  <span className="hidden sm:inline">Girar</span>
                </button>
              </div>
            )}

            {/* Contenedor interactivo de la imagen */}
            <div
              className="relative aspect-square w-full max-w-[280px] sm:max-w-md overflow-hidden rounded-xl border border-border/60 bg-secondary cursor-crosshair group shadow-inner touch-manipulation"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {activeImage ? (
                <>
                  <Image
                    key={activeImage}
                    src={activeImage}
                    alt={`${product.name} - Vista ${activeAngle.label}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover transition-transform duration-150 ease-out ${
                      isZoomed ? "scale-225 pointer-events-none" : "scale-100"
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                  />

                  {/* Overlay indicador de ángulo activo solo si tiene más de 1 ángulo */}
                  {angles.length > 1 && (
                    <div className="pointer-events-none absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      <span>Ángulo: {activeAngle.label}</span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-wider text-white/90 backdrop-blur-xs transition-opacity group-hover:opacity-0">
                    <ZoomIn className="size-3 text-primary" />
                    <span>Zoom</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span className="font-sans text-xs uppercase tracking-widest">Sin imagen disponible</span>
                </div>
              )}

              {/* Badges de estado sobre la imagen */}
              <div className="absolute left-3 top-3 flex flex-col gap-1.5 pointer-events-none max-w-[85%]">
                {soldOut ? (
                  <span className="rounded-full bg-destructive px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    Agotado
                  </span>
                ) : product.stock <= 3 ? (
                  <>
                    <span className="rounded-md bg-amber-500 text-black px-2.5 py-1 font-sans text-[11px] font-black uppercase tracking-tight shadow-md">
                      ¡Corre, compra la tuya antes de que se acabe!
                    </span>
                    <span className="rounded-full bg-black/80 text-white px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      Solo {product.stock} en stock
                    </span>
                  </>
                ) : (
                  <span className="rounded-full bg-primary px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                    {product.stock} disponibles
                  </span>
                )}
              </div>
            </div>

            {/* Miniaturas de ángulos inferiores */}
            {angles.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {angles.map((angle, index) => {
                  const isActive = selectedAngleIndex === index
                  return (
                    <button
                      key={angle.id}
                      onClick={() => {
                        setSelectedAngleIndex(index)
                        setIsZoomed(false)
                      }}
                      className={`relative size-14 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                        isActive
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-border/70 opacity-60 hover:opacity-100 hover:border-primary/50"
                      }`}
                      aria-label={`Ver ángulo ${angle.label}`}
                      title={`Ver ${angle.label}`}
                    >
                      <Image
                        src={angle.url}
                        alt={angle.label}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-sans font-bold uppercase text-center text-white py-0.5">
                        {angle.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <p className="text-center text-[11px] text-muted-foreground">
              Usa las flechas <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">←</kbd>{" "}
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">→</kbd> para navegar productos
            </p>
          </div>

          {/* Lado derecho: Detalles, selector interactivo y botón de compra */}
          <div className="flex flex-col justify-between p-4 sm:p-8 pb-8 sm:pb-8">
            <div className="flex flex-col gap-4">
              {/* Categoría y Nombre */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded-md bg-primary/10 border border-primary/30 px-3 py-1 font-sans text-xs font-bold uppercase tracking-widest text-primary">
                    {getCategoryLabel(product.category)}
                  </span>
                  {!soldOut && (
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Stock: <strong className="text-foreground">{product.stock} un.</strong>
                    </span>
                  )}
                </div>
                <h1 className="mt-2.5 font-sans text-2xl sm:text-3xl font-extrabold uppercase leading-tight tracking-wide text-foreground">
                  {product.name}
                </h1>
              </div>

              {/* Alerta de pocas unidades o agotado */}
              {soldOut ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive uppercase tracking-wide">
                  Agotado actualmente
                </div>
              ) : product.stock <= 3 ? (
                <div className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-3 py-2.5 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span className="font-sans text-xs font-bold text-amber-500 uppercase tracking-wide">
                    ¡Corre, compra la tuya antes de que se acabe! (Solo quedan {product.stock} unidades)
                  </span>
                </div>
              ) : null}

              {/* Descripción del producto */}
              {product.description && (
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                    Descripción
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Precio destacado */}
              <div className="flex items-baseline gap-3 border-y border-border py-3.5">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-primary">
                  {formatCOP(product.price)}
                </span>
                <span className="text-xs uppercase font-sans tracking-wider text-muted-foreground">
                  COP por unidad
                </span>
              </div>

              {/* Selector interactivo de cantidad */}
              {!soldOut && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-foreground">
                      Cantidad
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">
                      (Máx. {product.stock} un.)
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center rounded-lg border border-border bg-background">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex size-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30 cursor-pointer"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-12 text-center font-sans text-lg font-bold text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                        disabled={quantity >= maxAvailable}
                        className="flex size-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30 cursor-pointer"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] font-sans uppercase tracking-wider text-muted-foreground">
                        Total calculado
                      </span>
                      <span className="font-sans text-xl font-bold text-foreground">
                        {formatCOP(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sellos de garantía y confianza */}
              <div className="mt-2 grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    100% Original
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <Truck className="size-4 text-primary shrink-0" />
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    Envíos Seguros
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    Calidad Premium
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <span className="text-primary font-bold font-sans text-xs shrink-0">✓</span>
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    Atención Directa
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de acción principal: Comprar por WhatsApp */}
            <div className="mt-6 flex flex-col gap-2.5">
              {soldOut ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-secondary py-3.5 font-sans font-bold uppercase tracking-wider text-muted-foreground opacity-60 cursor-not-allowed text-center"
                >
                  Producto no disponible actualmente
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-900/50 active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle className="size-5 fill-white text-emerald-600" />
                  <span>Comprar por WhatsApp ({formatCOP(totalPrice)})</span>
                </button>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Te dirigirá directamente al WhatsApp oficial: <strong className="text-foreground">+{WHATSAPP_DISPLAY}</strong> con la foto y detalles del producto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
